import { initializeApp } from 'firebase/app';
import { initializeAuth, getAuth } from 'firebase/auth';
import type { Persistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Firebase configuration
// Users should replace these with their own Firebase project credentials
const firebaseConfig = {
  apiKey: "AIzaSyDOgQI21sIXK10ukjA3VPdkuu18QQXuTr0",
  authDomain: "protein-tracker-5cbf2.firebaseapp.com",
  projectId: "protein-tracker-5cbf2",
  storageBucket: "protein-tracker-5cbf2.firebasestorage.app",
  messagingSenderId: "397020955391",
  appId: "1:397020955391:web:73e931975b97f26e2502ca",
  measurementId: "G-QYRN72ZT81"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication with platform-appropriate session persistence.
// On native (iOS/Android), auth tokens are stored in AsyncStorage (sandboxed per-app),
// so the session survives app restarts without relying on cookies or web storage.
// On web, getAuth defaults to localStorage (sandboxed per-origin), which already
// persists sessions across page reloads.
function createAuth() {
  if (Platform.OS === 'web') {
    return getAuth(app);
  }
  // getReactNativePersistence is exported from the React Native-specific firebase/auth
  // bundle (resolved by Metro at runtime) but absent from the generic TypeScript
  // declarations. The require cast is the standard workaround for this type gap.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { getReactNativePersistence } = require('firebase/auth') as {
    getReactNativePersistence: (storage: typeof AsyncStorage) => Persistence;
  };
  return initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) });
}

export const auth = createAuth();

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

export default app;
