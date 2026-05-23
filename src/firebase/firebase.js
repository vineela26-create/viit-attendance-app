// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";

import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDdFCSJ3MK4h6OAU8j60U5wGD5fQkkPKfk",
  authDomain: "attendance-website-b7c52.firebaseapp.com",
  projectId: "attendance-website-b7c52",
  storageBucket: "attendance-website-b7c52.firebasestorage.app",
  messagingSenderId: "191354855363",
  appId: "1:191354855363:web:420e69b4dffcc3e1eaa776",
  measurementId: "G-3QGKYYJBVW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);

// Initialize Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Initialize Google Auth Provider
export const provider = new GoogleAuthProvider();