/**
 * Tasks service
 * ------------
 * Shared to-dos for one family. Keep UI out of this file.
 */

import {
  collection,
  doc,
  addDoc,
  getDocs,
  updateDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type { Task, TaskPriority, CreateTaskInput } from '../types';

function tasksRef() {
  return collection(db, 'tasks');
}

/**
 * Create a task in a family.
 */
export async function createTask(
  userId: string,
  familyId: string,
  input: CreateTaskInput
): Promise<Task> {
  const title = input.title.trim();
  if (!title) {
    throw new Error('Task title is required');
  }

  const priority: TaskPriority = input.priority ?? 'med';

  const ref = await addDoc(tasksRef(), {
    familyId,
    title,
    notes: input.notes?.trim() || '',
    priority,
    status: 'open',
    createdBy: userId,
    completedBy: null,
    completedAt: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return {
    id: ref.id,
    familyId,
    title,
    notes: input.notes?.trim() || '',
    priority,
    status: 'open',
    createdBy: userId,
    completedBy: null,
    completedAt: null,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };
}

/**
 * All tasks for a family (open + done), newest first.
 * Requires a composite index if Firestore asks: familyId Asc + createdAt Desc.
 */
export async function getTasksForFamily(familyId: string): Promise<Task[]> {
  const q = query(
    tasksRef(),
    where('familyId', '==', familyId),
    orderBy('createdAt', 'desc')
  );

  const snap = await getDocs(q);

  return snap.docs.map((d) => ({
    id: d.id,
    ...(d.data() as Omit<Task, 'id'>),
  }));
}

/**
 * Toggle complete / incomplete.
 */
export async function setTaskCompleted(
  taskId: string,
  userId: string,
  completed: boolean
): Promise<void> {
  const ref = doc(db, 'tasks', taskId);

  await updateDoc(ref, {
    status: completed ? 'done' : 'open',
    completedBy: completed ? userId : null,
    completedAt: completed ? serverTimestamp() : null,
    updatedAt: serverTimestamp(),
  });
}