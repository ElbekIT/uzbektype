/// <reference types="vite/client" />
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc,
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs, 
  addDoc,
  increment,
  getDocFromServer
} from 'firebase/firestore';

const metaEnv = (import.meta as any).env || {};

// Configuration as provided by the user with standard VITE_ environment variable fallbacks
const firebaseConfig = {
  apiKey: metaEnv.VITE_FIREBASE_API_KEY || "AIzaSyAGUfqFnP1R__rX4wiWfYMLF-z74rG3ucQ",
  authDomain: metaEnv.VITE_FIREBASE_AUTH_DOMAIN || "typing-euro.firebaseapp.com",
  databaseURL: metaEnv.VITE_FIREBASE_DATABASE_URL || "https://typing-euro-default-rtdb.firebaseio.com",
  projectId: metaEnv.VITE_FIREBASE_PROJECT_ID || "typing-euro",
  storageBucket: metaEnv.VITE_FIREBASE_STORAGE_BUCKET || "typing-euro.firebasestorage.app",
  messagingSenderId: metaEnv.VITE_FIREBASE_MESSAGING_SENDER_ID || "595263740564",
  appId: metaEnv.VITE_FIREBASE_APP_ID || "1:595263740564:web:224a293689db4fe679f281",
  measurementId: metaEnv.VITE_FIREBASE_MEASUREMENT_ID || "G-Y0X828SHR9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

// Standard prompt-mandated validation rule connection testing
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration.");
    }
  }
}
testConnection();
