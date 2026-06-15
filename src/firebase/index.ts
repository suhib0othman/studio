'use client';

/**
 * Central Firebase Hub.
 * Manages initialization, exports services, and provides diagnostic health checks.
 */

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore, collection, getDocs, limit, query } from 'firebase/firestore';
import { getAuth, Auth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { firebaseConfig, isFirebaseConfigValid } from './config';

export * from './provider';
export * from './client-provider';
export { useUser } from './auth/use-user';
export { useCollection } from './firestore/use-collection';
export { useDoc } from './firestore/use-doc';

/**
 * Singleton initialization helper.
 */
export function initializeFirebase(): { app: FirebaseApp | null; firestore: Firestore | null; auth: Auth | null } {
  if (!isFirebaseConfigValid()) {
    return { app: null, firestore: null, auth: null };
  }

  const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  const firestore = getFirestore(app);
  const auth = getAuth(app);
  
  setPersistence(auth, browserLocalPersistence).catch((err) => {
    console.warn("Auth persistence error:", err);
  });

  return { app, firestore, auth };
}
