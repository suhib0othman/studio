/**
 * @fileOverview Firebase configuration and validation.
 * Ensures that environment variables are correctly loaded and provides 
 * helpful warnings for developers if configuration is missing.
 */

export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Runtime validation for environment variables
if (typeof window !== 'undefined') {
  const missingKeys = Object.entries(firebaseConfig)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

  if (missingKeys.length > 0) {
    console.warn(
      `⚠️ [Firebase Config]: Missing environment variables: ${missingKeys.join(', ')}. ` +
      `Check your .env.local file and ensure variables start with NEXT_PUBLIC_.`
    );
  }
}
