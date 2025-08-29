
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

// Cloud function to handle user login update
export const getUserData = onRequest(async (req, res) => {
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
      res.status(404).json({ success: false, error: { code: 'not-found', message: 'User data not found' } });
      return;
    }

    // Only return necessary data
    const userData = userDoc.data();
    const safeUserData = {
      name: userData?.name || 'Warrior',
      xp: userData?.xp || 120,
      hours: userData?.hours || 0,
      moves: userData?.moves || 0,
      combos: userData?.combos || 0,
      plan: userData?.plan || 'free',
      fightsLeft: userData?.fightsLeft || 3,
      loginStreak: userData?.loginStreak || 0,
      currentFightRound: userData?.currentFightRound || 0,
      currentFightTime: userData?.currentFightTime || 0,
      totalFightRounds: userData?.totalFightRounds || 0,
      totalFightTime: userData?.totalFightTime || 0,
      lifetimeFightRounds: userData?.lifetimeFightRounds || 0,
      lifetimeFightTime: userData?.lifetimeFightTime || 0,
    };

    res.status(200).json({ success: true, data: safeUserData });
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

    // Only update database if necessary
    if (shouldUpdate) {
      await userRef.update({
        lastLoginAt: FieldValue.serverTimestamp(),
        loginStreak: newStreak
      });
    }

    res.status(200).json({ 
      success: true, 
      loginStreak: newStreak,
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

    // Calculate new XP based on current level (progressive difficulty)
    const oldXp = userData.xp || 0;
    const currentLevel = Math.floor(oldXp / 100);
    
    // Base XP formula: starts high for early levels, decreases as level increases
    // Formula: baseXP = max(20, 120 - (level * 4))
    // This gives: Level 0-4: 120-104 XP, Level 10: 80 XP, Level 20: 40 XP, Level 25+: 20 XP minimum
    const baseXP = Math.max(20, 120 - (currentLevel * 4));
    
    // Add random variation (±25% of base XP)
    const variation = Math.floor(baseXP * 0.25);
    const randomXP = Math.floor(Math.random() * (variation * 2 + 1)) - variation;
    
    // Final XP calculation with minimum guarantee
    const xpGained = Math.max(15, baseXP + randomXP);
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
      newLevel: Math.floor(newXp / 100)
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
    
    // Get fight configuration values
    const fightRounds = parseInt(bodyOrQuery?.fightRounds || bodyOrQuery?.numRounds || '1');
    const fightTimePerRound = parseFloat(bodyOrQuery?.fightTimePerRound || bodyOrQuery?.roundDuration || '3');
    
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
      
      // Save current fight configuration
      updates.currentFightRound = fightRounds;
      updates.currentFightTime = fightTimePerRound * fightRounds; // Total time for this fight
      
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

  // Decide random quantity between 3 and 5 (limited by available combos)
  const maxPick = Math.min(4, totalAvailable);
  const pickCount = totalAvailable < 3
    ? totalAvailable // return all if less than 3 available
    : 3 + Math.floor(Math.random() * (maxPick - 3 + 1)); // integer between 3 and maxPick

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
    updates.currentFightTime = fightTimePerRound * fightRounds; // Total time for this fight
    
    // Update the user's playing status
    await userRef.update(updates);

    // Retorna resposta
    res.status(200).json({
      combos: randomCombos,
      fightsLeft: updatedFightsLeft,
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
      xp: 120, // Start at level 1 (100 XP) plus some buffer for visual progress
      plan: 'free', // Default plan, can be 'free' or 'pro' or 'annual'
      hours: 0,
      moves: 4,
      combos: 1,
      fightsLeft: 4, // Start with 4 fights to allow immediate play
      playing: false,
      loginStreak: 0, // New field to track login streak count
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

// Helper: minimal fallback combo (only essential fields)
const getBasicFallbackCombo = () => ({
  comboId: "basic-1",
  name: "Basic Jab",
  level: 1,
  type: "Punches",
  moves: ["Jab"],
});

export const getComboOfTheDay = onRequest(async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      res.status(200).json({ success: true, combo: getBasicFallbackCombo() });
      return;
    }
    const idToken = authHeader.split("Bearer ")[1];
    const decodedToken = await auth.verifyIdToken(idToken);
    const uid = decodedToken.uid;

    const userDoc = await db.collection("users").doc(uid).get();
    if (!userDoc.exists) { res.status(200).json({ success: true, combo: getBasicFallbackCombo() }); return; }
    const xp = typeof userDoc.data()?.xp === 'number' ? userDoc.data()!.xp : 0;
    const level = Math.floor(xp / 100);

    const combosDoc = await db.collection("combos").doc("0").get();
    if (!combosDoc.exists) { res.status(200).json({ success: true, combo: getBasicFallbackCombo() }); return; }
    const raw = combosDoc.data();
    if (!raw?.levels || typeof raw.levels !== 'object') { res.status(200).json({ success: true, combo: getBasicFallbackCombo() }); return; }

    // Collect eligible combos for level across types
    const pool: any[] = [];
    ['Punches','Kicks','Defense'].forEach(t => {
      const arr = (raw.levels?.[t] || []).filter((c: any) => typeof c?.level === 'number' && c.level <= level);
      arr.forEach((c: any) => pool.push({ ...c, type: t }));
    });
    if (!pool.length) { res.status(200).json({ success: true, combo: getBasicFallbackCombo() }); return; }

    // Stable daily selection per user
    const today = new Date();
    const seed = uid + `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
    let hash = 0; for (let i=0;i<seed.length;i++){ hash = ((hash<<5)-hash)+seed.charCodeAt(i); hash|=0; }
    const idx = Math.abs(hash) % pool.length;
    const selected = pool[idx];

    // Sanitize to only needed fields
    const minimal = {
      comboId: selected.comboId ?? idx,
      name: selected.name || selected.title || `Combo ${idx+1}`,
      level: selected.level || 0,
      type: selected.type || 'Punches',
      moves: selected.moves || [],
      description: selected.description || undefined,
    };
  res.status(200).json({ success: true, combo: minimal });
  return;
  } catch (e) {
    logger.error('getComboOfTheDay error', e);
  res.status(200).json({ success: true, combo: getBasicFallbackCombo() });
  return;
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