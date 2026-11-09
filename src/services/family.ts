/**
 * Family service
 * -------------
 * All Firestore reads/writes for families, memberships, and invite codes.
 * Keep UI out of this file — screens only call these functions.
 */

import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  serverTimestamp,
  Timestamp,
  writeBatch,
  limit,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type {
  Family,
  Membership,
  InviteCode,
  MembershipRole,
  CreateFamilyInput,
  JoinFamilyInput,
  CreateInviteCodeInput,
} from '../types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Simple invite code, e.g. FAM-7K2P */
function generateInviteCode(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no confusing 0/O/1/I
  let chunk = '';
  for (let i = 0; i < 4; i++) {
    chunk += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return `FAM-${chunk}`;
}

function membershipsRef() {
  return collection(db, 'memberships');
}

function familiesRef() {
  return collection(db, 'families');
}

function inviteCodesRef() {
  return collection(db, 'inviteCodes');
}

// ---------------------------------------------------------------------------
// Create family
// ---------------------------------------------------------------------------

/**
 * Creates a family and makes the current user the first admin.
 * Uses a batch so either both writes succeed or neither does.
 */
export async function createFamily(
  userId: string,
  input: CreateFamilyInput
): Promise<{ family: Family; membership: Membership }> {
  const name = input.name.trim();
  if (!name) {
    throw new Error('Family name is required');
  }

  const batch = writeBatch(db);

  // 1) Family document
  const familyRef = doc(familiesRef());
  const familyData = {
    name,
    createdBy: userId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  batch.set(familyRef, familyData);

  // 2) Membership (admin)
  const membershipRef = doc(membershipsRef());
  const membershipData = {
    userId,
    familyId: familyRef.id,
    role: 'admin' as MembershipRole,
    status: 'active' as const,
    joinedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  batch.set(membershipRef, membershipData);

  await batch.commit();

  // Return shapes the UI can use (timestamps may be null until next read)
  const family: Family = {
    id: familyRef.id,
    name,
    createdBy: userId,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };

  const membership: Membership = {
    id: membershipRef.id,
    userId,
    familyId: familyRef.id,
    role: 'admin',
    status: 'active',
    joinedAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };

  return { family, membership };
}

// ---------------------------------------------------------------------------
// Read families for a user
// ---------------------------------------------------------------------------

/**
 * Active memberships for a user, then load each family document.
 */
export async function getFamiliesForUser(userId: string): Promise<Family[]> {
  const q = query(
    membershipsRef(),
    where('userId', '==', userId),
    where('status', '==', 'active')
  );

  const snap = await getDocs(q);
  if (snap.empty) return [];

  const families: Family[] = [];

  for (const membershipDoc of snap.docs) {
    const membership = membershipDoc.data() as Omit<Membership, 'id'>;
    const familySnap = await getDoc(doc(db, 'families', membership.familyId));

    if (familySnap.exists()) {
      families.push({
        id: familySnap.id,
        ...(familySnap.data() as Omit<Family, 'id'>),
      });
    }
  }

  return families;
}

/**
 * Membership row for one user in one family (active only).
 */
export async function getMembership(
  userId: string,
  familyId: string
): Promise<Membership | null> {
  const q = query(
    membershipsRef(),
    where('userId', '==', userId),
    where('familyId', '==', familyId),
    where('status', '==', 'active'),
    limit(1)
  );

  const snap = await getDocs(q);
  if (snap.empty) return null;

  const d = snap.docs[0];
  return { id: d.id, ...(d.data() as Omit<Membership, 'id'>) };
}

// ---------------------------------------------------------------------------
// Invite codes
// ---------------------------------------------------------------------------

/**
 * Admin creates an invite code for a family.
 * Default: member role, expires in 7 days, unlimited uses.
 */
export async function createInviteCode(
  userId: string,
  input: CreateInviteCodeInput
): Promise<InviteCode> {
  const {
    familyId,
    role = 'member',
    expiresInDays = 7,
    maxUses = null,
  } = input;

  // Caller must be an active admin of this family
  const membership = await getMembership(userId, familyId);
  if (!membership || membership.role !== 'admin') {
    throw new Error('Only family admins can create invite codes');
  }

  const code = generateInviteCode();
  const expiresAt = Timestamp.fromDate(
    new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
  );

  const ref = doc(inviteCodesRef());
  const data = {
    code,
    familyId,
    createdBy: userId,
    role,
    expiresAt,
    maxUses,
    usedCount: 0,
    status: 'active' as const,
    createdAt: serverTimestamp(),
  };

  await setDoc(ref, data);

  return {
    id: ref.id,
    code,
    familyId,
    createdBy: userId,
    role,
    expiresAt,
    maxUses,
    usedCount: 0,
    status: 'active',
    createdAt: Timestamp.now(),
  };
}

/**
 * Find an invite by its code string (e.g. FAM-7K2P).
 */
async function findInviteByCode(code: string): Promise<InviteCode | null> {
  const normalized = code.trim().toUpperCase();
  if (!normalized) return null;

  const q = query(inviteCodesRef(), where('code', '==', normalized), limit(1));
  const snap = await getDocs(q);
  if (snap.empty) return null;

  const d = snap.docs[0];
  return { id: d.id, ...(d.data() as Omit<InviteCode, 'id'>) };
}

function assertInviteUsable(invite: InviteCode): void {
  if (invite.status !== 'active') {
    throw new Error('This invite code is no longer active');
  }

  if (invite.expiresAt.toMillis() < Date.now()) {
    throw new Error('This invite code has expired');
  }

  if (invite.maxUses != null && invite.usedCount >= invite.maxUses) {
    throw new Error('This invite code has reached its use limit');
  }
}

// ---------------------------------------------------------------------------
// Join family
// ---------------------------------------------------------------------------

/**
 * Join a family using an invite code.
 * Validates code, prevents duplicates, creates membership, increments use count.
 */
export async function joinFamilyWithCode(
  userId: string,
  input: JoinFamilyInput
): Promise<{ family: Family; membership: Membership }> {
  const invite = await findInviteByCode(input.code);

  if (!invite) {
    throw new Error('Invalid invite code. Check the code and try again.');
  }

  assertInviteUsable(invite);

  // Already an active member?
  const existing = await getMembership(userId, invite.familyId);
  if (existing) {
    throw new Error('You are already a member of this family');
  }

  const familySnap = await getDoc(doc(db, 'families', invite.familyId));
  if (!familySnap.exists()) {
    throw new Error('This family no longer exists');
  }

  const batch = writeBatch(db);

  // 1) Membership
  const membershipRef = doc(membershipsRef());
  batch.set(membershipRef, {
    userId,
    familyId: invite.familyId,
    role: invite.role,
    status: 'active',
    joinedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    invitedBy: invite.createdBy,
  });

  // 2) Increment usedCount on the invite
  const inviteRef = doc(db, 'inviteCodes', invite.id);
  batch.update(inviteRef, {
    usedCount: invite.usedCount + 1,
  });

  await batch.commit();

  const family: Family = {
    id: familySnap.id,
    ...(familySnap.data() as Omit<Family, 'id'>),
  };

  const membership: Membership = {
    id: membershipRef.id,
    userId,
    familyId: invite.familyId,
    role: invite.role,
    status: 'active',
    joinedAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    invitedBy: invite.createdBy,
  };

  return { family, membership };
}

/**
 * All active members of a family (for Manage Family screen).
 */
export async function getMembersForFamily(familyId: string): Promise<Membership[]> {
  const q = query(
    membershipsRef(),
    where('familyId', '==', familyId),
    where('status', '==', 'active')
  );

  const snap = await getDocs(q);

  return snap.docs.map((d) => ({
    id: d.id,
    ...(d.data() as Omit<Membership, 'id'>),
  }));
}

/**
 * Load basic user profiles for a list of user ids.
 * (One read per user — fine for small families.)
 */
export async function getUsersByIds(
  userIds: string[]
): Promise<Record<string, { displayName: string; email: string }>> {
  const result: Record<string, { displayName: string; email: string }> = {};

  await Promise.all(
    userIds.map(async (uid) => {
      const snap = await getDoc(doc(db, 'users', uid));
      if (snap.exists()) {
        const data = snap.data();
        result[uid] = {
          displayName: data.displayName || 'Member',
          email: data.email || '',
        };
      } else {
        result[uid] = { displayName: 'Member', email: '' };
      }
    })
  );

  return result;
}

/**
 * Soft-remove a member. Blocks removing the last active admin.
 */
export async function removeMember(
  adminUserId: string,
  familyId: string,
  membershipId: string,
  targetUserId: string
): Promise<void> {
  const adminMembership = await getMembership(adminUserId, familyId);
  if (!adminMembership || adminMembership.role !== 'admin') {
    throw new Error('Only admins can remove members');
  }

  // Count active admins
  const members = await getMembersForFamily(familyId);
  const target = members.find((m) => m.id === membershipId);
  if (!target || target.status !== 'active') {
    throw new Error('Member not found');
  }

  if (target.role === 'admin') {
    const adminCount = members.filter((m) => m.role === 'admin').length;
    if (adminCount <= 1) {
      throw new Error(
        'You cannot remove the last admin. Promote another member first.'
      );
    }
  }

  await updateDoc(doc(db, 'memberships', membershipId), {
    status: 'soft_deleted',
    updatedAt: serverTimestamp(),
  });
}

/**
 * Change a member's role (admin only).
 * Blocks demoting the last admin.
 */
export async function setMemberRole(
  adminUserId: string,
  familyId: string,
  membershipId: string,
  newRole: MembershipRole
): Promise<void> {
  const adminMembership = await getMembership(adminUserId, familyId);
  if (!adminMembership || adminMembership.role !== 'admin') {
    throw new Error('Only admins can change roles');
  }

  const members = await getMembersForFamily(familyId);
  const target = members.find((m) => m.id === membershipId);
  if (!target) {
    throw new Error('Member not found');
  }

  if (target.role === 'admin' && newRole !== 'admin') {
    const adminCount = members.filter((m) => m.role === 'admin').length;
    if (adminCount <= 1) {
      throw new Error(
        'You cannot demote the last admin. Promote another member first.'
      );
    }
  }

  await updateDoc(doc(db, 'memberships', membershipId), {
    role: newRole,
    updatedAt: serverTimestamp(),
  });
}