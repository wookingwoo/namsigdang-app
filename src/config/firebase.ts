import { FirebaseApp, getApps, initializeApp } from "firebase/app";
import { Firestore, getFirestore } from "firebase/firestore";

type FirebaseConfig = {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
};

function getFirebaseConfig(): FirebaseConfig {
  const config = {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  };

  const missingKeys = Object.entries(config)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missingKeys.length > 0) {
    throw new Error(
      `Firebase 환경 변수가 비어 있습니다: ${missingKeys.join(", ")}`,
    );
  }

  return config as FirebaseConfig;
}

let app: FirebaseApp | null = null;
let firestore: Firestore | null = null;

export function getFirebaseApp() {
  if (app) {
    return app;
  }

  app = getApps()[0] ?? initializeApp(getFirebaseConfig());
  return app;
}

export function getDb() {
  if (firestore) {
    return firestore;
  }

  firestore = getFirestore(getFirebaseApp());
  return firestore;
}
