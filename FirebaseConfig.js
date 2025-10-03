// Import the functions you need from the SDKs you need
import { combinationSets } from '@/secrets/data.js';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp } from "firebase/app";
import { getReactNativePersistence, initializeAuth } from 'firebase/auth';
import { arrayUnion, doc, getFirestore, setDoc, updateDoc } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

export const firebaseConfig = {
  apiKey: "AIzaSyC1v2V5v-qUjkAebd0QrO3aOW9bhoC4mqE", //is safe to expose to github
  authDomain: "shadow-mma.firebaseapp.com",
  projectId: "shadow-mma",
  storageBucket: "shadow-mma.firebasestorage.app",
  messagingSenderId: "346044500443",
  appId: "1:346044500443:web:fd2a0a80d5faa8f87a3ffe",
  measurementId: "G-ZPQDK2VJ2Z"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});
export const db = getFirestore(app);



// One-time uploader: writes combos in small chunks per level to avoid large payloads
// NOTE: Do NOT auto-run this on app start. Call uploadCombosInChunks() manually from a dev-only entry point.
const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

function chunkArray(arr, size) {
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) chunks.push(arr.slice(i, i + size));
  return chunks;
}

export const uploadCombosInChunks = async (options = {}) => {
  const {
    chunkSize = 20, // smaller chunks reduce request size; adjust if needed
    interChunkDelayMs = 50, // tiny delay to avoid rate limits
    logProgress = true,
  } = options;

  try {
    for (const category of combinationSets) {
      const categoryId = String(category.id);
      const categoryRef = doc(db, 'combos', categoryId);

      // Start fresh metadata; don't write the whole levels at once
      await setDoc(categoryRef, { category: category.category, levels: {} }, { merge: true });

      const levelEntries = Object.entries(category.levels || {});
      for (const [levelName, combos] of levelEntries) {
        // Initialize the array to empty to avoid duplicating data on re-runs
        await setDoc(
          categoryRef,
          { [`levels.${levelName}`]: [] },
          { merge: true }
        );

        const chunks = chunkArray(combos || [], chunkSize);
        for (let i = 0; i < chunks.length; i++) {
          const chunk = chunks[i];
          // Append this chunk using arrayUnion (server-side dedupe by value)
          await updateDoc(categoryRef, {
            [`levels.${levelName}`]: arrayUnion(...chunk),
          });

          if (logProgress) {
            console.log(
              `Uploaded ${category.category} -> ${levelName}: chunk ${i + 1}/${chunks.length} (size=${chunk.length})`
            );
          }

          if (interChunkDelayMs > 0) await sleep(interChunkDelayMs);
        }
      }

      if (logProgress) console.log(`✅ Uploaded category: ${category.category}`);
    }

    console.log('✅ All combos uploaded successfully (chunked)');
  } catch (error) {
    console.error('❌ Error uploading combos (chunked):', error);
  }
};