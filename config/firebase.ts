import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

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

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

export default app;
