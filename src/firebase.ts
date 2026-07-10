import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  limit, 
  onSnapshot, 
  serverTimestamp, 
  getDocFromServer 
} from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyAGUfqFnP1R__rX4wiWfYMLF-z74rG3ucQ",
  authDomain: "typing-euro.firebaseapp.com",
  databaseURL: "https://typing-euro-default-rtdb.firebaseio.com",
  projectId: "typing-euro",
  storageBucket: "typing-euro.firebasestorage.app",
  messagingSenderId: "595263740564",
  appId: "1:595263740564:web:224a293689db4fe679f281",
  measurementId: "G-Y0X828SHR9"
};

const app = initializeApp(firebaseConfig);

// Safe Analytics Initialization for iframe context
let analytics = null;
try {
  analytics = getAnalytics(app);
} catch (e) {
  console.warn("Analytics initialization skipped:", e);
}

export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Standardize Google login prompt
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Error handling helper as required by the firebase-integration skill
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Test Connection on Boot as mandated by Skill
export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log("Firebase connection successfully tested.");
  } catch (error: any) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration or network status.");
    }
  }
}

testConnection();
