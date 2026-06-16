'use client';

import React, { useMemo, useEffect } from 'react';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { firebaseConfig, isFirebaseConfigValid } from './config';
import { FirebaseProvider } from './provider';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function FirebaseClientProvider({ children }: { children: React.ReactNode }) {
  const isValid = useMemo(() => isFirebaseConfigValid(), []);

  const services = useMemo(() => {
    if (!isValid) return null;
    const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    const firestore = getFirestore(app);
    const auth = getAuth(app);
    return { app, firestore, auth };
  }, [isValid]);

  useEffect(() => {
    if (services?.auth) {
      setPersistence(services.auth, browserLocalPersistence).catch((err) => {
        console.warn("Auth persistence setup failed:", err);
      });
    }
  }, [services?.auth]);

  if (!isValid || !services) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-background" dir="rtl">
        <div className="max-w-md w-full space-y-6 text-right">
          <Alert variant="destructive" className="border-destructive/50 bg-destructive/5">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle className="font-bold text-lg mb-2">تنبيه: إعدادات Firebase مفقودة</AlertTitle>
            <AlertDescription className="space-y-4">
              <p>لم يتم العثور على مفاتيح الاتصال الخاصة بـ Firebase. يرجى ضبط المتغيرات في Vercel أو ملف .env</p>
            </AlertDescription>
          </Alert>
          <Button className="w-full h-12 rounded-xl font-bold" onClick={() => window.location.reload()}>
            إعادة المحاولة
          </Button>
        </div>
      </div>
    );
  }

  return (
    <FirebaseProvider app={services.app} firestore={services.firestore} auth={services.auth}>
      <FirebaseErrorListener />
      {children}
    </FirebaseProvider>
  );
}
