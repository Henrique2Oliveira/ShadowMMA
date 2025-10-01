// Import the functions you need from the SDKs you need
import combinationSets from '@/secrets/data.js';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp } from "firebase/app";
import { getReactNativePersistence, initializeAuth } from 'firebase/auth';
import { doc, getFirestore, setDoc } from "firebase/firestore";

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



// don't forget to import combinationSets from '@/constants/data.js' if you want to use this script;

const uploadData = async () => {
  try {
    for (const category of combinationSets) {
      const categoryId = category.id.toString();
      const categoryRef = doc(db, "combos", categoryId); // Collection: "combos", doc ID = categoryId

      await setDoc(categoryRef, {
        category: category.category,
        levels: category.levels
      });

      console.log(`Uploaded category: ${category.category}`);
    }

    console.log("✅ All combos uploaded successfully");
  } catch (error) {
    console.error("❌ Error uploading combos:", error);
  }
};
uploadData();