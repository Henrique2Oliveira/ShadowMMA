/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
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

    const { category, difficulty, comboId } = req.method === "POST" ? req.body : req.query;
    const categoryToUse = (category ?? '0').toString();
    const difficultyParam = difficulty?.toLowerCase();
    if (!comboId && (!categoryToUse || !difficultyParam)) {
      res.status(400).send("Bad Request: Missing category or difficulty");
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
    const difficultyLevel = (difficultyParam || '').toLowerCase();

    // If a specific comboId is requested, find and return only that combo (regardless of difficulty)
    if (comboId !== undefined && comboId !== null) {
      const targetIdStr = String(comboId);
      const levelsObj = (comboData as any)?.levels || {};
      let found: any | null = null;
      for (const key of Object.keys(levelsObj)) {
        const arr = Array.isArray(levelsObj[key]) ? levelsObj[key] : [];
        const match = arr.find((c: any) => String(c?.comboId) === targetIdStr);
        if (match) {
          found = match;
          break;
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

    if (!comboData?.levels?.[difficultyLevel]) {
      res.status(400).send("Invalid difficulty level");
      return;
    }

  // Seleciona de 1 a 4 combos aleatórios com nível <= nível do usuário (xp % 100)
  const combos = comboData.levels[difficultyLevel] as any[];
  const xp = typeof userData.xp === 'number' ? userData.xp : 0;
  const userLevel = ((xp % 100) + 100) % 100; // 0-99

  // Combos elegíveis: nível numérico e <= nível do usuário (inclui nível 0 quando userLevel = 0)
  const eligibleCombos = combos.filter((c: any) => typeof c?.level === 'number' && c.level <= userLevel);

  // Decide quantidade aleatória entre 3 e 5 (limitado pela quantidade disponível)
  const maxPick = Math.min(5, eligibleCombos.length);
  const pickCount = eligibleCombos.length < 3
    ? eligibleCombos.length // se menos de 3 disponíveis, retorna todas
    : 3 + Math.floor(Math.random() * (maxPick - 3 + 1)); // inteiro entre 3 e maxPick

  // Dar preferência a combos de nível mais alto dentro dos elegíveis (garante 1 do nível mais alto)
  let randomCombos: any[] = [];
  if (pickCount > 0) {
    const highestLevel = eligibleCombos.reduce((max: number, c: any) => Math.max(max, c.level as number), -Infinity);
    const highestLevelCombos = eligibleCombos.filter((c: any) => c.level === highestLevel);
    const chosenTop = highestLevelCombos.length > 0
      ? highestLevelCombos[Math.floor(Math.random() * highestLevelCombos.length)]
      : null;

    if (chosenTop) {
      const remainingPool = eligibleCombos.filter((c: any) => c !== chosenTop);
      const remainingCount = Math.max(0, pickCount - 1);
      const rest = remainingCount === 0
        ? []
        : [...remainingPool].sort(() => Math.random() - 0.5).slice(0, remainingCount);
      randomCombos = [chosenTop, ...rest];
    } else {
      // Fallback if for some reason we didn't find a top (shouldn't happen)
      randomCombos = [...eligibleCombos].sort(() => Math.random() - 0.5).slice(0, pickCount);
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

/**
 * Returns a minimal, optimized list of combo metadata for the client to list.
 * Requires Authorization: Bearer <idToken>
 * Optional query params:
 *  - category: string (doc id)
 *  - difficulty: beginner|intermediate|advanced (filters combos inside levels)
 */
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
    const difficulty = (req.method === "GET"
      ? req.query.difficulty
      : (req.body?.difficulty as string | undefined)) as string | undefined;
    const comboIdQuery = (req.method === "GET"
      ? (req.query.comboId as string | undefined)
      : (req.body?.comboId as string | undefined)) as string | undefined;

    const normalizeDifficulty = (d?: string) => (typeof d === "string" ? d.toLowerCase().trim() : undefined);
    const difficultyFilter = normalizeDifficulty(difficulty);

    type ComboItem = {
      id: string;
      name?: string;
      title?: string;
      level?: number;
      type?: string;
      description?: string;
      // any other fields are ignored on output
    };

    const results: Array<{
      id: string; // composed id for stable FlatList keys
      name: string;
      level: number;
      type?: string;
      difficulty: string;
      categoryId: string;
      categoryName?: string;
      comboId?: number | string;
    }> = [];

    const pushCombos = (
      categoryId: string,
      categoryName: string | undefined,
      levelObj: Record<string, ComboItem[]>
    ) => {
      // levels is expected to be an object: { beginner: ComboItem[], intermediate: ComboItem[], advanced: ComboItem[] }
      Object.entries(levelObj || {}).forEach(([diffKey, arr]) => {
        const dkey = diffKey.toLowerCase();
        if (difficultyFilter && difficultyFilter !== dkey) return;
        if (!Array.isArray(arr)) return;
        arr.forEach((combo, idx) => {
          const levelNum = typeof combo.level === "number" ? combo.level : 0;
          const displayName = (combo as any).name || (combo as any).title || `Combo ${idx + 1}`;
          const comboIdVal = (combo as any).comboId ?? idx;
          if (comboIdQuery && String(comboIdVal) !== String(comboIdQuery)) return;
          // Create a stable id combining category, difficulty and comboId
          const composedId = `${categoryId}:${dkey}:${comboIdVal}`;
          results.push({
            id: composedId,
            name: String(displayName),
            level: levelNum,
            type: (combo as any).type,
            difficulty: dkey,
            categoryId,
            categoryName,
            comboId: comboIdVal,
          });
        });
      });
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
      pushCombos(docSnap.id, data?.category, data?.levels ?? {});
    }

    // Sort by level asc then name asc
    results.sort((a, b) => (a.level - b.level) || a.name.localeCompare(b.name));

    res.status(200).json({ combos: results });
  } catch (error) {
    logger.error("Error in getCombosMeta:", error);
    res.status(500).send("Internal Server Error");
  }
});