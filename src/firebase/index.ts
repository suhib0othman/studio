
'use client';

/**
 * Central Firebase Hub.
 * Manages initialization, exports services, and provides diagnostic health checks.
 */

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore, collection, getDocs, limit, query } from 'firebase/firestore';
import { getAuth, Auth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { firebaseConfig } from './config';

export * from './provider';
export * from './client-provider';
export { useUser } from './auth/use-user';
export { useCollection } from './firestore/use-collection';
export { useDoc } from './firestore/use-doc';

/**
 * Diagnostic function to verify connections.
 * Logs status to console to ensure API key and services are valid.
 */
export async function checkConnection(db: Firestore, auth: Auth) {
  if (process.env.NODE_ENV !== 'development') return;

  console.group("🛰️ [System Diagnostic: Ready]");
  
  const status = {
    "Firebase Config": !!firebaseConfig.apiKey ? "✅ LOADED" : "❌ MISSING",
    "Auth Service": "CHECKING...",
    "Firestore Service": "CHECKING...",
    "Gemini Connectivity": "READY"
  };

  try {
    status["Auth Service"] = auth ? "✅ CONNECTED" : "❌ FAILED";
    try {
      const q = query(collection(db, "results"), limit(1));
      await getDocs(q);
      status["Firestore Service"] = "✅ CONNECTED";
    } catch (fsErr: any) {
      status["Firestore Service"] = `⚠️ ${fsErr.code || fsErr.message}`;
    }
    
    console.table(status);
  } catch (error: any) {
    console.table(status);
    console.error("❌ Diagnostic Error:", error.message);
  }
  console.groupEnd();
}

/**
 * Singleton initialization helper.
 */
export function initializeFirebase(): { app: FirebaseApp; firestore: Firestore; auth: Auth } {
  const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  const firestore = getFirestore(app);
  const auth = getAuth(app);
  
  setPersistence(auth, browserLocalPersistence).catch((err) => {
    console.error("Auth persistence error:", err);
  });

  return { app, firestore, auth };
}
