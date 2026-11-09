/**
 * Vault service — critical family info (separate from Memories).
 */

import {
  collection,
  doc,
  addDoc,
  getDocs,
  getDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type {
  VaultCategory,
  VaultItem,
  CreateVaultCategoryInput,
  CreateVaultItemInput,
} from '../types';

function categoriesRef() {
  return collection(db, 'vaultCategories');
}

function itemsRef() {
  return collection(db, 'vaultItems');
}

// ----- Categories -----

export async function createCategory(
  userId: string,
  familyId: string,
  input: CreateVaultCategoryInput
): Promise<VaultCategory> {
  const title = input.title.trim();
  if (!title) throw new Error('Category name is required');

  const refDoc = await addDoc(categoriesRef(), {
    familyId,
    title,
    description: input.description?.trim() || '',
    createdBy: userId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return {
    id: refDoc.id,
    familyId,
    title,
    description: input.description?.trim() || '',
    createdBy: userId,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };
}

export async function getCategoriesForFamily(
  familyId: string
): Promise<VaultCategory[]> {
  const q = query(categoriesRef(), where('familyId', '==', familyId));
  const snap = await getDocs(q);
  const list = snap.docs.map((d) => ({
    id: d.id,
    ...(d.data() as Omit<VaultCategory, 'id'>),
  }));
  list.sort((a, b) => {
    const ta = a.createdAt?.toMillis?.() ?? 0;
    const tb = b.createdAt?.toMillis?.() ?? 0;
    return tb - ta;
  });
  return list;
}

export async function getCategoryById(
  categoryId: string
): Promise<VaultCategory | null> {
  const snap = await getDoc(doc(db, 'vaultCategories', categoryId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...(snap.data() as Omit<VaultCategory, 'id'>) };
}

export async function deleteCategory(categoryId: string): Promise<void> {
  const items = await getItemsForCategory(categoryId);
  for (const item of items) {
    await deleteDoc(doc(db, 'vaultItems', item.id));
  }
  await deleteDoc(doc(db, 'vaultCategories', categoryId));
}

// ----- Items -----

export async function createItem(
  userId: string,
  familyId: string,
  input: CreateVaultItemInput
): Promise<VaultItem> {
  const title = input.title.trim();
  if (!title) throw new Error('Title is required');
  if (!input.categoryId) throw new Error('categoryId is required');

  const refDoc = await addDoc(itemsRef(), {
    familyId,
    categoryId: input.categoryId,
    type: input.type,
    title,
    description: input.description?.trim() || '',
    imageUrl: input.imageUrl || null,
    fileUrl: input.fileUrl || null,
    fileName: input.fileName || null,
    albumId: input.albumId || null,
    memoryId: input.memoryId || null,
    createdBy: userId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return {
    id: refDoc.id,
    familyId,
    categoryId: input.categoryId,
    type: input.type,
    title,
    description: input.description?.trim() || '',
    imageUrl: input.imageUrl,
    fileUrl: input.fileUrl,
    fileName: input.fileName,
    albumId: input.albumId,
    memoryId: input.memoryId,
    createdBy: userId,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };
}

export async function getItemsForCategory(
  categoryId: string
): Promise<VaultItem[]> {
  const q = query(itemsRef(), where('categoryId', '==', categoryId));
  const snap = await getDocs(q);
  const list = snap.docs.map((d) => ({
    id: d.id,
    ...(d.data() as Omit<VaultItem, 'id'>),
  }));
  list.sort((a, b) => {
    const ta = a.createdAt?.toMillis?.() ?? 0;
    const tb = b.createdAt?.toMillis?.() ?? 0;
    return tb - ta;
  });
  return list;
}

export async function deleteItem(itemId: string): Promise<void> {
  await deleteDoc(doc(db, 'vaultItems', itemId));
}