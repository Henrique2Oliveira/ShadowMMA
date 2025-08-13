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
      batch.update(doc.ref, { fightsLeft: 3 });
    });
    await batch.commit();
    logger.log("All users' lives have been restored to 3.");
  } catch (error) {
    logger.error("Error restoring user lives:", error);
  }
});



export const startFight = onRequest(async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).send("Method Not Allowed");
    return;
  }

  try {
    const { category, difficulty } = req.body;

    // Verifica token no header Authorization: Bearer <token>
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      res.status(401).send("Unauthorized: Missing or invalid token");
      return;
    }

    const idToken = authHeader.split("Bearer ")[1];
    const decodedToken = await auth.verifyIdToken(idToken);
    const uid = decodedToken.uid;

    if (!category || !difficulty) {
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

    // Busca combos para a categoria
    const comboDoc = await db.collection("combos").doc(category).get();
    if (!comboDoc.exists) {
      res.status(404).send("Combos not found");
      return;
    }

    const comboData = comboDoc.data();
    const difficultyLevel = difficulty.toLowerCase();

    if (!comboData?.levels?.[difficultyLevel]) {
      res.status(400).send("Invalid difficulty level");
      return;
    }

    // Seleciona 3 combos aleatórios
    const combos = comboData.levels[difficultyLevel];
    const randomCombos = combos.sort(() => 0.5 - Math.random()).slice(0, 3);

    let updatedFightsLeft = userData.fightsLeft;
    
    // Only update and return fightsLeft for free users
    if (userData.plan !== 'pro') {
      updatedFightsLeft = userData.fightsLeft - 1;
      await userRef.update({ fightsLeft: updatedFightsLeft });
    }

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