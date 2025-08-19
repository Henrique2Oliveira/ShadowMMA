/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * impor    const { category = '0', comboId, moveTypes = 'Punches' } = req.method === "POST" ? req.body : req.query;
    const categoryToUse = category.toString();
    const moveTypesArray = (typeof moveTypes === 'string' ? moveTypes.split(',') : ['Punches']).slice(0, 3);
    
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

    const userData = userDoc.data();n} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import { initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { setGlobalOptions } from "firebase-functions";
import { onRequest } from "firebase-functions/https";
import * as logger from "firebase-functions/logger";
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

//// Inicializa o Admin SDK
initializeApp();

const db = getFirestore();
const auth = getAuth();

// Scheduled function to restore all users' lives to 3 every day at midnight UTC
import { onSchedule } from "firebase-functions/v2/scheduler";

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

    // Calculate new XP
    const oldXp = userData.xp || 0;
    const newXp = oldXp + Math.floor(Math.random() * (65 - 42 + 1)) + 33;

    // Update user data
    await userRef.update({
      xp: newXp,
      playing: false
    });

    // Return old and new values for animation
    res.status(200).json({
      oldXp,
      newXp
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
    
    // Only process moveTypes if no comboId is provided
    const moveTypesArray = !comboId ? (
      (() => {
        const moveTypesRaw = (bodyOrQuery?.moveTypes ?? bodyOrQuery?.movesMode ?? 'Punches') as string | string[];
        return (
          typeof moveTypesRaw === 'string' ? moveTypesRaw.split(',') : Array.isArray(moveTypesRaw) ? moveTypesRaw : ['Punches']
        )
          .map((s) => s.toString())
          .map((s) => s.trim())
          .map((s) => (s.length ? s : 'Punches'))
          .slice(0, 3);
      })()
    ) : [];
    
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
    if (userData?.plan !== 'pro') {
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
        found = combosArray.find((c: any) => String(c?.comboId) === targetIdStr);
      }
      // Otherwise search within levels across all types
      if (!found && (comboData as any)?.levels && typeof (comboData as any).levels === 'object') {
        const levelsObj = (comboData as any).levels as Record<string, any[]>;
        for (const typeKey of Object.keys(levelsObj)) {
          const arr = Array.isArray(levelsObj[typeKey]) ? levelsObj[typeKey] : [];
          const hit = arr.find((c: any) => String(c?.comboId) === targetIdStr);
          if (hit) {
            found = hit;
            break;
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
      if (userData?.plan !== 'pro') {
        if (!userData?.fightsLeft || userData.fightsLeft <= 0) {
          res.status(403).json({ error: "No fights left", fightsLeft: userData?.fightsLeft || 0 });
          return;
        }
        updatedFightsLeft = (userData.fightsLeft || 0) - 1;
        updates.fightsLeft = updatedFightsLeft;
      }
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
  const xp = typeof userData.xp === 'number' ? userData.xp : 0;
  const currentUserLevel = Math.floor(xp / 100) + 1;

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
  const maxPick = Math.min(5, totalAvailable);
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

    let updatedFightsLeft = userData.fightsLeft;
    
    // Update the user's playing status and fightsLeft
    const updates: any = { playing: true };
    
    // Only update fightsLeft for free users
    if (userData.plan !== 'pro') {
      updatedFightsLeft = userData.fightsLeft - 1;
      updates.fightsLeft = updatedFightsLeft;
    }
    
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