// Import the functions you need from the SDKs you need
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { getAnalytics } from "firebase/analytics";
import { initializeApp } from "firebase/app";
import { getReactNativePersistence, initializeAuth } from 'firebase/auth';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
export const firebaseConfig = {
  apiKey: "AIzaSyC1v2V5v-qUjkAebd0QrO3aOW9bhoC4mqE",
  authDomain: "shadow-mma.firebaseapp.com",
  projectId: "shadow-mma",
  storageBucket: "shadow-mma.firebasestorage.app",
  messagingSenderId: "346044500443",
  appId: "1:346044500443:web:fd2a0a80d5faa8f87a3ffe",
  measurementId: "G-ZPQDK2VJ2Z"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});