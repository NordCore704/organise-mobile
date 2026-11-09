import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  User as FirebaseUser,
  onAuthStateChanged,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { User } from '../types';

/**
 * Create a new user account with email + password
 * Also creates the corresponding user document in Firestore.
 */
export async function signUp(
  email: string,
  password: string,
  displayName: string
): Promise<User> {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  const firebaseUser = credential.user;

  // Update Firebase Auth profile
  await updateProfile(firebaseUser, { displayName });

  // Create user document in Firestore
  const userData = {
    uid: firebaseUser.uid,
    email: firebaseUser.email!,
    displayName,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  await setDoc(doc(db, 'users', firebaseUser.uid), userData);

  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email!,
    displayName,
    createdAt: userData.createdAt as any,
    updatedAt: userData.updatedAt as any,
  };
}

/**
 * Sign in with email + password
 */
export async function signIn(email: string, password: string): Promise<FirebaseUser> {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return credential.user;
}

/**
 * Sign out the current user
 */
export async function logOut(): Promise<void> {
  await signOut(auth);
}

/**
 * Send password reset email
 */
export async function resetPassword(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email);
}

/**
 * Fetch the user profile document from Firestore
 */
export async function getUserProfile(uid: string): Promise<User | null> {
  try {
    const snap = await getDoc(doc(db, 'users', uid));
    if (!snap.exists()) return null;
    return snap.data() as User;
  } catch (e) {
    console.warn('getUserProfile failed:', e);
    return null;
  }
}

/**
 * Subscribe to auth state changes
 */
export function subscribeToAuthState(
  callback: (user: FirebaseUser | null) => void
): () => void {
  return onAuthStateChanged(auth, callback);
}
