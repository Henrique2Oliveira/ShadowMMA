/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import { initializeApp } from "firebase-admin/app";
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

// GET endpoint
export const getData = onRequest(async (request, response) => {
  // Only allow GET requests
  if (request.method !== 'GET') {
    response.status(405).send('Method Not Allowed');
    return;
  }

  try {
    logger.info("GET request received", {structuredData: true});
    
    // Get the collection and document ID from query parameters
    const { collection, docId } = request.query;

    if (!collection || !docId) {
      response.status(400).send('Bad Request: Missing collection or document ID');
      return;
    }

    // Get document from Firestore
    const docRef = db.collection(collection).doc(docId as string);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      response.status(404).send('Document not found');
      return;
    }

    const data = docSnap.data();
    response.status(200).json(data);
    
  } catch (error) {
    logger.error("Error in GET request", error);
    response.status(500).send('Internal Server Error');
  }
});

// POST endpoint
export const postData = onRequest((request, response) => {
  // Only allow POST requests
  if (request.method !== 'POST') {
    response.status(405).send('Method Not Allowed');
    return;
  }

  try {
    logger.info("POST request received", {structuredData: true});
    const requestData = request.body;

    // Validate request body
    if (!requestData) {
      response.status(400).send('Bad Request: No data provided');
      return;
    }

    // Add your POST logic here
    const responseData = {
      message: "Data successfully received",
      receivedData: requestData,
      timestamp: new Date().toISOString()
    };

    response.status(200).json(responseData);
  } catch (error) {
    logger.error("Error in POST request", error);
    response.status(500).send('Internal Server Error');
  }
});

