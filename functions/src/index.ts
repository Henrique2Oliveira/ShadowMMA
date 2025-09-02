
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

// --- Simple in-memory cache (persists per warm Cloud Function instance) ---
// Reduces Firestore reads if the same user requests data repeatedly in a short window.
// NOTE: This does NOT eliminate function invocation cost, but saves reads + latency.
interface CachedUserData { data: any; etag: string; fetchedAt: number; }
const userDataCache: Record<string, CachedUserData> = {};
const USER_CACHE_TTL_MS = 15_000; // 15s server-side TTL (tune as needed)

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
    const safeUserData = {
      name: userData?.name || 'Warrior',
      xp: userData?.xp || 120,
      plan: userData?.plan || 'free',
      fightsLeft: userData?.fightsLeft || 3,
      loginStreak: userData?.loginStreak || 0,
  // Highest login streak ever achieved (used for badge display)
  maxLoginStreak: userData?.maxLoginStreak || userData?.loginStreak || 0,
      currentFightRound: userData?.currentFightRound || 0,
      currentFightTime: userData?.currentFightTime || 0,
      totalFightRounds: userData?.totalFightRounds || 0,
      totalFightTime: userData?.totalFightTime || 0,
      lifetimeFightRounds: userData?.lifetimeFightRounds || 0,
      lifetimeFightTime: userData?.lifetimeFightTime || 0,
    };

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

// Scheduled function to restore all users' lives to 3 every day at midnight UTC

export const restoreUserLivesDaily = onSchedule({
  schedule: "0 0 * * *", // Every day at midnight UTC
  timeZone: "UTC",
}, async (event) => {
  try {
    const usersSnapshot = await db.collection("users").get();
    const batch = db.batch();
    usersSnapshot.forEach((doc) => {
      //No futuro adicionar se o user tem mais que 3 vidas se sim n aciona
      // adiconar if login today and yesterday add 1 to the streak
      batch.update(doc.ref, { fightsLeft: 3 });
    });
    await batch.commit();
    logger.log("All users' lives have been restored to 3.");
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

    // Get user data
    const userRef = db.collection("users").doc(uid);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      res.status(404).send("User not found");
      return;
    }

    const userData = userDoc.data();

    // Check if user was playing
    if (!userData?.playing) {
      res.status(400).json({
        error: "User was not playing",
        oldXp: userData?.xp || 0,
      });
      return;
    }

  // Calculate new XP based on current level (progressive difficulty + fight length bonus)
  const oldXp = userData.xp || 0;
  const currentLevel = Math.floor(oldXp / 100);

  // --- Base XP (unchanged core curve) ---
  // Base decreases with level so early progression feels fast.
  // baseXP = max(20, 120 - level * 4)
  const baseXP = Math.max(20, 120 - (currentLevel * 4));

  // Random variation (±25%) keeps results dynamic while maintaining fairness
  const variation = Math.floor(baseXP * 0.25);
  const randomXP = Math.floor(Math.random() * (variation * 2 + 1)) - variation;

  // --- Fight length reward multiplier ---
  // We reward longer / more intense fights using both rounds and total fight time.
  // Assumptions:
  //  * currentFightRound = total number of rounds selected for the fight (not the current round index)
  //  * currentFightTime = total fight time in MINUTES (1-5 minutes per round)
  // Baselines: 1 round & 1 minute receive no bonus. Bonuses are capped to avoid abuse.
  const fightRoundsForBonus = Math.max(0, userData?.currentFightRound || 0);
  const fightTimeForBonus = Math.max(0, userData?.currentFightTime || 0); // in minutes

  const BASELINE_ROUNDS = 1; // no extra bonus until more than 1 round
  const BASELINE_TOTAL_TIME = 1; // 1 minute baseline (matching game's minimum round time)

  // Round bonus: +10% per extra round beyond baseline up to +100%
  const roundsOverBaseline = Math.max(0, fightRoundsForBonus - BASELINE_ROUNDS);
  const roundBonusPct = Math.min(roundsOverBaseline * 0.10, 1.0); // 0..1.0

  // Time bonus: +5% per extra minute beyond baseline time up to +75%
  const timeOverBaseline = Math.max(0, fightTimeForBonus - BASELINE_TOTAL_TIME);
  const timeBonusPct = Math.min(timeOverBaseline * 0.05, 0.75); // 0..0.75

  // Combine & cap overall multiplier (cap 2.5x total to prevent runaway farming)
  let lengthMultiplier = 1 + roundBonusPct + timeBonusPct; // base 1.0 .. 2.75
  lengthMultiplier = Math.min(lengthMultiplier, 2.5);

  // Final XP (pre-floor) then enforce minimum absolute XP of 15
  const rawXP = (baseXP + randomXP) * lengthMultiplier;
  const xpGained = Math.max(15, Math.round(rawXP));
  const newXp = oldXp + xpGained;

    // Get current fight stats to add to totals
    const currentFightRounds = userData?.currentFightRound || 0;
    const currentFightTime = userData?.currentFightTime || 0;
    const totalFightRounds = (userData?.totalFightRounds || 0) + currentFightRounds;
    const totalFightTime = (userData?.totalFightTime || 0) + currentFightTime;
    const lifetimeFightRounds = (userData?.lifetimeFightRounds || 0) + currentFightRounds;
    const lifetimeFightTime = (userData?.lifetimeFightTime || 0) + currentFightTime;

    // Update user data - add current fight stats to totals and reset current values
    await userRef.update({
      xp: newXp,
      playing: false,
      totalFightRounds: totalFightRounds,
      totalFightTime: totalFightTime,
      lifetimeFightRounds: lifetimeFightRounds,
      lifetimeFightTime: lifetimeFightTime,
      currentFightRound: 0, // Reset current fight stats
      currentFightTime: 0
    });

    // Return old and new values for animation
    res.status(200).json({
      oldXp,
      newXp,
      xpGained,
      currentLevel: Math.floor(oldXp / 100),
      newLevel: Math.floor(newXp / 100),
      xpBreakdown: {
        baseXP,
        randomXPAdjustment: randomXP,
        lengthMultiplier,
        roundBonusPct,
        timeBonusPct,
  currentFightRounds: fightRoundsForBonus,
  currentFightTime: fightTimeForBonus
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

  // Enforce business rules: rounds 1..7, duration 1..5 minutes
  if (fightRounds < 1) fightRounds = 1; else if (fightRounds > 7) fightRounds = 7;
  if (fightTimePerRoundMinutes < 1) fightTimePerRoundMinutes = 1; else if (fightTimePerRoundMinutes > 5) fightTimePerRoundMinutes = 5;

  // Convert to seconds for storage & XP calculations consistency server-side
  const fightTimePerRoundSeconds = Math.round(fightTimePerRoundMinutes * 60);
    
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

      let updatedFightsLeft = undefined as number | undefined;
      const updates: any = { playing: true };

      // Fetch user for fightsLeft management
      const userRef = db.collection("users").doc(uid);
      const userDoc = await userRef.get();
      if (!userDoc.exists) {
        res.status(404).send("User not found");
        return;
      }
      const userData = userDoc.data();
      if (userData?.plan === 'free') {
        if (!userData?.fightsLeft || userData.fightsLeft <= 0) {
          res.status(403).json({ error: "No fights left", fightsLeft: userData?.fightsLeft || 0 });
          return;
        }
        updatedFightsLeft = (userData.fightsLeft || 0) - 1;
        updates.fightsLeft = updatedFightsLeft;
      }
      
  // Save current fight configuration (store total seconds across all rounds)
  updates.currentFightRound = fightRounds;
  updates.currentFightTime = fightTimePerRoundSeconds * fightRounds; // total seconds for this fight
      
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
  const currentUserLevel = Math.floor(xp / 100);

  // Build pools per selected move type and filter by user level
  type ComboT = any;
  const typePools: Record<string, ComboT[]> = {};
  let totalAvailable = 0;
  moveTypesArray.forEach((moveType) => {
    const arr: ComboT[] = ((comboData as any)?.levels?.[moveType] || []).filter(
      (c: any) => typeof c?.level === 'number' && c.level <= currentUserLevel
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
    
  // Save current fight configuration
  updates.currentFightRound = fightRounds;
  updates.currentFightTime = fightTimePerRoundSeconds * fightRounds; // total seconds
    
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
      xp: 130, // Start at level 1 (100 XP) plus some buffer for visual progress
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
    await auth.verifyIdToken(idToken);

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
    }> = [];

    const pushFromLevels = (
      categoryId: string,
      categoryName: string | undefined,
      levelsObj: Record<string, ComboItem[]>
    ) => {
      if (!levelsObj || typeof levelsObj !== 'object') return;
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

          results.push({
            id: `${categoryId}-${typeKey}-${String(comboIdVal)}`,
            name: String(displayName),
            level: levelNum,
            type: normalizedType,
            categoryId,
            categoryName,
            comboId: comboIdVal,
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
    }

    // Sort by level asc then name asc
    results.sort((a, b) => (a.level - b.level) || a.name.localeCompare(b.name));

    res.status(200).json({ combos: results });
  } catch (error) {
    logger.error("Error in getCombosMeta:", error);
    res.status(500).send("Internal Server Error");
  }
});