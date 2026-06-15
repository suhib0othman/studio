'use client';

import React, { useMemo } from 'react';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { firebaseConfig, isFirebaseConfigValid } from './config';
import { FirebaseProvider } from './provider';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Terminal } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Ensures Firebase is initialized once on the client and provides
 * access to Firebase services via context.
 */
export function FirebaseClientProvider({ children }: { children: React.ReactNode }) {
  const isValid = useMemo(() => isFirebaseConfigValid(), []);

  const firebaseServices = useMemo(() => {
    if (!isValid) return null;

    // Initialize once
    const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    const firestore = getFirestore(app);
    const auth = getAuth(app);
    
    // Ensure persistence is set for session stability
    setPersistence(auth, browserLocalPersistence).catch((err) => {
      console.warn("Auth persistence setup failed:", err);
    });
    
    return { app, firestore, auth };
  }, [isValid]);

  if (!isValid || !firebaseServices) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-background" dir="rtl">
        <div className="max-w-md w-full space-y-6">
          <Alert variant="destructive" className="border-destructive/50 bg-destructive/5">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle className="font-bold text-lg mb-2">تنبيه: إعدادات Firebase مفقودة</AlertTitle>
            <AlertDescription className="space-y-4">
              <p>لم يتم العثور على متغيرات البيئة الخاصة بـ Firebase. يرجى التأكد من ضبط ملف <code>.env</code> الخاص بك.</p>
              <div className="bg-black/20 p-3 rounded-lg font-mono text-[10px] break-all">
                NEXT_PUBLIC_FIREBASE_API_KEY=...
              </div>
            </AlertDescription>
          </Alert>
          <Button 
            className="w-full h-12 rounded-xl font-bold" 
            onClick={() => window.location.reload()}
          >
            إعادة تحميل الصفحة
          </Button>
        </div>
      </div>
    );
  }

  return (
    <FirebaseProvider 
      app={firebaseServices.app} 
      firestore={firebaseServices.firestore} 
      auth={firebaseServices.auth}
    >
      <FirebaseErrorListener />
      {children}
    </FirebaseProvider>
  );
}
