import {
  collection,
  doc,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';
import { ref, getDownloadURL } from 'firebase/storage';
import * as FileSystem from 'expo-file-system/legacy';
import { decode } from 'base64-arraybuffer';
import { supabase, MEDIA_BUCKET } from '../config/supabase';
import { auth, db, storage } from '../config/firebase';
import type { Memory, CreateMemoryInput, MemoryVisibility } from '../types';



/** Convert base64 → Uint8Array without using Blob */
function base64ToUint8Array(base64: string): Uint8Array {
  const binary =
    typeof atob === 'function'
      ? atob(base64)
      : Buffer.from(base64, 'base64').toString('binary');

  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}


export async function uploadMemoryImage(
  familyId: string,
  userId: string,
  uri: string
): Promise<{ imageUrl: string; imagePath: string }> {
  const base64 = await FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  const bytes = decode(base64);
  const imagePath = `${familyId}/memories/${userId}_${Date.now()}.jpg`;

  const { error } = await supabase.storage
    .from(MEDIA_BUCKET)
    .upload(imagePath, bytes, {
      contentType: 'image/jpeg',
      upsert: false,
    });

  if (error) {
    throw new Error(error.message || 'Upload to Supabase failed');
  }

  const { data } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(imagePath);

  if (!data?.publicUrl) {
    throw new Error('Could not get public URL for uploaded image');
  }

  return {
    imageUrl: data.publicUrl,
    imagePath, // path inside the bucket
  };
}

function memoriesRef() {
  return collection(db, 'memories');
}

function makeShareToken() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
}

/** Upload image bytes to Storage; returns url + path */

export async function createMemory(
  userId: string,
  familyId: string,
  input: CreateMemoryInput
): Promise<Memory> {
  if (!input.albumId) throw new Error('albumId is required');

  const visibility = input.visibility ?? 'family';
  const shareToken = visibility === 'link' ? makeShareToken() : null;

  const refDoc = await addDoc(memoriesRef(), {
    familyId,
    albumId: input.albumId,
    title: input.title?.trim() || '',
    caption: input.caption?.trim() || '',
    imageUrl: input.imageUrl || null,
    imagePath: input.imagePath || null,
    visibility,
    shareToken,
    createdBy: userId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return {
    id: refDoc.id,
    familyId,
    albumId: input.albumId,
    title: input.title?.trim() || '',
    caption: input.caption?.trim() || '',
    imageUrl: input.imageUrl,
    imagePath: input.imagePath,
    visibility,
    shareToken,
    createdBy: userId,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };
}

export async function getMemoriesForAlbum(albumId: string): Promise<Memory[]> {
  
  const q = query(memoriesRef(), where('albumId', '==', albumId));
  const snap = await getDocs(q);

  const list = snap.docs.map((d) => ({
    id: d.id,
    ...(d.data() as Omit<Memory, 'id'>),
  }));

  // Sort on the client
  list.sort((a, b) => {
    const ta = a.createdAt?.toMillis?.() ?? 0;
    const tb = b.createdAt?.toMillis?.() ?? 0;
    return tb - ta;
  });

  return list;
}

export async function getMemoriesForFamily(familyId: string): Promise<Memory[]> {
  const q = query(
    memoriesRef(),
    where('familyId', '==', familyId),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({
    id: d.id,
    ...(d.data() as Omit<Memory, 'id'>),
  }));
}

export async function deleteMemory(memory: {
  id: string;
  imagePath?: string | null;
}): Promise<void> {
  if (memory.imagePath) {
    const { error } = await supabase.storage
      .from(MEDIA_BUCKET)
      .remove([memory.imagePath]);
    if (error) {
      console.warn('Supabase delete file:', error.message);
      // still delete Firestore doc
    }
  }
  await deleteDoc(doc(db, 'memories', memory.id));
}

export async function setMemoryVisibility(
  memoryId: string,
  visibility: MemoryVisibility,
  allowedUserIds: string[] = []
): Promise<string | null> {
  const shareToken =
    visibility === 'link'
      ? Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4)
      : null;

  await updateDoc(doc(db, 'memories', memoryId), {
    visibility,
    shareToken,
    allowedUserIds: visibility === 'members' ? allowedUserIds : [],
    updatedAt: serverTimestamp(),
  });

  return shareToken;
}

/** Client-side filter: what the current user is allowed to see */
export function canUserViewMemory(
  memory: Memory,
  userId: string,
  isFamilyMember: boolean
): boolean {
  if (memory.createdBy === userId) return true;

  switch (memory.visibility) {
    case 'family':
      return isFamilyMember;
    case 'members':
      return (memory.allowedUserIds ?? []).includes(userId);
    case 'link':
      // In-app: treat as visible to family; public web link is a later feature
      return isFamilyMember;
    default:
      return isFamilyMember;
  }
}