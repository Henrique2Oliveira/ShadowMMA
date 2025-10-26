# Firebase Cloud Functions — `src/index.ts`

This document explains what each part of `functions/src/index.ts` does. At the top you’ll find a quick list of functions with a short resumo (summary), followed by detailed sections.
~  *Last Update: 23/09/2025* 

## Function list (Resumo)

- getUserData (HTTP)
  - Authenticated GET. Serves sanitized user profile with ETag caching and a short in-memory cache to reduce reads.
- updateLastLogin (HTTP, POST)
  - Authenticated. Updates `lastLoginAt`, maintains `loginStreak` and `maxLoginStreak` with same-day no-op optimization.
- restoreUserLivesDaily (Scheduler)
  - Runs daily at 00:00 UTC. Resets all free users’ `fightsLeft` to 1.
- resetWeeklyMissionProgress (Scheduler)
  - Runs weekly on Monday 00:00 UTC. Resets `totalFightRounds` and `totalFightTime` to 0 for users with progress.
- handleGameOver (HTTP, POST)
  - Authenticated. Finalizes a fight: computes XP (level-scaled + random + length bonus), clamps, updates lifetime/weekly stats, resets current fight, returns level-up info and unlocked combos.
- startFight (HTTP, POST)
  - Authenticated. Starts a fight. Validates plan/fightsLeft, picks combos (specific, custom IDs, or random across types filtered by user level), stores current fight config (rounds and total minutes), and decrements `fightsLeft` for free users.
- createUser (HTTP, POST)
  - Public endpoint with input validation. Creates Firebase Auth user and a Firestore user document with sensible defaults (starter XP, streak, counters).
- getCombosMeta (HTTP, GET/POST)
  - Authenticated metadata endpoint. Flattens `combos/<category>.levels` into a list with optional `moveType` and `comboId` filters; sorted by level/name.
- onSubscriptionNotification (Pub/Sub v2)
  - Placeholder. RevenueCat integration pending.
- linkPlayPurchase (HTTP)
  - Placeholder. Returns HTTP 501; subscriptions are temporarily disabled while moving to RevenueCat.

---

## Common setup and constants

- initializeApp() and Admin SDKs
  - Initializes Firebase Admin SDK once per instance. Exposes `db` (Firestore) and `auth` (Authentication).
- setGlobalOptions({ maxInstances: 10 })
  - Caps concurrent containers per function to control costs.
- Game progression caps
  - MAX_LEVEL = 100; MAX_XP = 10,000. XP and level are clamped server-side to avoid overflow.
- In-memory user cache (per warm instance)
  - `userDataCache` caches the last served user payload for 15 seconds (USER_CACHE_TTL_MS) with an ETag to reduce Firestore reads and bandwidth.
- Time normalization helper
  - `normalizePerFightMinutes(val)` ensures all per-fight durations are treated as minutes. Values > 45 are assumed to be seconds and are converted to minutes.

## getUserData (HTTP)

- Trigger: HTTPS onRequest
- Auth: Required (Firebase ID token in `Authorization: Bearer <token>`)
- Behavior:
  - Checks a short in-memory cache; if present and fresh, optionally responds 304 on ETag match or returns cached data.
  - Otherwise reads `/users/{uid}`, clamps XP at MAX_XP and normalizes `currentFightTime` to minutes (opportunistically fixes stored value if needed).
  - Builds a safe response with defaults for missing fields: name, xp, plan, fightsLeft, streaks, and fight time/round counters.
  - Generates an ETag (sha1 of the payload). If client’s `If-None-Match` equals the ETag, replies 304 with no body; else returns 200 with JSON and the ETag.
  - Headers: sets `ETag` and `Cache-Control: private, max-age=10`.

## updateLastLogin (HTTP, POST)

- Trigger: HTTPS onRequest (POST)
- Auth: Required
- Behavior:
  - Loads `/users/{uid}`; computes `loginStreak` based on day difference from last login:
    - Same day: no update (streak unchanged).
    - Next day: increment.
    - Missed days: reset to 1.
  - Updates `maxLoginStreak` if the new streak surpasses the previous max.
  - Writes `lastLoginAt = serverTimestamp()` and updated streaks only when necessary.
  - Returns `{ success, loginStreak, maxLoginStreak, updated }`.

## restoreUserLivesDaily (Scheduler)

- Trigger: Cloud Scheduler (CRON `0 0 * * *`, UTC)
- Behavior:
  - Iterates all users and sets `fightsLeft = 1` using a batch write (free daily fight).
  - Notes: Future TODOs hinted in comments (e.g., conditional restore or streak tweaks).

## resetWeeklyMissionProgress (Scheduler)

- Trigger: Cloud Scheduler (CRON `0 0 * * 1`, UTC)
- Behavior:
  - Resets weekly mission counters `totalFightRounds` and `totalFightTime` to 0 for users that have progress.
  - Uses a batch write and logs the number of updated users.

## handleGameOver (HTTP, POST)

- Trigger: HTTPS onRequest (POST)
- Auth: Required
- Behavior:
  - Transactionally reads `/users/{uid}`; ensures `playing === true` to avoid race conditions and double-counting.
  - Computes XP gain with:
    - Base XP decreases with current level: `baseXP = max(20, 120 - level*4)`.
    - Random variation: ±25% of base.
    - Length multiplier: bonus from extra rounds and time (minutes) with caps; final multiplier clamped to 2.5.
  - Clamps new XP at MAX_XP, updates:
    - `playing: false`
    - Weekly: `totalFightRounds += currentFightRound`, `totalFightTime += currentFightTime`
    - Lifetime: `lifetimeFightRounds += currentFightRound`, `lifetimeFightTime += currentFightTime`
    - Resets `currentFightRound` and `currentFightTime` to 0.
  - Returns a detailed response including old/new XP, level-up status, and an `xpBreakdown`.
  - If level-up occurred, attempts to fetch unlocked combos for the new level from `combos/0` and returns their names (best-effort; non-fatal on failure).

## startFight (HTTP, POST)

- Trigger: HTTPS onRequest (POST)
- Auth: Required
- Inputs (body or query):
  - category (default '0')
  - comboId (optional: fetch a specific combo)
  - selectedComboIds (optional: comma-separated; Pro-only explicit selection)
  - moveTypes or movesMode (string or array; e.g., "Punches,Kicks"; defaults to Punches)
  - randomFight (boolean; if true, returns all eligible combos, subject to an optional limit)
  - randomLimit/limit (optional cap for randomFight; clamped 3..50; default 20)
  - fightRounds (1..7; default 1) and fightTimePerRound (in minutes, 1..5; converts seconds if a value > 10 is received)
- Behavior:
  - Validates user exists and plan permissions:
    - Free users must have `fightsLeft > 0` or receive 403.
  - Loads `combos/<category>` and operates in one of three modes:
    1) Custom-selected (selectedComboIds): Pro-only; resolves IDs across all types/levels (gated by user level). Returns chosen combos in requested order.
    2) Specific combo (comboId): Finds and returns only that combo, optionally constrained by the specified moveType.
    3) Random selection: Builds type pools filtered by user level. Picks a balanced set (3–4 default) with at least one highest-level combo. If `randomFight=true`, returns all eligible combos (shuffled), capped by `randomLimit` (default 20) with per-type balancing.
  - Updates user document:
    - `playing: true`
    - For free plan: decrements `fightsLeft` by 1.
    - Stores current fight configuration: `currentFightRound = fightRounds`, `currentFightTime = round(minutesPerRound * rounds)` as TOTAL MINUTES.
  - Returns `{ combos, fightsLeft, randomFight, appliedLimit, totalEligible }` depending on the mode.

## createUser (HTTP, POST)

- Trigger: HTTPS onRequest (POST)
- Auth: Not required (this endpoint itself creates the auth user)
- Inputs: `{ email, password, name }`
- Validation:
  - email must look valid; password length >= 6; name length 2..50.
- Behavior:
  - Calls `auth.createUser` and then initializes `/users/{uid}` with defaults:
    - `xp = min(130, MAX_XP)` (Level 1 with some progress)
    - `plan = 'free'`, `fightsLeft = 4`, `playing = false`
    - Streaks and counters initialized to zero/one as appropriate
    - `createdAt` and `lastLoginAt` set via server timestamps
  - Response: `{ success: true }` or an error with code/message.

## getCombosMeta (HTTP, GET/POST)

- Trigger: HTTPS onRequest (GET or POST)
- Auth: Required
- Inputs (query or body): `category` (defaults to '0'), optional `comboId`, optional `moveType`.
- Behavior:
  - Loads `combos/<category>`, flattens `levels` objects (by move type) into an array of items with:
    - `id` (stable composed key), `name`, `level`, `type`, `categoryId`, `categoryName`, `comboId`.
  - Optional filtering by exact `moveType` and/or `comboId`.
  - Sorted by level (asc), then name (asc).

## onSubscriptionNotification (Pub/Sub v2)

- Trigger: `onMessagePublished('shadow-mma-subscriptions')`
- Behavior: No-op placeholder; logs a warning. Subscriptions are being migrated to RevenueCat.

## linkPlayPurchase (HTTP)

- Trigger: HTTPS onRequest
- Behavior: Returns HTTP 501 with a JSON message indicating subscriptions are temporarily disabled during migration.

---

## Notes and implementation details

- ETag and client caching
  - `getUserData` supports conditional requests via `If-None-Match`; returns 304 when content hasn’t changed. The server additionally provides a short `Cache-Control` hint.
- Minutes vs. seconds
  - All fight duration metrics are normalized and stored in MINUTES to simplify UI logic and maintain consistency.
- Level calculations
  - The level is `floor(xp / 100)`, but XP is clamped to MAX_XP to cap progression at MAX_LEVEL. UI stays stable since MAX_XP is a multiple of 100.
- Transactions and concurrency
  - `handleGameOver` uses a Firestore transaction to avoid race conditions (e.g., double XP on concurrent requests).
- Error handling
  - All HTTP endpoints return structured error messages with appropriate HTTP status codes; scheduler functions log errors.

---

## Quick reference (fields on /users/{uid})

- Identity/plan: `email`, `name`, `plan` ('free' | 'pro' | 'annual')
- Progression: `xp` (0..10000), level = floor(xp/100)
- Fights: `fightsLeft`, `playing`
- Streaks: `loginStreak`, `maxLoginStreak`, `lastLoginAt`, `createdAt`
- Current fight: `currentFightRound`, `currentFightTime` (total minutes)
- Weekly mission: `totalFightRounds`, `totalFightTime` (reset weekly)
- Lifetime: `lifetimeFightRounds`, `lifetimeFightTime` (never reset)

If you need usage examples (cURL or client calls) or want this documentation mirrored in your main README, let me know and I’ll add them.
