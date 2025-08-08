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

// Initialize Firebase Admin at the top of your file
const app = initializeApp();
const db = getFirestore(app);
const admin = getAuth(app);

// GET endpoint to fetch combo data
export const getCombos = onRequest(async (request, response) => {
  if (request.method !== 'GET') {
    response.status(405).send('Method Not Allowed');
    return;
  }

  try {
    const { category, difficulty, idToken } = request.query;

    if (!idToken) {
      response.status(401).send('Unauthorized: No token provided');
      return;
    }

    // Verify the Firebase ID token
    const decodedToken = await admin.verifyIdToken(idToken as string);
    const uid = decodedToken.uid;

    // Get user data to check fightsLeft
    const userDoc = await db.collection('users').doc(uid).get();
    
    if (!userDoc.exists) {
      response.status(404).send('User not found');
      return;
    }

    const userData = userDoc.data();

    if (!userData || userData.fightsLeft <= 0) {
      response.status(403).send('No fights left');
      return;
    }

    // Get combos from the database
    const comboDoc = await db.collection('combos').doc(category as string).get();
    
    if (!comboDoc.exists) {
      response.status(404).send('Combos not found');
      return;
    }

    const comboData = comboDoc.data();
    if (!comboData || !comboData.levels) {
      response.status(400).send('Invalid combo data');
      return;
    }

    const difficultyLevel = (difficulty as string)?.toLowerCase() || 'beginner';
    
    if (!comboData.levels[difficultyLevel]) {
      response.status(400).send('Invalid difficulty level');
      return;
    }

    // Get random 3 combos from the selected difficulty
    const combos = comboData.levels[difficultyLevel];
    const randomCombos = combos
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);

    response.status(200).json(randomCombos);
  } catch (error) {
    logger.error("Error in GET request:", error);
    response.status(500).send('Internal Server Error');
  }
});

// POST endpoint to update fightsLeft and get combos
export const startFight = onRequest(async (request, response) => {
  if (request.method !== 'POST') {
    response.status(405).send('Method Not Allowed');
    return;
  }

  try {
    const { idToken, category, difficulty } = request.body;

    if (!idToken || !category || !difficulty) {
      response.status(400).send('Bad Request: Missing required fields');
      return;
    }

    // Verify the Firebase ID token
    const decodedToken = await admin.verifyIdToken(idToken);
    const uid = decodedToken.uid;

    // Get user document
    const userRef = db.collection('users').doc(uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      response.status(404).send('User not found');
      return;
    }

    const userData = userDoc.data();

    if (!userData || userData.fightsLeft <= 0) {
      response.status(403).send('No fights left');
      return;
    }

    // Get combos from the database
    const comboDoc = await db.collection('combos').doc(category).get();
    
    if (!comboDoc.exists) {
      response.status(404).send('Combos not found');
      return;
    }

    const comboData = comboDoc.data();
    
    if (!comboData || !comboData.levels) {
      response.status(500).send('Invalid combo data');
      return;
    }

    const difficultyLevel = difficulty.toLowerCase();
    
    if (!comboData.levels[difficultyLevel]) {
      response.status(400).send('Invalid difficulty level');
      return;
    }

    // Get random 3 combos from the selected difficulty
    const combos = comboData.levels[difficultyLevel];
    const randomCombos = combos
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);

    // Decrease fightsLeft by 1
    await userRef.update({
      fightsLeft: userData.fightsLeft - 1
    });

    // Return the combos and updated fightsLeft
    response.status(200).json({
      combos: randomCombos,
      fightsLeft: userData.fightsLeft - 1
    });

  } catch (error) {
    logger.error("Error in POST request:", error);
    response.status(500).send('Internal Server Error');
  }
});

