import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  initializeAuth,
  getAuth,
  // @ts-expect-error RN persistence exists at runtime
  getReactNativePersistence,
} from 'firebase/auth';
import { initializeFirestore, getFirestore, memoryLocalCache } from 'firebase/firestore';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { getStorage } from 'firebase/storage';



const firebaseConfig = {
  apiKey: 'AIzaSyBrKmTO9bQXmu3xnu6jpFc0AnF2xjv9Fo4',
  authDomain: 'family-app-e0b1f.firebaseapp.com',
  projectId: 'family-app-e0b1f',
  storageBucket: 'family-app-e0b1f.firebasestorage.app',
  messagingSenderId: '238172007406',
  appId: '1:238172007406:web:6271d9f991f69093d6fcff',
  measurementId: "G-3JC0VCR0SW"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Auth
let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage),
  });
} catch {
  auth = getAuth(app);
}

// Firestore — important for React Native / Expo
let db;
try {
  db = initializeFirestore(app, {
    experimentalForceLongPolling: true,
    localCache: memoryLocalCache(),
  });
} catch {
  // Already initialized (hot reload)
  db = getFirestore(app);
}

export { auth, db };
export const storage = getStorage(app);