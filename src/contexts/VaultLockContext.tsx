import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { useAuth } from './AuthContext';
import * as vaultLock from '../services/vaultLock';

type VaultLockContextValue = {
  /** PIN exists and is turned on */
  pinEnabled: boolean;
  /** Unlocked for this app session */
  unlocked: boolean;
  loading: boolean;
  unlock: (pin: string) => Promise<boolean>;
  lock: () => void;
  setupPin: (pin: string) => Promise<void>;
  changePin: (current: string, next: string) => Promise<void>;
  removePin: (current: string) => Promise<void>;
  refreshPinStatus: () => Promise<void>;
};

const VaultLockContext = createContext<VaultLockContextValue | undefined>(
  undefined
);

export function VaultLockProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [pinEnabled, setPinEnabled] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [loading, setLoading] = useState(true);

const refreshPinStatus = useCallback(async () => {
  try {
    const enabled = await vaultLock.isVaultPinEnabled();
    setPinEnabled(enabled);
    // If PIN is off → vault is always open
    if (!enabled) {
      setUnlocked(true);
    }
    // If PIN is on → DO NOT set unlocked here.
    // Leave session unlock state alone (true after correct PIN, false after lock/logout).
  } finally {
    setLoading(false);
  }
}, []);

// First mount only: decide initial lock
useEffect(() => {
  let cancelled = false;
  (async () => {
    setLoading(true);
    try {
      const enabled = await vaultLock.isVaultPinEnabled();
      if (cancelled) return;
      setPinEnabled(enabled);
      setUnlocked(!enabled); // PIN on → start locked; PIN off → open
    } finally {
      if (!cancelled) setLoading(false);
    }
  })();
  return () => {
    cancelled = true;
  };
}, []);


  useEffect(() => {
    refreshPinStatus();
  }, [refreshPinStatus]);

  // Lock again when the user signs out
  useEffect(() => {
    if (!user) {
      setUnlocked(false);
    }
  }, [user]);

const setupPin = useCallback(async (pin: string) => {
  await vaultLock.setVaultPin(pin);
  setPinEnabled(true);
  setUnlocked(false); // must unlock once after enabling
}, []);

const changePin = useCallback(async (current: string, next: string) => {
  await vaultLock.changeVaultPin(current, next);
  // do not change unlocked
}, []);

const removePin = useCallback(async (current: string) => {
  await vaultLock.removeVaultPin(current);
  setPinEnabled(false);
  setUnlocked(true);
}, []);

const unlock = useCallback(async (pin: string) => {
  const ok = await vaultLock.verifyVaultPin(pin);
  if (ok) setUnlocked(true);
  return ok;
}, []);

const lock = useCallback(() => {
  setUnlocked(false);
}, []);

// On logout
useEffect(() => {
  if (!user) {
    setUnlocked(false);
  }
}, [user]);

  return (
    <VaultLockContext.Provider
      value={{
        pinEnabled,
        unlocked,
        loading,
        unlock,
        lock,
        setupPin,
        changePin,
        removePin,
        refreshPinStatus,
      }}
    >
      {children}
    </VaultLockContext.Provider>
  );
}

export function useVaultLock() {
  const ctx = useContext(VaultLockContext);
  if (!ctx) {
    throw new Error('useVaultLock must be used within VaultLockProvider');
  }
  return ctx;
}