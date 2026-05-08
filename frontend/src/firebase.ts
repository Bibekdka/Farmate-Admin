import { initializeApp, getApps, getApp } from 'firebase/app'
import { getAnalytics } from "firebase/analytics"
import { getPerformance } from "firebase/performance"
import {
  getAuth,
  GoogleAuthProvider
} from 'firebase/auth'

import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
}

// Defensive check for environment variables
if (!firebaseConfig.apiKey) {
  console.error("CRITICAL ERROR: Firebase API Key is missing! Ensure VITE_FIREBASE_API_KEY is set in your environment variables.")
}

let app;
try {
  app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig)
} catch (error) {
  console.error("CRITICAL ERROR: Failed to initialize Firebase. Check your configuration.", error)
  // Provide a minimal fake app object to prevent downstream crashes if possible, 
  // though auth/db will still fail.
  app = {} as any;
}
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null
export const perf = typeof window !== 'undefined' ? getPerformance(app) : null

export const auth = getAuth(app)
export const provider = new GoogleAuthProvider()
export const db = getFirestore(app)
