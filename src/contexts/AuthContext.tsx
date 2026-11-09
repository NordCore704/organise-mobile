import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import {
  signUp as authSignUp,
  signIn as authSignIn,
  logOut as authLogOut,
  resetPassword as authResetPassword,
  getUserProfile,
  subscribeToAuthState,
} from '../services/auth';
import { User } from '../types';

interface AuthContextValue {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  error: string | null;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  logOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

useEffect(() => {
  const unsubscribe = subscribeToAuthState(async (fbUser) => {
    setFirebaseUser(fbUser);

    if (!fbUser) {
      setUser(null);
      setLoading(false);
      return;
    }

    // Always set a usable user from Auth first so navigation can proceed
    const fallbackUser = {
      uid: fbUser.uid,
      email: fbUser.email ?? '',
      displayName: fbUser.displayName ?? fbUser.email ?? 'User',
      createdAt: null as any,
      updatedAt: null as any,
    };

    setUser(fallbackUser);

    // Then try to enrich from Firestore (non-blocking for login)
    try {
      const profile = await getUserProfile(fbUser.uid);
      if (profile) {
        setUser(profile);
      }
    } catch (e) {
      console.warn('Profile enrich failed', e);
    }

    setLoading(false);
  });

  return unsubscribe;
}, []);

  const signUp = async (email: string, password: string, displayName: string) => {
    setError(null);
    try {
      const newUser = await authSignUp(email, password, displayName);
      setUser(newUser);
    } catch (e: any) {
      setError(e.message || 'Sign up failed');
      throw e;
    }
  };

const signIn = async (email: string, password: string) => {
  setError(null);
  try {
    await authSignIn(email, password);
    // Do NOT require Firestore here
  } catch (e: any) {
    setError(e.message || 'Sign in failed');
    throw e;
  }
};

  const logOut = async () => {
    setError(null);
    try {
      await authLogOut();
      setUser(null);
    } catch (e: any) {
      setError(e.message || 'Log out failed');
      throw e;
    }
  };

  const resetPassword = async (email: string) => {
    setError(null);
    try {
      await authResetPassword(email);
    } catch (e: any) {
      setError(e.message || 'Password reset failed');
      throw e;
    }
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        loading,
        error,
        signUp,
        signIn,
        logOut,
        resetPassword,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
