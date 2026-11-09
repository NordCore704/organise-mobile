import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useAuth } from './AuthContext';
import * as familyService from '../services/family';
import type {
  Family,
  Membership,
  MembershipRole,
  CreateFamilyInput,
  JoinFamilyInput,
  InviteCode,
} from '../types';

type FamilyContextValue = {
  families: Family[];
  currentFamily: Family | null;
  /** Active membership in the current family (if any) */
  currentMembership: Membership | null;
  /** Convenience flags for UI */
  currentRole: MembershipRole | null;
  isAdmin: boolean;
  loading: boolean;
  error: string | null;
  clearError: () => void;
  refreshFamilies: () => Promise<void>;
  setCurrentFamilyId: (id: string | null) => void;
  createFamily: (
    input: CreateFamilyInput
  ) => Promise<{ family: Family; invite: InviteCode }>;
  joinFamily: (input: JoinFamilyInput) => Promise<void>;
  createInviteCode: (
    familyId: string,
    options?: { expiresInDays?: number; maxUses?: number | null }
  ) => Promise<InviteCode>;
};

const FamilyContext = createContext<FamilyContextValue | undefined>(undefined);

export function FamilyProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  const [families, setFamilies] = useState<Family[]>([]);
  const [currentFamilyId, setCurrentFamilyId] = useState<string | null>(null);
  const [currentMembership, setCurrentMembership] = useState<Membership | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  // -------------------------------------------------------------------------
  // STEP A — load list of families when user changes
  // -------------------------------------------------------------------------
  const refreshFamilies = useCallback(async () => {
    if (!user?.uid) {
      setFamilies([]);
      setCurrentFamilyId(null);
      setCurrentMembership(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const list = await familyService.getFamiliesForUser(user.uid);
      setFamilies(list);

      setCurrentFamilyId((prev) => {
        if (prev && list.some((f) => f.id === prev)) return prev;
        return list[0]?.id ?? null;
      });
    } catch (e: any) {
      console.warn('refreshFamilies failed', e);
      setError(e?.message ?? 'Could not load families');
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  useEffect(() => {
    refreshFamilies();
  }, [refreshFamilies]);

  // -------------------------------------------------------------------------
  // STEP B — load membership (role) when user + current family are set
  // This is the important one for isAdmin / currentRole
  // -------------------------------------------------------------------------
  useEffect(() => {
    let cancelled = false;

    async function loadMembership() {
      // No user or no selected family → clear role
      if (!user?.uid || !currentFamilyId) {
        setCurrentMembership(null);
        return;
      }

      try {
        const membership = await familyService.getMembership(
          user.uid,
          currentFamilyId
        );
        if (!cancelled) {
          setCurrentMembership(membership);
        }
      } catch (e) {
        console.warn('loadMembership failed', e);
        if (!cancelled) {
          setCurrentMembership(null);
        }
      }
    }

    loadMembership();

    return () => {
      cancelled = true;
    };
  }, [user?.uid, currentFamilyId]);

  // Derived values — no extra state needed
  const currentFamily = useMemo(
    () => families.find((f) => f.id === currentFamilyId) ?? null,
    [families, currentFamilyId]
  );

  const currentRole: MembershipRole | null = currentMembership?.role ?? null;
  const isAdmin = currentRole === 'admin';

  // -------------------------------------------------------------------------
  // Create family (+ invite)
  // After this, refreshFamilies / setState will set currentFamilyId,
  // and the membership effect above will load role = admin
  // -------------------------------------------------------------------------
  const createFamily = useCallback(
    async (input: CreateFamilyInput) => {
      if (!user?.uid) throw new Error('You must be signed in');
      setError(null);

      const { family } = await familyService.createFamily(user.uid, input);

      const invite = await familyService.createInviteCode(user.uid, {
        familyId: family.id,
        role: 'member',
        expiresInDays: 7,
        maxUses: null,
      });

      setFamilies((prev) => [...prev, family]);
      setCurrentFamilyId(family.id);
      // Don't set membership manually — the useEffect (STEP B) will fetch it

      return { family, invite };
    },
    [user?.uid]
  );

  // -------------------------------------------------------------------------
  // Join family
  // Same idea: set family id, let STEP B load role (member, etc.)
  // -------------------------------------------------------------------------
  const joinFamily = useCallback(
    async (input: JoinFamilyInput) => {
      if (!user?.uid) throw new Error('You must be signed in');
      setError(null);

      const { family } = await familyService.joinFamilyWithCode(user.uid, input);

      setFamilies((prev) => {
        if (prev.some((f) => f.id === family.id)) return prev;
        return [...prev, family];
      });
      setCurrentFamilyId(family.id);
    },
    [user?.uid]
  );

  const createInviteCode = useCallback(
    async (
      familyId: string,
      options?: { expiresInDays?: number; maxUses?: number | null }
    ) => {
      if (!user?.uid) throw new Error('You must be signed in');
      setError(null);

      return familyService.createInviteCode(user.uid, {
        familyId,
        role: 'member',
        expiresInDays: options?.expiresInDays ?? 7,
        maxUses: options?.maxUses ?? null,
      });
    },
    [user?.uid]
  );

  const value: FamilyContextValue = {
    families,
    currentFamily,
    currentMembership,
    currentRole,
    isAdmin,
    loading,
    error,
    clearError,
    refreshFamilies,
    setCurrentFamilyId,
    createFamily,
    joinFamily,
    createInviteCode,
  };

  return (
    <FamilyContext.Provider value={value}>{children}</FamilyContext.Provider>
  );
}

export function useFamily() {
  const ctx = useContext(FamilyContext);
  if (!ctx) {
    throw new Error('useFamily must be used within FamilyProvider');
  }
  return ctx;
}