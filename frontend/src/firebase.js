// src/firebase.js

import { initializeApp } from "firebase/app";

import { getAuth } from "firebase/auth";

import { getFirestore } from "firebase/firestore";

import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyC8wVBnYQyy4UXj6YeaLp4z4uKMcB0agIM",

  authDomain: "anime-tracker-496314.firebaseapp.com",

  projectId: "anime-tracker-496314",

  storageBucket: "anime-tracker-496314.firebasestorage.app",

  messagingSenderId: "759519568184",

  appId: "1:759519568184:web:bf6ec50e05903db452a1cd",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export const db = getFirestore(app);

export const storage = getStorage(app);

export default app;