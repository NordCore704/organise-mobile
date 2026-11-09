import {
  collection,
  doc,
  addDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
  deleteDoc,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type { Album, CreateAlbumInput } from '../types';
import { deleteMemory, getMemoriesForAlbum } from './memories';

function albumsRef() {
  return collection(db, 'albums');
}

export async function createAlbum(
  userId: string,
  familyId: string,
  input: CreateAlbumInput
): Promise<Album> {
  const title = input.title.trim();
  if (!title) throw new Error('Album title is required');

  const refDoc = await addDoc(albumsRef(), {
    familyId,
    title,
    description: input.description?.trim() || '',
    coverUrl: null,
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

export async function getAlbumsForFamily(familyId: string): Promise<Album[]> {
  const q = query(
    albumsRef(),
    where('familyId', '==', familyId),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({
    id: d.id,
    ...(d.data() as Omit<Album, 'id'>),
  }));
}

export async function getAlbumById(albumId: string): Promise<Album | null> {
  const snap = await getDoc(doc(db, 'albums', albumId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...(snap.data() as Omit<Album, 'id'>) };
}

export async function deleteAlbumAndMemories(albumId: string): Promise<void> {
  const items = await getMemoriesForAlbum(albumId);

  for (const item of items) {
    await deleteMemory(item);
  }

  await deleteDoc(doc(db, 'albums', albumId));
}