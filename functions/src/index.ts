
import * as crypto from 'crypto';
import { initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { setGlobalOptions } from "firebase-functions";
import { onRequest } from "firebase-functions/https";
import * as logger from "firebase-functions/logger";
import { onSchedule } from "firebase-functions/scheduler";
// Start writing functions
// https://firebase.google.com/docs/functions/typescript

//firebase deploy --only function  :: code to :: deploy only functions 

// For cost control, you can set the maximum number of containers that can be
// running at the same time. This helps mitigate the impact of unexpected
// traffic spikes by instead downgrading performance. This limit is a
// per-function limit. You can override the limit for each function using the
// `maxInstances` option in the function's options, e.g.
// `onRequest({ maxInstances: 5 }, (req, res) => { ... })`.
// NOTE: setGlobalOptions does not apply to functions using the v1 API. V1
// functions should each use functions.runWith({ maxInstances: 10 }) instead.
// In the v1 API, each function can only serve one request per container, so
// this will be the maximum concurrent request count.

setGlobalOptions({ maxInstances: 10 });

//// Initialize Admin SDK
initializeApp();

const db = getFirestore();
const auth = getAuth();

// --- Game progression caps ---
// Hard cap user progression at level 100.
// Level formula remains floor(xp / 100) but we never allow level to exceed MAX_LEVEL
// and we clamp XP so it cannot progress beyond MAX_XP (exact multiple for stable UI logic).
const MAX_LEVEL = 100;
const MAX_XP = MAX_LEVEL * 100; // e.g. level 100 shows as exactly 100 (no overflow remainder)

// --- Simple in-memory cache (persists per warm Cloud Function instance) ---
// Reduces Firestore reads if the same user requests data repeatedly in a short window.
// NOTE: This does NOT eliminate function invocation cost, but saves reads + latency.
interface CachedUserData { data: any; etag: string; fetchedAt: number; }
const userDataCache: Record<string, CachedUserData> = {};
const USER_CACHE_TTL_MS = 15_000; // 15s server-side TTL (tune as needed)

// Subscriptions mapping removed (moving to RevenueCat). No-op placeholders only below.

// --- Time normalization helpers ---
// We persist all fight time metrics in MINUTES. Some older data might have seconds.
// For per-fight totals (currentFightTime), anything larger than 45 is very likely seconds
// because our max configured fight length is 7 rounds x 5 minutes = 35 minutes.
const normalizePerFightMinutes = (val: any): number => {
  let n = typeof val === 'number' ? val : parseFloat(val ?? '0');
  if (!isFinite(n) || n < 0) return 0;
  // If value looks like seconds for a single fight, convert to minutes.
  if (n > 45) return Math.round(n / 60);
  return Math.round(n); // keep minutes as integer for consistency
};

// Cloud function to handle user login update with caching + ETag conditional response
export const getUserData = onRequest(async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      res.status(401).send("Unauthorized: Missing or invalid token");
      return;
    }

    const idToken = authHeader.split("Bearer ")[1];
    const decodedToken = await auth.verifyIdToken(idToken);
    const uid = decodedToken.uid;

    const ifNoneMatch = req.headers['if-none-match'];

    // 1. Serve fresh cache (still valid) instantly without Firestore read
    const cached = userDataCache[uid];
    if (cached && (Date.now() - cached.fetchedAt) < USER_CACHE_TTL_MS) {
      // If client already has the same ETag -> 304
      if (ifNoneMatch && ifNoneMatch === cached.etag) {
        res.setHeader('ETag', cached.etag);
        res.status(304).end();
        return;
      }
      res.setHeader('ETag', cached.etag);
      res.setHeader('Cache-Control', 'private, max-age=10'); // client hint (short)
      res.status(200).json({ success: true, data: cached.data, cached: true });
      return;
    }

    // 2. Fetch from Firestore (or refresh if cache stale)
    const userRef = db.collection("users").doc(uid);
    const userDoc = await userRef.get();
    if (!userDoc.exists) {
      res.status(404).json({ success: false, error: { code: 'not-found', message: 'User data not found' } });
      return;
    }

  const userData = userDoc.data();
  // Clamp XP server-side before exposing (in case of historical overflow)
  let safeXp: number = userData?.xp || 0;
  if (safeXp > MAX_XP) {
    safeXp = MAX_XP;
    // Opportunistic background fix (non-blocking)
    try { await userRef.update({ xp: MAX_XP }); } catch {}
  }
  // Times already stored in minutes in DB
  const currentFightRound = userData?.currentFightRound || 0;
  // Normalize per-fight time to minutes for compatibility with older data.
  let currentFightTime = normalizePerFightMinutes(userData?.currentFightTime ?? 0);
  const totalFightRounds = userData?.totalFightRounds || 0;
  const totalFightTime = userData?.totalFightTime || 0;
  const lifetimeFightRounds = userData?.lifetimeFightRounds || 0;
  const lifetimeFightTime = userData?.lifetimeFightTime || 0;
    const safeUserData = {
      name: userData?.name || 'Warrior',
  xp: safeXp || 120,
      plan: userData?.plan || 'free',
      fightsLeft: userData?.fightsLeft || 0, // default 0 fight for free users show on profile when reaching 0 (problem)
      loginStreak: userData?.loginStreak || 0,
      maxLoginStreak: userData?.maxLoginStreak || userData?.loginStreak || 0,
      currentFightRound,
      currentFightTime,
      totalFightRounds,
      totalFightTime,
      lifetimeFightRounds,
      lifetimeFightTime,
    };

    // Opportunistically fix currentFightTime in DB if we detected seconds
    try {
      if ((userData?.currentFightTime ?? 0) !== currentFightTime) {
        await userRef.update({ currentFightTime });
      }
    } catch {}

    // 3. Generate ETag hash of response (fast, stable)
    const etag = crypto.createHash('sha1').update(JSON.stringify(safeUserData)).digest('hex');

    // 4. If client's version matches new hash -> 304 (no body)
    if (ifNoneMatch && ifNoneMatch === etag) {
      userDataCache[uid] = { data: safeUserData, etag, fetchedAt: Date.now() }; // refresh cache timestamp
      res.setHeader('ETag', etag);
      res.status(304).end();
      return;
    }

    // 5. Store/refresh cache then respond
    userDataCache[uid] = { data: safeUserData, etag, fetchedAt: Date.now() };
    res.setHeader('ETag', etag);
    res.setHeader('Cache-Control', 'private, max-age=10');
    res.status(200).json({ success: true, data: safeUserData, cached: false });
  } catch (error: any) {
    logger.error("Error fetching user data:", error);
    res.status(500).json({
      success: false,
      error: {
        code: error.code || 'unknown',
        message: error.message || 'An unknown error occurred'
      }
    });
  }
});

export const updateLastLogin = onRequest(async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).send("Method Not Allowed");
    return;
  }

  try {
    // Verify authentication
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      res.status(401).send("Unauthorized: Missing or invalid token");
      return;
    }

    const idToken = authHeader.split("Bearer ")[1];
    const decodedToken = await auth.verifyIdToken(idToken);
    const uid = decodedToken.uid;

    const userRef = db.collection("users").doc(uid);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      res.status(404).send("User not found");
      return;
    }

    const userData = userDoc.data();
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    let newStreak = 1;
    let lastLoginStreak = userData?.loginStreak || 0;
    let shouldUpdate = true;
    
    if (userData?.lastLoginAt) {
      const lastLogin = userData.lastLoginAt.toDate();
      const lastLoginDate = new Date(lastLogin.getFullYear(), lastLogin.getMonth(), lastLogin.getDate());
      
      // Calculate days difference
      const daysDiff = Math.floor((today.getTime() - lastLoginDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === 0) {
        // Same day login - keep current streak, no need to update
        newStreak = lastLoginStreak;
        shouldUpdate = false; // Optimization: don't update database if same day
      } else if (daysDiff === 1) {
        // Next day login - increment streak
        newStreak = lastLoginStreak + 1;
      } else if (daysDiff > 1) {
        // Missed days - reset streak to 1
        newStreak = 1;
      }
    }

    // Determine if maxLoginStreak should be updated
    let maxLoginStreak = userData?.maxLoginStreak || lastLoginStreak || 0;
    if (newStreak > maxLoginStreak) {
      maxLoginStreak = newStreak;
      shouldUpdate = true; // ensure update if surpassed
    }

    // Only update database if necessary (streak changed or new max)
    if (shouldUpdate) {
      await userRef.update({
        lastLoginAt: FieldValue.serverTimestamp(),
        loginStreak: newStreak,
        maxLoginStreak
      });
    }

    res.status(200).json({ 
      success: true, 
      loginStreak: newStreak,
      maxLoginStreak,
      updated: shouldUpdate // Let client know if we actually updated
    });
  } catch (error: any) {
    logger.error("Error updating last login:", error);
    res.status(500).json({
      success: false,
      error: {
        code: error.code || 'unknown',
        message: error.message || 'An unknown error occurred.'
      }
    });
  }
});

// Scheduled function to restore all free users' fights to 1 every day at midnight UTC

export const restoreUserLivesDaily = onSchedule({
  schedule: "0 0 * * *", // Every day at midnight UTC
  timeZone: "UTC",
}, async (event) => {
  try {
    const usersSnapshot = await db.collection("users").get();
    const batch = db.batch();
    usersSnapshot.forEach((doc) => {
      //No futuro adicionar se o user tem mais que 3 vidas se sim n aciona
      batch.update(doc.ref, { fightsLeft: 1 });
    });
    await batch.commit();
    logger.log("All users' lives have been restored to 1.");
  } catch (error) {
    logger.error("Error restoring user lives:", error);
  }
});

// Scheduled function to reset weekly mission progress every Monday at midnight UTC
export const resetWeeklyMissionProgress = onSchedule({
  schedule: "0 0 * * 1", // Every Monday at midnight UTC (start of week)
  timeZone: "UTC",
}, async (event) => {
  try {
    const usersSnapshot = await db.collection("users").get();
    const batch = db.batch();
    let updateCount = 0;
    
    usersSnapshot.forEach((doc) => {
      const userData = doc.data();
      // Only update users who have progress to reset
      if ((userData?.totalFightRounds && userData.totalFightRounds > 0) || 
          (userData?.totalFightTime && userData.totalFightTime > 0)) {
        batch.update(doc.ref, { 
          totalFightRounds: 0,
          totalFightTime: 0
        });
        updateCount++;
      }
    });
    
    if (updateCount > 0) {
      await batch.commit();
      logger.log(`Weekly mission progress reset for ${updateCount} users.`);
    } else {
      logger.log("No users needed weekly mission progress reset.");
    }
  } catch (error) {
    logger.error("Error resetting weekly mission progress:", error);
  }
});



export const handleGameOver = onRequest(async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).send("Method Not Allowed");
    return;
  }

  try {
    // Verify user authentication
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      res.status(401).send("Unauthorized: Missing or invalid token");
      return;
    }

    const idToken = authHeader.split("Bearer ")[1];
    const decodedToken = await auth.verifyIdToken(idToken);
    const uid = decodedToken.uid;

    const userRef = db.collection("users").doc(uid);

    // Run transaction to avoid double-counting under concurrent requests
    const txResult = await db.runTransaction(async (t) => {
      const snap = await t.get(userRef);
      if (!snap.exists) {
        return { error: { code: 404, message: 'User not found' } } as const;
      }
      const userData = snap.data() as any;
      if (!userData?.playing) {
        return { error: { code: 400, message: 'User was not playing', oldXp: userData?.xp || 0 } } as const;
      }

      // Calculate new XP based on current level (progressive difficulty + fight length bonus)
      const oldXpRaw = userData.xp || 0;
      const oldXp = Math.min(oldXpRaw, MAX_XP);
      const currentLevel = Math.floor(oldXp / 100);

      // New XP scaling: very easy until ~level 8, then progressively harder
      const baseXP = (() => {
        if (currentLevel <= 2) return 110;       // near-instant early levels
        if (currentLevel <= 5) return 90;        // still fast
        if (currentLevel <= 8) return 70;        // easy up through ~8
        if (currentLevel <= 15) return 50;       // moderate progression
        if (currentLevel <= 30) return 38;       // slows a bit
        if (currentLevel <= 50) return 27;       // late-game pace
        return 19;                                // end-game floor
      })();
      const variation = Math.floor(baseXP * 0.20); // tighter randomness window (20%)
      const randomXP = Math.floor(Math.random() * (variation * 2 + 1)) - variation;

      const fightRoundsForBonus = Math.max(0, userData?.currentFightRound || 0);
      const fightTimeForBonus = Math.max(0, normalizePerFightMinutes(userData?.currentFightTime || 0)); // minutes
  const BASELINE_ROUNDS = 1;
  const BASELINE_TOTAL_TIME = 1; // minutes (we store total minutes across all rounds)
      const roundsOverBaseline = Math.max(0, fightRoundsForBonus - BASELINE_ROUNDS);
  // Reward longer fights more aggressively: +25% per extra round, up to +200%
  const roundBonusPct = Math.min(roundsOverBaseline * 0.25, 2.0);
      const timeOverBaseline = Math.max(0, fightTimeForBonus - BASELINE_TOTAL_TIME);
  // Reward more total minutes: +8% per minute over baseline, up to +150%
  const timeBonusPct = Math.min(timeOverBaseline * 0.08, 1.5);
      let lengthMultiplier = 1 + roundBonusPct + timeBonusPct;
  lengthMultiplier = Math.min(lengthMultiplier, 3.5); // raise overall cap

      const rawXP = (baseXP + randomXP) * lengthMultiplier;
  const xpGained = Math.max(20, Math.round(rawXP));
      let newXp = oldXp + xpGained;
      if (newXp > MAX_XP) newXp = MAX_XP;

      const currentFightRounds = userData?.currentFightRound || 0;
      const currentFightTime = fightTimeForBonus; // already normalized minutes
      const totalFightRounds = (userData?.totalFightRounds || 0) + currentFightRounds;
      const totalFightTime = (userData?.totalFightTime || 0) + currentFightTime;
      const lifetimeFightRounds = (userData?.lifetimeFightRounds || 0) + currentFightRounds;
      const lifetimeFightTime = (userData?.lifetimeFightTime || 0) + currentFightTime;

      t.update(userRef, {
        xp: newXp,
        playing: false,
        totalFightRounds,
        totalFightTime,
        lifetimeFightRounds,
        lifetimeFightTime,
        currentFightRound: 0,
        currentFightTime: 0,
      });

      const newLevel = Math.floor(newXp / 100);
      const didLevelUp = newLevel > currentLevel;

      return {
        oldXp,
        newXp,
        xpGained,
        currentLevel,
        newLevel,
        didLevelUp,
        breakdown: {
          baseXP,
          randomXP,
          lengthMultiplier,
          roundBonusPct,
          timeBonusPct,
          currentFightRounds,
          currentFightTime,
        }
      } as const;
    });

    if ('error' in txResult && txResult.error) {
      const err = txResult.error;
      if (err.code === 400) {
        res.status(400).json({ error: err.message, oldXp: err.oldXp });
        return;
      }
      res.status(404).send(err.message);
      return;
    }

    // Post-transaction: fetch unlocked combos if level up
    let unlockedCombos: string[] | undefined = undefined;
    let unlockedCombosMeta: Array<{ name: string; type?: string; comboId?: string | number; moves?: Array<{ move: string }>; categoryId?: string }>| undefined = undefined;
    if (txResult.didLevelUp) {
      try {
        const catId = '0';
        const combosDoc = await db.collection('combos').doc(catId).get();
        if (combosDoc.exists) {
          const data = combosDoc.data() as any;
          const levelsObj = data?.levels;
          if (levelsObj && typeof levelsObj === 'object') {
            const names: string[] = [];
            const meta: Array<{ name: string; type?: string; comboId?: string | number; moves?: Array<{ move: string }>; categoryId?: string }> = [];
            const normalizeMoves = (arr: any): Array<{ move: string }> => {
              const out: Array<{ move: string }> = [];
              if (Array.isArray(arr)) {
                for (const x of arr) {
                  if (typeof x === 'string') out.push({ move: x });
                  else if (x && typeof x === 'object' && (x as any).move) out.push({ move: String((x as any).move) });
                  if (out.length >= 8) break; // cap for payload size
                }
              }
              return out;
            };
            for (const typeKey of Object.keys(levelsObj)) {
              const arr = Array.isArray(levelsObj[typeKey]) ? levelsObj[typeKey] : [];
              for (let idx = 0; idx < arr.length; idx++) {
                const c = arr[idx];
                if (typeof c?.level === 'number' && c.level === txResult.newLevel) {
                  const nm = String(c?.name || c?.title || 'Combo');
                  names.push(nm);
                  meta.push({
                    name: nm,
                    type: String(c?.type || typeKey),
                    comboId: (c?.comboId ?? idx),
                    moves: Array.isArray((c as any)?.moves) ? normalizeMoves((c as any)?.moves) : undefined,
                    categoryId: combosDoc.id,
                  });
                }
              }
            }
            const seen = new Set<string>();
            unlockedCombos = names.filter(n => (seen.has(n) ? false : (seen.add(n), true)));
            // De-dup meta by name to mirror names
            const seenMeta = new Set<string>();
            unlockedCombosMeta = meta.filter(m => (seenMeta.has(m.name) ? false : (seenMeta.add(m.name), true)));
          }
        }
      } catch (e) {
        logger.warn('Failed to fetch unlocked combos for level up', e as any);
      }
    }

    res.status(200).json({
      oldXp: txResult.oldXp,
      newXp: txResult.newXp,
      xpGained: txResult.xpGained,
      currentLevel: txResult.currentLevel,
      newLevel: txResult.newLevel,
      levelUp: txResult.didLevelUp,
  unlockedCombos,
  unlockedCombosMeta,
      xpBreakdown: {
        baseXP: txResult.breakdown.baseXP,
        randomXPAdjustment: txResult.breakdown.randomXP,
        lengthMultiplier: txResult.breakdown.lengthMultiplier,
        roundBonusPct: txResult.breakdown.roundBonusPct,
        timeBonusPct: txResult.breakdown.timeBonusPct,
        currentFightRounds: txResult.breakdown.currentFightRounds,
        currentFightTime: txResult.breakdown.currentFightTime,
      }
    });

  } catch (error) {
    logger.error("Error in handleGameOver:", error);
    res.status(500).send("Internal Server Error");
  }
});

export const startFight = onRequest(async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).send("Method Not Allowed");
    return;
  }

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      res.status(401).send("Unauthorized: Missing or invalid token");
      return;
    }
    const idToken = authHeader.split("Bearer ")[1];
    const decodedToken = await auth.verifyIdToken(idToken);
    const uid = decodedToken.uid;

  // Accept both moveTypes and movesMode from client, defaulting to Punches
    const bodyOrQuery: any = req.method === "POST" ? req.body : req.query;
    const category = (bodyOrQuery?.category ?? '0') as string | number;
    const comboId = bodyOrQuery?.comboId as string | number | undefined;
    const selectedComboIdsRaw = (bodyOrQuery?.selectedComboIds as string | undefined) || undefined; // comma-separated ids for custom-selected mode
    const categoryToUse = category.toString();
  const randomFight = bodyOrQuery?.randomFight === true || bodyOrQuery?.randomFight === 'true';
    // Optional limit for randomFight mode; safeguard bounds
    let randomFightLimit: number | undefined = undefined;
    if (randomFight) {
      const rawLimit = parseInt(bodyOrQuery?.randomLimit ?? bodyOrQuery?.limit ?? '');
      if (!isNaN(rawLimit)) {
        randomFightLimit = Math.max(3, Math.min(rawLimit, 50)); // clamp 3..50
      }
    }
    
  // Get fight configuration values (round duration provided in MINUTES from client UI)
  let fightRounds = parseInt(bodyOrQuery?.fightRounds || bodyOrQuery?.numRounds || '1');
  let fightTimePerRoundMinutes = parseFloat(bodyOrQuery?.fightTimePerRound || bodyOrQuery?.roundDuration || '3');

  // Sanitize NaN
  if (isNaN(fightRounds)) fightRounds = 1;
  if (isNaN(fightTimePerRoundMinutes)) fightTimePerRoundMinutes = 1;

  // If client accidentally sends seconds (e.g., 60, 120), convert to minutes
  if (isFinite(fightTimePerRoundMinutes) && fightTimePerRoundMinutes > 10) {
    fightTimePerRoundMinutes = fightTimePerRoundMinutes / 60;
  }
  // Enforce business rules: rounds 1..7, duration 1..5 minutes
  if (fightRounds < 1) fightRounds = 1; else if (fightRounds > 7) fightRounds = 7;
  if (fightTimePerRoundMinutes < 1) fightTimePerRoundMinutes = 1; else if (fightTimePerRoundMinutes > 5) fightTimePerRoundMinutes = 5;
  // NOTE: We now store all fight time metrics in MINUTES (previously seconds) to simplify UI logic.
    
    // Process moveTypes for both combo selection and specific comboId
    const moveTypesArray = (() => {
      const moveTypesRaw = (bodyOrQuery?.moveTypes ?? bodyOrQuery?.movesMode ?? 'Punches') as string | string[];
      return (
        typeof moveTypesRaw === 'string' ? moveTypesRaw.split(',') : Array.isArray(moveTypesRaw) ? moveTypesRaw : ['Punches']
      )
        .map((s) => s.toString())
        .map((s) => s.trim())
        .map((s) => (s.length ? s : 'Punches'))
        .slice(0, 3);
    })();
    
    if (!comboId && !categoryToUse) {
      res.status(400).send("Bad Request: Missing category");
      return;
    }

    // Busca dados do usuário
    const userRef = db.collection("users").doc(uid);
    const userDoc = await userRef.get();
    if (!userDoc.exists) {
      res.status(404).send("User not found");
      return;
    }

  const userData = userDoc.data();
 
    // If user is not pro, check fights left
    if (userData?.plan === 'free') {
      if (!userData?.fightsLeft || userData.fightsLeft <= 0) {
        res.status(403).json({
          error: "No fights left",
          fightsLeft: userData?.fightsLeft || 0
        });
        return;
      }
    }

    // Busca combos para a categoria e nivel do usuário
  const comboDoc = await db.collection("combos").doc(categoryToUse).get();
    if (!comboDoc.exists) {
      res.status(404).send("Combos not found");
      return;
    }

    const comboData = comboDoc.data();

    // SPECIAL MODE: Custom-selected combos by explicit IDs (pro-only)
    if (selectedComboIdsRaw && selectedComboIdsRaw.trim().length > 0) {
      // Enforce plan not free
      if ((userData?.plan || 'free') === 'free') {
        res.status(403).json({ error: 'pro-required', message: 'Custom selected combos require a Pro plan.' });
        return;
      }

      // Parse list and preserve original order
      const requestedIds = selectedComboIdsRaw
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);

      // Build lookup across all levels/types in this category
      const levelsObj = (comboData as any)?.levels as Record<string, any[]> | undefined;
      if (!levelsObj || typeof levelsObj !== 'object') {
        res.status(400).send("Invalid combos data structure: missing levels");
        return;
      }
      // Determine user level for gating (match other selection logic)
      const xp = typeof userData?.xp === 'number' ? userData.xp : 0;
      const currentUserLevel = Math.min(MAX_LEVEL, Math.floor(xp / 100));

      // Build maps: by raw comboId and by composite key `${category}-${type}-${comboId}`
      const byKey = new Map<string, any>();
      for (const [typeKey, arr] of Object.entries(levelsObj)) {
        const list = Array.isArray(arr) ? arr : [];
        for (let i = 0; i < list.length; i++) {
          const c = list[i];
          const cidRaw = c?.comboId ?? c?.id;
          const cid = cidRaw !== undefined && cidRaw !== null ? String(cidRaw) : '';
          // Keys by explicit comboId (if exists)
          if (cid) {
            byKey.set(cid, c);
            byKey.set(`${categoryToUse}-${typeKey}-${cid}`, c);
          }
          // Keys by index fallback (to match getCombosMeta idx-based ids)
          byKey.set(`${categoryToUse}-${typeKey}-${i}`, c);
          // Also index by name as a last resort
          if (c?.name) byKey.set(String(c.name), c);
        }
      }

      const chosen: any[] = [];
      for (const id of requestedIds) {
        let key = String(id);
        let c = byKey.get(key);
        if (!c && key.includes('-')) {
          // Try last-segment fallback (assumed to be comboId)
          const last = key.split('-').pop() as string;
          c = byKey.get(last);
        }
        if (c && typeof c.level === 'number' && c.level <= currentUserLevel) {
          chosen.push(c);
        }
      }
      if (!chosen.length) {
        res.status(404).send('No matching combos found for requested ids');
        return;
      }

      let updatedFightsLeft = userData?.fightsLeft;
      const updates: any = { playing: true };
      if (userData?.plan === 'free') {
        // should never reach here due to guard above, but keep for safety
        if (!userData?.fightsLeft || userData.fightsLeft <= 0) {
          res.status(403).json({ error: 'No fights left', fightsLeft: userData?.fightsLeft || 0 });
          return;
        }
        updatedFightsLeft = (userData?.fightsLeft || 0) - 1;
        updates.fightsLeft = updatedFightsLeft;
      }
      // Save current fight configuration (TOTAL MINUTES)
      updates.currentFightRound = fightRounds;
      updates.currentFightTime = Math.round(fightTimePerRoundMinutes * fightRounds);
      await userRef.update(updates);

      res.status(200).json({
        combos: chosen,
        fightsLeft: updatedFightsLeft,
        randomFight: false,
        appliedLimit: undefined,
        totalEligible: chosen.length,
      });
      return;
    }

    // If a specific comboId is requested, find and return only that combo
    if (comboId !== undefined && comboId !== null) {
      const targetIdStr = String(comboId);
      let found: any | undefined = undefined;

      // Prefer a flat combos array if present
      const combosArray = (comboData as any)?.combos;
      if (Array.isArray(combosArray)) {
        found = combosArray.find((c: any) => 
          String(c?.comboId) === targetIdStr && 
          (!moveTypesArray.length || moveTypesArray.includes(c?.type || 'Punches'))
        );
      }
      // Otherwise search within levels across all types
      if (!found && (comboData as any)?.levels && typeof (comboData as any).levels === 'object') {
        const levelsObj = (comboData as any).levels as Record<string, any[]>;
        // When searching for a specific combo, only look in the specified moveType
        if (moveTypesArray.length === 1) {
          const typeKey = moveTypesArray[0];
          if (levelsObj[typeKey]) {
            const arr = Array.isArray(levelsObj[typeKey]) ? levelsObj[typeKey] : [];
            found = arr.find((c: any) => String(c?.comboId) === targetIdStr);
          }
        }
      }

      if (!found) {
        res.status(404).send("Combo not found");
        return;
      }

      // Prevent free users from playing pro-only combos
      const isProOnly = Boolean((found as any)?.proOnly);
      const plan = (userData?.plan || 'free').toLowerCase();
      if (isProOnly && plan === 'free') {
        res.status(403).json({ error: 'pro-required', message: 'This combo is available for Pro users only.' });
        return;
      }

      let updatedFightsLeft = undefined as number | undefined;
      const updates: any = { playing: true };
      if (userData?.plan === 'free') {
        if (!userData?.fightsLeft || userData.fightsLeft <= 0) {
          res.status(403).json({ error: "No fights left", fightsLeft: userData?.fightsLeft || 0 });
          return;
        }
        updatedFightsLeft = (userData.fightsLeft || 0) - 1;
        updates.fightsLeft = updatedFightsLeft;
      }
      
  // Save current fight configuration (store TOTAL MINUTES across all rounds)
  updates.currentFightRound = fightRounds;
  updates.currentFightTime = Math.round(fightTimePerRoundMinutes * fightRounds); // total minutes for this fight
      
  await userRef.update(updates);

      res.status(200).json({ combos: [found], fightsLeft: updatedFightsLeft });
      return;
    }

    // Validate that we have levels to pick from for random selection
    if (!(comboData as any)?.levels || typeof (comboData as any).levels !== 'object') {
      res.status(400).send("Invalid combos data structure: missing levels");
      return;
    }

  // Get the user's level from XP
  const xp = typeof userData?.xp === 'number' ? userData.xp : 0;
  const currentUserLevel = Math.min(MAX_LEVEL, Math.floor(xp / 100));

  // Build pools per selected move type and filter by user level
  type ComboT = any;
  const typePools: Record<string, ComboT[]> = {};
  let totalAvailable = 0;
  moveTypesArray.forEach((moveType) => {
    const arr: ComboT[] = ((comboData as any)?.levels?.[moveType] || []).filter(
      (c: any) => {
        if (!(typeof c?.level === 'number' && c.level <= currentUserLevel)) return false;
        // Filter out pro-only combos for free users
        const isProOnly = Boolean(c?.proOnly);
        const plan = (userData?.plan || 'free').toLowerCase();
        if (isProOnly && plan === 'free') return false;
        return true;
      }
    );
    if (arr.length) {
      // Slight shuffle then sort by level desc to prefer higher within each type
      const shuffled = [...arr].sort(() => Math.random() - 0.5);
      shuffled.sort((a, b) => (b.level as number) - (a.level as number));
      typePools[moveType] = shuffled;
      totalAvailable += shuffled.length;
    }
  });

  // If no moves found for selected types, default to Punches
  if (totalAvailable === 0 && (comboData as any)?.levels?.Punches) {
    const punchMoves = (comboData as any).levels.Punches.filter(
      (c: any) => typeof c?.level === 'number' && c.level <= currentUserLevel
    );
    if (punchMoves.length) {
      const shuffled = [...punchMoves].sort(() => Math.random() - 0.5);
      shuffled.sort((a, b) => (b.level as number) - (a.level as number));
      typePools['Punches'] = shuffled;
      totalAvailable = shuffled.length;
    }
  }

    // If randomFight=true client wants ALL eligible combos (no repetition, order will be randomized client-side)
  let pickCount: number;
  if (randomFight) {
    pickCount = totalAvailable; // send everything user can play
  } else {
    // Decide random quantity between 3 and 5 (limited by available combos)
    const maxPick = Math.min(4, totalAvailable);
    pickCount = totalAvailable < 3
      ? totalAvailable // return all if less than 3 available
      : 3 + Math.floor(Math.random() * (maxPick - 3 + 1)); // integer between 3 and maxPick
  }

  // Interleave picks across the selected types in round-robin, ensuring at least one highest-level overall
  let randomCombos: ComboT[] = [];
  if (pickCount > 0) {
    // Compute global highest level and ensure one such combo is included first
    const allCombos: ComboT[] = Object.values(typePools).flat();
    const highestLevel = allCombos.reduce((max: number, c: any) => Math.max(max, c.level as number), -Infinity);
    const highestLevelCombos = allCombos.filter((c: any) => c.level === highestLevel);
    const chosenTop = highestLevelCombos[Math.floor(Math.random() * highestLevelCombos.length)];
    randomCombos.push(chosenTop);

    // Remove chosenTop from its type pool
    for (const t of Object.keys(typePools)) {
      const idx = typePools[t].indexOf(chosenTop);
      if (idx !== -1) {
        typePools[t].splice(idx, 1);
        break;
      }
    }

    // Round-robin selection among types until reaching pickCount
    const typeOrder = Object.keys(typePools).filter((t) => typePools[t]?.length);
    let ti = 0;
    while (randomCombos.length < pickCount && typeOrder.length > 0) {
      const t = typeOrder[ti % typeOrder.length];
      const pool = typePools[t];
      if (pool && pool.length) {
        randomCombos.push(pool.shift() as ComboT); // take next highest from this type
      }
      // Drop empty types from rotation
      for (let i = typeOrder.length - 1; i >= 0; i--) {
        const tt = typeOrder[i];
        if (!typePools[tt] || typePools[tt].length === 0) {
          typeOrder.splice(i, 1);
        }
      }
      ti++;
    }
  }

    let updatedFightsLeft = userData?.fightsLeft;
    
    // Update the user's playing status and fightsLeft
    const updates: any = { playing: true };
    
    // Only update fightsLeft for free users
    if (userData?.plan === 'free') {
      updatedFightsLeft = (userData?.fightsLeft || 0) - 1;
      updates.fightsLeft = updatedFightsLeft;
    }
    
  // Save current fight configuration (TOTAL MINUTES)
  updates.currentFightRound = fightRounds;
  updates.currentFightTime = Math.round(fightTimePerRoundMinutes * fightRounds); // total minutes
    
    // Update the user's playing status
    await userRef.update(updates);

    // Build final combos list: if randomFight we must merge all remaining pools plus the chosenTop (if not already)
    let finalCombos = randomCombos;
    if (randomFight) {
      // Gather all remaining combos (including those in pools not yet chosen)
      const remaining = Object.values(typePools).flat();
      const seen = new Set<string>();
      finalCombos = [...randomCombos, ...remaining].filter(c => {
        const id = String(c.comboId ?? c.name ?? Math.random());
        if (seen.has(id)) return false;
        seen.add(id);
        return true;
      });

      // If a limit is specified (or apply default) we sample a balanced subset
      const LIMIT = randomFightLimit ?? 20; // default cap 20 to control payload
      if (finalCombos.length > LIMIT) {
        // Group by type (fallback to 'Unknown')
        const byType: Record<string, any[]> = {};
        for (const combo of finalCombos) {
          const typeKey = (combo.type || combo.moveType || 'Unknown').toString();
          (byType[typeKey] ||= []).push(combo);
        }
        // Shuffle each type group to randomize internal order
        for (const key of Object.keys(byType)) {
          const arr = byType[key];
          for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
          }
        }
        const selected: any[] = [];
        // Ensure at least one from each type (up to LIMIT)
        for (const key of Object.keys(byType)) {
          if (selected.length >= LIMIT) break;
            const first = byType[key].shift();
            if (first) selected.push(first);
        }
        // Build a remaining pool and shuffle globally
        let remainingPool: any[] = Object.values(byType).flat();
        for (let i = remainingPool.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [remainingPool[i], remainingPool[j]] = [remainingPool[j], remainingPool[i]];
        }
        // Fill until reaching LIMIT
        for (const c of remainingPool) {
          if (selected.length >= LIMIT) break;
          selected.push(c);
        }
        finalCombos = selected;
      }

      // Final shuffle for overall random order
      for (let i = finalCombos.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [finalCombos[i], finalCombos[j]] = [finalCombos[j], finalCombos[i]];
      }
    }

    // Retorna resposta
    res.status(200).json({
      combos: finalCombos,
      fightsLeft: updatedFightsLeft,
      randomFight,
      appliedLimit: randomFight ? (randomFightLimit ?? 20) : undefined,
      totalEligible: randomFight ? totalAvailable : undefined,
    });
  } catch (error) {
    logger.error("Error in startFight:", error);
    res.status(500).send("Internal Server Error");
  }
});

export const createUser = onRequest(async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).send("Method Not Allowed");
    return;
  }

  try {
    const { email, password, name } = req.body;

    // Input validation
    if (!email || !password || !name) {
      res.status(400).json({
        success: false,
        error: { code: 'auth/missing-fields', message: 'Email, password and name are required.' }
      });
      return;
    }

    if (!email.includes('@') || !email.includes('.')) {
      res.status(400).json({
        success: false,
        error: { code: 'auth/invalid-email', message: 'Please enter a valid email address.' }
      });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({
        success: false,
        error: { code: 'auth/weak-password', message: 'Password should be at least 6 characters.' }
      });
      return;
    }

    if (name.trim().length < 2) {
      res.status(400).json({
        success: false,
        error: { code: 'auth/name-too-short', message: 'Name must be at least 2 characters long.' }
      });
      return;
    }

    if (name.trim().length > 50) {
      res.status(400).json({
        success: false,
        error: { code: 'auth/name-too-long', message: 'Name must not exceed 50 characters.' }
      });
      return;
    }

    // Create the user with Firebase Auth
    const userRecord = await auth.createUser({
      email,
      password,
      displayName: name
    });

    // Create user document in Firestore with default values
    const userDocRef = db.collection('users').doc(userRecord.uid);
    await userDocRef.set({
      email: email,
      name: name,
      xp: Math.min(130, MAX_XP), // Start at level 1 (100 XP) plus some buffer for visual progress (capped)
      plan: 'free', // Default plan, can be 'free' or 'pro' or 'annual'
      fightsLeft: 4, // Start with 4 fights to allow immediate play
      playing: false,


      loginStreak: 1, // New field to track login streak count
      maxLoginStreak: 1, // Track highest streak ever

      currentFightRound: 0, // New field to track current fight round
      currentFightTime: 0, // New field to track current fight time
      totalFightRounds: 0, // New field to track total fight rounds (weekly mission - resets)
      totalFightTime: 0, // New field to track total fight time (weekly mission - resets)
      lifetimeFightRounds: 0, // New field to track lifetime total fight rounds (never resets)
      lifetimeFightTime: 0, // New field to track lifetime total fight time (never resets)

      createdAt: FieldValue.serverTimestamp(),
      lastLoginAt: FieldValue.serverTimestamp()
    });    res.status(200).json({ success: true });
  } catch (error: any) {
    logger.error('Error creating user:', error);
    res.status(500).json({
      success: false,
      error: {
        code: error.code || 'auth/unknown',
        message: error.message || 'An unknown error occurred.'
      }
    });
  }
});

export const getCombosMeta = onRequest(async (req, res) => {
  try {
    // Enforce GET (or allow POST with same behavior)
    if (req.method !== "GET" && req.method !== "POST") {
      res.status(405).send("Method Not Allowed");
      return;
    }

    // Verify user authentication via Firebase ID token
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      res.status(401).send("Unauthorized: Missing or invalid token");
      return;
    }
  const idToken = authHeader.split("Bearer ")[1];
  const decoded = await auth.verifyIdToken(idToken);
  const uid = decoded.uid;

  // Fetch user to determine plan and level gating
  const userRef = db.collection("users").doc(uid);
  const userDoc = await userRef.get();
  const userData = userDoc.exists ? userDoc.data() as any : undefined;
  const userPlan = String(userData?.plan || 'free').toLowerCase();
  const userXp = Math.min(MAX_XP, Math.max(0, Number(userData?.xp || 0)));
  const userLevel = Math.min(MAX_LEVEL, Math.floor(userXp / 100));

    const category = (req.method === "GET" ? req.query.category : (req.body?.category as string | undefined)) as
      | string
      | undefined;
    const comboIdQuery = (req.method === "GET"
      ? (req.query.comboId as string | undefined)
      : (req.body?.comboId as string | undefined)) as string | undefined;
    const moveTypeFilter = (req.method === "GET"
      ? (req.query.moveType as string | undefined)
      : (req.body?.moveType as string | undefined)) as string | undefined;

    type ComboItem = {
      comboId?: string | number;
      name?: string;
      title?: string;
      level?: number;
      type?: string; // e.g., Punches | Kicks | Defense
      description?: string;
      moves?: any[]; // optional array of moves for the combo
      // any other fields are ignored on output
    };

    const results: Array<{
      id: string; // composed id for stable FlatList keys
      name: string;
      level: number;
      type: string;
      categoryId: string;
      categoryName?: string;
      comboId: number | string;
      proOnly?: boolean;
      moves?: Array<{ move: string }>; // included only when user has access
    }> = [];

    const pushFromLevels = (
      categoryId: string,
      categoryName: string | undefined,
      levelsObj: Record<string, ComboItem[]>
    ) => {
      if (!levelsObj || typeof levelsObj !== 'object') return;
      const isPro = userPlan !== 'free';
      const normalizeMoves = (arr: any): Array<{ move: string }> => {
        const out: Array<{ move: string }> = [];
        if (Array.isArray(arr)) {
          for (const x of arr) {
            if (typeof x === 'string') out.push({ move: x });
            else if (x && typeof x === 'object' && (x as any).move) out.push({ move: String((x as any).move) });
            if (out.length >= 6) break; // cap preview size
          }
        }
        return out;
      };
      for (const typeKey of Object.keys(levelsObj)) {
        const arr = Array.isArray(levelsObj[typeKey]) ? levelsObj[typeKey] : [];
        arr.forEach((combo, idx) => {
          const levelNum = typeof combo.level === 'number' ? combo.level : 0;
          const displayName = combo.name || combo.title || `Combo ${idx + 1}`;
          const comboIdVal = combo.comboId ?? idx;
          const comboType = (combo.type || typeKey || 'Punches');
          const normalizedType = comboType.toString();

          // Filter by moveType if specified (expects case-sensitive values like 'Punches')
          if (moveTypeFilter && moveTypeFilter !== normalizedType) return;

          // Filter by comboId if specified
          if (comboIdQuery && String(comboIdVal) !== String(comboIdQuery)) return;

          const proOnly = Boolean((combo as any)?.proOnly);
          const allowed = (levelNum <= userLevel) && (!proOnly || isPro);

          results.push({
            id: `${categoryId}-${typeKey}-${String(comboIdVal)}`,
            name: String(displayName),
            level: levelNum,
            type: normalizedType,
            categoryId,
            categoryName,
            comboId: comboIdVal,
            proOnly,
            ...(allowed && Array.isArray((combo as any)?.moves)
              ? { moves: normalizeMoves((combo as any)?.moves) }
              : {}),
          });
        });
      }
    };

    // Force default to category '0' when none provided, as requested
    const categoryToUse = (category ?? '0').toString();

    if (categoryToUse) {
      const docSnap = await db.collection("combos").doc(categoryToUse).get();
      if (!docSnap.exists) {
        res.status(404).send("Combos category not found");
        return;
      }
      const data = docSnap.data() as any;
      if (!data?.levels || typeof data.levels !== 'object') {
        res.status(400).send("Invalid combos data structure: missing levels");
        return;
      }
      pushFromLevels(docSnap.id, data?.category, data.levels as Record<string, ComboItem[]>);
      // Also support optional flat combos array with type field
      if (Array.isArray((data as any).combos)) {
        const arr = (data as any).combos as ComboItem[];
        const isPro = userPlan !== 'free';
        const normalizeMoves = (arr: any): Array<{ move: string }> => {
          const out: Array<{ move: string }> = [];
          if (Array.isArray(arr)) {
            for (const x of arr) {
              if (typeof x === 'string') out.push({ move: x });
              else if (x && typeof x === 'object' && (x as any).move) out.push({ move: String((x as any).move) });
              if (out.length >= 6) break;
            }
          }
          return out;
        };
        arr.forEach((combo, idx) => {
          const levelNum = typeof combo.level === 'number' ? combo.level : 0;
          const displayName = combo.name || combo.title || `Combo ${idx + 1}`;
          const comboIdVal = combo.comboId ?? idx;
          const comboType = combo.type || 'Punches';
          if (moveTypeFilter && moveTypeFilter !== comboType) return;
          if (comboIdQuery && String(comboIdVal) !== String(comboIdQuery)) return;
          const proOnly = Boolean((combo as any)?.proOnly);
          const allowed = (levelNum <= userLevel) && (!proOnly || isPro);
          results.push({
            id: `${docSnap.id}-${comboType}-${String(comboIdVal)}`,
            name: String(displayName),
            level: levelNum,
            type: comboType,
            categoryId: docSnap.id,
            categoryName: data?.category,
            comboId: comboIdVal,
            proOnly,
            ...(allowed && Array.isArray((combo as any)?.moves)
              ? { moves: normalizeMoves((combo as any)?.moves) }
              : {}),
          });
        });
      }
    }

    // Sort by level asc then name asc
    results.sort((a, b) => (a.level - b.level) || a.name.localeCompare(b.name));

    res.status(200).json({ combos: results });
  } catch (error) {
    logger.error("Error in getCombosMeta:", error);
    res.status(500).send("Internal Server Error");
  }
});

// --- RevenueCat Webhook: update user subscription state based on event.type ---
// Configure a secret in your project env (functions:config or process.env) and set the same
// custom header in RevenueCat dashboard (e.g. X-Webhook-Token) to secure this endpoint.

// (Removed specific RcEventType union; using generic string normalization instead)

// (Old RcEventPayload type removed – replaced by richer RcFullEvent interface below)

function derivePlanFromProduct(productId?: string | null): 'monthly' | 'annual' {
  const id = (productId || '').toLowerCase();
  if (/(annual|year|yr|12m)/.test(id)) return 'annual';
  return 'monthly';
}

// Extended (v2 style) RevenueCat event fields (sample provided by user)
interface RcSubscriberAttributes {
  [key: string]: { value?: string; updated_at_ms?: number } | undefined;
}
interface RcFullEvent {
  aliases?: string[];
  app_id?: string;
  app_user_id?: string;
  original_app_user_id?: string;
  product_id?: string;
  type?: string; // event type
  environment?: string; // SANDBOX / PRODUCTION
  expiration_at_ms?: number | null;
  purchased_at_ms?: number | null;
  event_timestamp_ms?: number | null;
  period_type?: string | null;
  original_transaction_id?: string | null;
  entitlement_ids?: string[] | null;
  entitlement_id?: string | null;
  store?: string | null;
  price?: number | null;
  price_in_purchased_currency?: number | null;
  currency?: string | null;
  subscriber_attributes?: RcSubscriberAttributes | null;
  renewal_number?: number | null;
  // miscellaneous additional fields ignored
  [k: string]: any;
}

// Helper: map more event strings to canonical types / statuses
function mapEventToStatusAndPlan(evType: string, productId: string | null | undefined) {
  const type = (evType || '').toUpperCase();
  const plan = derivePlanFromProduct(productId);
  switch (type) {
    case 'INITIAL_PURCHASE':
    case 'NON_RENEWING_PURCHASE':
    case 'PRODUCT_CHANGE':
    case 'RENEWAL':
    case 'UNCANCELLATION':
      return { status: 'active', plan, cancelAtPeriodEnd: false, planChange: true };
    case 'CANCELLATION':
      return { status: 'cancelled', plan: plan, cancelAtPeriodEnd: true, planChange: false };
    case 'EXPIRATION':
      return { status: 'expired', plan: 'free', cancelAtPeriodEnd: false, planChange: true };
    case 'BILLING_ISSUE':
      return { status: 'billing_issue', plan, cancelAtPeriodEnd: false, planChange: false };
    case 'TEST':
      // Treat TEST as a no-op by default but still show derived plan for visibility
      return { status: 'test', plan, cancelAtPeriodEnd: false, planChange: true };
    default:
      return { status: 'unknown', plan, cancelAtPeriodEnd: false, planChange: false };
  }
}

export const revenuecatWebhook = onRequest(async (req, res) => {
  try {
    if (req.method !== 'POST') {
      res.status(405).send('Method Not Allowed');
      return;
    }

    const body = req.body as { event?: RcFullEvent } & Record<string, any>;
    const ev: RcFullEvent = body.event || (body as any);

    const eventTypeRaw = ev?.type || body?.type || '';
    const eventType = (eventTypeRaw || '').toString().toUpperCase();

    // Allow secret to be configured via env; fall back to legacy inline (discouraged)
    const expectedToken = (process.env.REVENUECAT_WEBHOOK_SECRET || 'ol7eIsss8qtldAIkA674mx95aYWD4gf2').trim();
    if (expectedToken && eventType !== 'TEST') {
      const headerAuth = req.headers['authorization'];
      const bearerToken = headerAuth?.startsWith('Bearer ') ? headerAuth.split(' ')[1] : undefined;
      const token = (
        bearerToken ||
        (req.headers['x-webhook-token'] as string) ||
        (req.headers['x-revenuecat-token'] as string) ||
        (req.query.token as string | undefined) ||
        ''
      ).toString().trim();
      if (!token || token !== expectedToken) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }
    }

    // Derive user id (prefer event.app_user_id; fall back to first alias)
    const appUserId = (
      ev?.app_user_id ||
      (Array.isArray(ev?.aliases) && ev.aliases.length ? ev.aliases[0] : '') ||
      ev?.original_app_user_id ||
      ''
    ).toString();
    if (!appUserId) {
      res.status(400).json({ success: false, message: 'Missing app_user_id' });
      return;
    }

    const userRef = db.collection('users').doc(appUserId);
    const userSnap = await userRef.get();
    if (!userSnap.exists) {
      await userRef.set({
        plan: 'free',
        createdAt: FieldValue.serverTimestamp(),
      }, { merge: true });
    }

    const productId = ev?.product_id || null;
    const expirationMs = typeof ev?.expiration_at_ms === 'number' ? ev.expiration_at_ms : null;
    const purchasedAtMs = typeof ev?.purchased_at_ms === 'number' ? ev.purchased_at_ms : null;
    const environment = (ev?.environment || '').toString().toUpperCase();
    const entitlementIds = (Array.isArray(ev?.entitlement_ids) ? ev.entitlement_ids : undefined);
    const originalTxn = ev?.original_transaction_id || null;
    const subscriberAttributes = ev?.subscriber_attributes || undefined;

    const mapping = mapEventToStatusAndPlan(eventType, productId);

    // Build update object
    const update: any = {
      subscription: {
        status: mapping.status,
        productId: productId || undefined,
        period: derivePlanFromProduct(productId),
        expiresAt: expirationMs ? new Date(expirationMs).toISOString() : null,
        purchasedAt: purchasedAtMs ? new Date(purchasedAtMs).toISOString() : null,
        environment,
        entitlementIds,
        cancelAtPeriodEnd: mapping.cancelAtPeriodEnd,
        originalTransactionId: originalTxn || undefined,
        eventType,
        updatedAt: FieldValue.serverTimestamp(),
        // Only store selected subscriber attributes to avoid unbounded growth
        subscriberAttributes: subscriberAttributes ? Object.fromEntries(
          Object.entries(subscriberAttributes).slice(0, 10) // cap first 10 keys
        ) : undefined,
      }
    };

    if (mapping.planChange) {
      update.plan = mapping.plan; // reflect new plan on user root
    }

    await userRef.set(update, { merge: true });

    res.status(200).json({
      success: true,
      eventType,
      appliedPlan: update.plan || (userSnap.data()?.plan) || 'free',
      status: update.subscription.status,
      environment,
    });
  } catch (err: any) {
    try {
      const rawBody = typeof (req as any)?.rawBody === 'string' ? (req as any).rawBody : undefined;
      const eventType = ((req.body?.event?.type || req.body?.type) ?? '').toString();
      const appUserId = ((req.body?.event?.app_user_id || req.body?.app_user_id) ?? '').toString();
      logger.error('[RevenueCat] Webhook error', {
        message: err?.message,
        stack: err?.stack?.substring(0, 800),
        eventType,
        appUserId,
        contentType: req.headers['content-type'],
        bodySample: rawBody ? rawBody.slice(0, 400) : undefined,
      });
    } catch (logErr) {
      logger.error('[RevenueCat] Webhook error (logging failed)', logErr as any);
    }
    res.status(500).json({ success: false, message: 'Internal Server Error'});
  }
});

// Feedback endpoint: receives feedback/bug report and emails it to owner; also stores in Firestore as backup
export const submitFeedback = onRequest(async (req, res) => {
  try {
    if (req.method !== 'POST') {
      res.status(405).send('Method Not Allowed');
      return;
    }

    // Parse body
    const { type, subject, message, contactEmail, allowContact } = (req.body || {}) as {
      type?: 'feedback' | 'bug';
      subject?: string;
      message?: string;
      contactEmail?: string;
      allowContact?: boolean;
    };

    if (!subject || !message || subject.trim().length < 3 || message.trim().length < 10) {
      res.status(400).json({ success: false, error: { code: 'invalid-input', message: 'Subject and message are required.' } });
      return;
    }

    // Identify user if token provided (optional)
    let uid: string | null = null;
    let emailFromAuth: string | null = null;
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      try {
        const idToken = authHeader.split('Bearer ')[1];
        const decoded = await auth.verifyIdToken(idToken);
        uid = decoded.uid;
        emailFromAuth = decoded.email || null;
      } catch {}
    }

    // --- Basic anti-abuse & rate limiting ---
    // Key by uid if authenticated, otherwise by IP address
    const xff = (req.headers['x-forwarded-for'] as string) || '';
    const ip = (xff.split(',')[0] || (req as any).ip || '').toString().trim() || 'unknown';
    const rateKeyRaw = uid ? `uid:${uid}` : `ip:${ip}`;
    const rateKey = rateKeyRaw.replace(/[^a-zA-Z0-9:_-]/g, '');

    // Limits (tune as needed)
    const nowMs = Date.now();
    const HOUR_MS = 60 * 60 * 1000;
    const DAY_MS = 24 * 60 * 60 * 1000;
    const hourLimit = uid ? 5 : 3;
    const dayLimit = uid ? 15 : 6;
    const DUP_WINDOW_MS = 10 * 60 * 1000; // 10 minutes duplicate window

    // Pre-compute content hash for dedupe
    const contentHash = crypto.createHash('sha1').update(`${(type||'feedback')}|${subject.trim()}|${message.trim()}`).digest('hex');

    const rlRef = db.collection('ratelimits').doc(`feedback_${rateKey}`);
    let retryAfterSeconds: number | undefined;
    // Use a transaction to safely check/update counters
    try {
      await db.runTransaction(async (t) => {
        const snap = await t.get(rlRef);
        const data = snap.exists ? (snap.data() as any) : {};

        const hourStartMs = typeof data?.hourStart?.toMillis === 'function' ? data.hourStart.toMillis() : (typeof data?.hourStart === 'number' ? data.hourStart : 0);
        const dayStartMs = typeof data?.dayStart?.toMillis === 'function' ? data.dayStart.toMillis() : (typeof data?.dayStart === 'number' ? data.dayStart : 0);
        let hourCount = typeof data?.hourCount === 'number' ? data.hourCount : 0;
        let dayCount = typeof data?.dayCount === 'number' ? data.dayCount : 0;

        // Reset windows if elapsed
        if (!hourStartMs || (nowMs - hourStartMs) >= HOUR_MS) {
          hourCount = 0;
        }
        if (!dayStartMs || (nowMs - dayStartMs) >= DAY_MS) {
          dayCount = 0;
        }

        // Duplicate content within DUP_WINDOW_MS
        const lastHash = (data?.lastContentHash as string) || '';
        const lastHashAtMs = typeof data?.lastHashAt?.toMillis === 'function' ? data.lastHashAt.toMillis() : (typeof data?.lastHashAt === 'number' ? data.lastHashAt : 0);
        if (lastHash && lastHash === contentHash && lastHashAtMs && (nowMs - lastHashAtMs) < DUP_WINDOW_MS) {
          // Treat duplicates like rate limited
          retryAfterSeconds = Math.ceil((DUP_WINDOW_MS - (nowMs - lastHashAtMs)) / 1000);
          throw Object.assign(new Error('Duplicate submission detected'), { code: 409 });
        }

        // Enforce limits
        if (hourCount + 1 > hourLimit) {
          const waitMs = HOUR_MS - (nowMs - (hourStartMs || nowMs));
          retryAfterSeconds = Math.max(1, Math.ceil(waitMs / 1000));
          throw Object.assign(new Error('Too many requests (hourly limit)'), { code: 429 });
        }
        if (dayCount + 1 > dayLimit) {
          const waitMs = DAY_MS - (nowMs - (dayStartMs || nowMs));
          retryAfterSeconds = Math.max(1, Math.ceil(waitMs / 1000));
          throw Object.assign(new Error('Too many requests (daily limit)'), { code: 429 });
        }

        // Update counters and dedupe state
        const updates: any = {
          hourCount: hourCount + 1,
          dayCount: dayCount + 1,
          lastContentHash: contentHash,
          lastHashAt: FieldValue.serverTimestamp(),
        };
        if (!hourStartMs || (nowMs - hourStartMs) >= HOUR_MS) {
          updates.hourStart = FieldValue.serverTimestamp();
        }
        if (!dayStartMs || (nowMs - dayStartMs) >= DAY_MS) {
          updates.dayStart = FieldValue.serverTimestamp();
        }
        t.set(rlRef, updates, { merge: true });
      });
    } catch (e: any) {
      const code = e?.code;
      if (code === 429) {
        if (retryAfterSeconds) res.setHeader('Retry-After', String(retryAfterSeconds));
        res.status(429).json({ success: false, error: { code: 'rate_limited', message: 'Too many requests. Please try again later.', retryAfterSeconds } });
        return;
      }
      if (code === 409) {
        if (retryAfterSeconds) res.setHeader('Retry-After', String(retryAfterSeconds));
        res.status(409).json({ success: false, error: { code: 'duplicate', message: 'Duplicate submission detected. Please wait before sending the same content again.', retryAfterSeconds } });
        return;
      }
      // Unexpected transaction error -> proceed with conservative failure
      logger.warn('Rate limit transaction failed', e);
    }

    // Persist feedback to Firestore for tracking
    const fbRef = await db.collection('feedback').add({
      type: type || 'feedback',
      subject: subject.trim(),
      message: message.trim(),
      contactEmail: (contactEmail || emailFromAuth || '').toString().trim() || null,
      allowContact: !!allowContact,
      uid: uid || null,
      userEmail: emailFromAuth || null,
      createdAt: FieldValue.serverTimestamp(),
      userAgent: (req.headers['user-agent'] as string) || null,
      platform: (req.headers['x-client-platform'] as string) || null,
      appVersion: (req.headers['x-app-version'] as string) || null,
    });

    // Email configuration via environment variables // esconder num env se for publico
    const host = "smtp.gmail.com";
    const userEnv = 'shadowmmastudios@gmail.com';
    const pass = "oygkgxkpjmfharpc"; 
    const to = 'shadowmmastudios@gmail.com';

    let emailed = false;
    if (host && userEnv && pass && to) {
      try {
        // Dynamic import to avoid type resolution issues in some environments
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const nodemailer = require('nodemailer');
        const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: userEnv,
          pass: pass,
        },
        });

        const lines = [
          `Type: ${type || 'feedback'}`,
          `Subject: ${subject.trim()}`,
          `Message:`,
          message.trim(),
          '',
          `User ID: ${uid || 'anonymous'}`,
          `User Email: ${emailFromAuth || 'unknown'}`,
          `Contact Email: ${contactEmail || 'not provided'}`,
          `Allow Contact: ${!!allowContact}`,
          `Doc ID: ${fbRef.id}`,
        ].join('\n');

        await transporter.sendMail({
          from: `Shadow MMA Feedback <${userEnv}>`,
          to,
          subject: `[ShadowMMA ${type === 'bug' ? 'Bug' : 'Feedback'}] ${subject.trim()}`,
          text: lines
        });
        emailed = true;
      } catch (e) {
        logger.warn('Feedback email failed, stored in Firestore only', e as any);
      }
    } else {
      logger.log('SMTP not configured; feedback stored in Firestore only');
    }

    res.status(200).json({ success: true, storedId: fbRef.id, emailed });
  } catch (err: any) {
    logger.error('submitFeedback error', err);
    res.status(500).json({ success: false, error: { code: 'internal', message: 'Internal Server Error' } });
  }
});

// --- Saved Combo Sets (PRO feature) ---
// Users can store up to 6 saved sets of selected combos for quick reuse
// Schema: users/{uid}/savedComboSets/{docId} -> { name, items: [{ id, type }], count, createdAt, updatedAt }
const MAX_SAVED_SETS = 6;
const MAX_SET_SIZE = 10; // must match client MAX_SELECT

export const getSavedComboSets = onRequest(async (req, res) => {
  try {
    if (req.method !== 'GET' && req.method !== 'POST') {
      res.status(405).send('Method Not Allowed');
      return;
    }

    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      res.status(401).send('Unauthorized: Missing or invalid token');
      return;
    }
    const idToken = authHeader.split('Bearer ')[1];
    const decoded = await auth.verifyIdToken(idToken);
    const uid = decoded.uid;

    const userRef = db.collection('users').doc(uid);
    const userDoc = await userRef.get();
    const plan = (userDoc.data()?.plan || 'free').toString().toLowerCase();
    if (plan === 'free') {
      res.status(403).json({ success: false, error: { code: 'pro-only', message: 'This feature is available for PRO users only.' } });
      return;
    }

    const colRef = userRef.collection('savedComboSets');
    const snap = await colRef.orderBy('updatedAt', 'desc').limit(MAX_SAVED_SETS).get();
    const sets = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
    res.status(200).json({ success: true, sets });
  } catch (err: any) {
    logger.error('getSavedComboSets error', err);
    res.status(500).json({ success: false, error: { code: err.code || 'internal', message: err.message || 'Internal Server Error' } });
  }
});

export const saveComboSet = onRequest(async (req, res) => {
  try {
    if (req.method !== 'POST') {
      res.status(405).send('Method Not Allowed');
      return;
    }

    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      res.status(401).send('Unauthorized: Missing or invalid token');
      return;
    }
    const idToken = authHeader.split('Bearer ')[1];
    const decoded = await auth.verifyIdToken(idToken);
    const uid = decoded.uid;

    const { name, items, setId } = (req.body || {}) as {
      name?: string;
      items?: Array<{ id: string | number; type?: string }>;
      setId?: string; // optional overwrite id
    };

    if (!Array.isArray(items) || items.length === 0) {
      res.status(400).json({ success: false, error: { code: 'invalid-args', message: 'No items to save.' } });
      return;
    }
    if (items.length > MAX_SET_SIZE) {
      res.status(400).json({ success: false, error: { code: 'too-many', message: `Max ${MAX_SET_SIZE} items per set.` } });
      return;
    }

    const normalizedItems = items
      .map(i => ({ id: String(i.id), type: (i.type || 'Punches').toString() }))
      .filter(i => i.id);

    const userRef = db.collection('users').doc(uid);
    const userDoc = await userRef.get();
    if (!userDoc.exists) {
      res.status(404).json({ success: false, error: { code: 'not-found', message: 'User not found.' } });
      return;
    }
    const plan = (userDoc.data()?.plan || 'free').toString().toLowerCase();
    if (plan === 'free') {
      res.status(403).json({ success: false, error: { code: 'pro-only', message: 'This feature is available for PRO users only.' } });
      return;
    }

    const colRef = userRef.collection('savedComboSets');

    // If creating a new set, enforce capacity
    if (!setId) {
      const countSnap = await colRef.limit(MAX_SAVED_SETS + 1).get();
      if (countSnap.size >= MAX_SAVED_SETS) {
        res.status(409).json({ success: false, error: { code: 'capacity', message: `You can save up to ${MAX_SAVED_SETS} sets.` } });
        return;
      }
    }

    const payload = {
      name: (name || '').toString().trim().slice(0, 40) || null,
      items: normalizedItems,
      count: normalizedItems.length,
      updatedAt: FieldValue.serverTimestamp(),
      createdAt: FieldValue.serverTimestamp(),
    } as any;

    let docId = setId;
    if (setId) {
      // Overwrite existing
      const docRef = colRef.doc(setId);
      const exists = await docRef.get();
      if (!exists.exists) {
        res.status(404).json({ success: false, error: { code: 'not-found', message: 'Set not found to overwrite.' } });
        return;
      }
      // Keep original createdAt
      payload.createdAt = exists.data()?.createdAt || FieldValue.serverTimestamp();
      await docRef.set(payload, { merge: true });
      docId = docRef.id;
    } else {
      const docRef = await colRef.add(payload);
      docId = docRef.id;
    }

    const saved = await colRef.doc(docId!).get();
    res.status(200).json({ success: true, set: { id: docId, ...(saved.data() as any) } });
  } catch (err: any) {
    logger.error('saveComboSet error', err);
    res.status(500).json({ success: false, error: { code: err.code || 'internal', message: err.message || 'Internal Server Error' } });
  }
});

export const deleteComboSet = onRequest(async (req, res) => {
  try {
    if (req.method !== 'POST' && req.method !== 'DELETE') {
      res.status(405).send('Method Not Allowed');
      return;
    }

    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      res.status(401).send('Unauthorized: Missing or invalid token');
      return;
    }
    const idToken = authHeader.split('Bearer ')[1];
    const decoded = await auth.verifyIdToken(idToken);
    const uid = decoded.uid;

    const { setId } = (req.body || {}) as { setId?: string };
    const idFromQuery = (req.query?.setId as string | undefined);
    const finalId = setId || idFromQuery;
    if (!finalId) {
      res.status(400).json({ success: false, error: { code: 'invalid-args', message: 'Missing setId.' } });
      return;
    }

    const userRef = db.collection('users').doc(uid);
    const userDoc = await userRef.get();
    const plan = (userDoc.data()?.plan || 'free').toString().toLowerCase();
    if (plan === 'free') {
      res.status(403).json({ success: false, error: { code: 'pro-only', message: 'This feature is available for PRO users only.' } });
      return;
    }

    const docRef = userRef.collection('savedComboSets').doc(finalId);
    await docRef.delete();
    res.status(200).json({ success: true });
  } catch (err: any) {
    logger.error('deleteComboSet error', err);
    res.status(500).json({ success: false, error: { code: err.code || 'internal', message: err.message || 'Internal Server Error' } });
  }
});
