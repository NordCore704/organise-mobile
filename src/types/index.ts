import { Timestamp } from 'firebase/firestore';

export type MembershipRole = 'admin' | 'member' | 'viewer';
export type MembershipStatus = 'active' | 'soft_deleted';
export type InviteCodeStatus = 'active' | 'revoked' | 'expired';

export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Family {
  id: string;
  name: string;
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Membership {
  id: string;
  userId: string;
  familyId: string;
  role: MembershipRole;
  status: MembershipStatus;
  joinedAt: Timestamp;
  updatedAt: Timestamp;
  invitedBy?: string;
}

export interface InviteCode {
  id: string;
  code: string;
  familyId: string;
  createdBy: string;
  role: MembershipRole;
  expiresAt: Timestamp;
  maxUses: number | null;
  usedCount: number;
  status: InviteCodeStatus;
  createdAt: Timestamp;
}

export type CreateFamilyInput = { name: string };
export type JoinFamilyInput = { code: string };
export type CreateInviteCodeInput = {
  familyId: string;
  role?: MembershipRole;
  expiresInDays?: number;
  maxUses?: number | null;
};

export type TaskPriority = 'high' | 'med' | 'low';
export type TaskStatus = 'open' | 'done';

export interface Task {
  id: string;
  familyId: string;
  title: string;
  notes?: string;
  priority: TaskPriority;
  status: TaskStatus;
  createdBy: string;
  completedBy?: string | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  completedAt?: Timestamp | null;
}

export type CreateTaskInput = {
  title: string;
  notes?: string;
  priority?: TaskPriority;
};

// ----- Memories -----
export type MemoryVisibility = 'family' | 'link' | 'members';

export interface Memory {
  id: string;
  familyId: string;
  title: string;
  caption?: string;
  /** Firebase Storage download URL (optional for text-only) */
  imageUrl?: string;
  /** Storage path for deletes later */
  imagePath?: string;
  visibility: MemoryVisibility;
  /** Random token when visibility === 'link' */
  shareToken?: string | null;
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ----- Vault -----
export type VaultItemType = 'document' | 'note' | 'possession';

export interface VaultItem {
  id: string;
  familyId: string;
  title: string;
  description?: string;
  type: VaultItemType;
  /** Optional file in Storage */
  fileUrl?: string;
  filePath?: string;
  fileName?: string;
  /** Who uploaded it */
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// export type CreateVaultItemInput = {
//   title: string;
//   description?: string;
//   type: VaultItemType;
//   fileUrl?: string;
//   filePath?: string;
//   fileName?: string;
// };

// src/types — add / update

export interface Album {
  id: string;
  familyId: string;
  title: string;
  description?: string;
  coverUrl?: string;
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Memory {
  id: string;
  familyId: string;
  albumId: string;          // required — belongs to a folder
  title: string;
  caption?: string;
  imageUrl?: string;
  imagePath?: string;
  visibility: MemoryVisibility;
  shareToken?: string | null;
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  /** When visibility === 'members' */
  allowedUserIds?: string[];
}

export type CreateAlbumInput = {
  title: string;
  description?: string;
};

export type CreateMemoryInput = {
  albumId: string;
  title?: string;
  caption?: string;
  imageUrl?: string;
  imagePath?: string;
  visibility?: MemoryVisibility;
};
export type VaultItemType = 'note' | 'possession' | 'document' | 'memory_ref';

export interface VaultCategory {
  id: string;
  familyId: string;
  title: string;
  description?: string;
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface VaultItem {
  id: string;
  familyId: string;
  categoryId: string;
  type: VaultItemType;
  title: string;
  description?: string;
  imageUrl?: string;
  fileUrl?: string;
  fileName?: string;
  albumId?: string;
  memoryId?: string;
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type CreateVaultCategoryInput = {
  title: string;
  description?: string;
};

export type CreateVaultItemInput = {
  categoryId: string;
  type: VaultItemType;
  title: string;
  description?: string;
  imageUrl?: string;
  fileUrl?: string;
  fileName?: string;
  albumId?: string;
  memoryId?: string;
};