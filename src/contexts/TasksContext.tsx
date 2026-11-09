/**
 * TasksContext
 * -----------
 * Loads tasks for the current family and exposes create / toggle.
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useAuth } from './AuthContext';
import { useFamily } from './FamilyContext';
import * as tasksService from '../services/tasks';
import type { Task, CreateTaskInput } from '../types';

type TasksContextValue = {
  tasks: Task[];
  openTasks: Task[];
  doneTasks: Task[];
  loading: boolean;
  error: string | null;
  clearError: () => void;
  refreshTasks: () => Promise<void>;
  addTask: (input: CreateTaskInput) => Promise<void>;
  toggleTask: (taskId: string, completed: boolean) => Promise<void>;
};

const TasksContext = createContext<TasksContextValue | undefined>(undefined);

export function TasksProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { currentFamily } = useFamily();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  const refreshTasks = useCallback(async () => {
    if (!currentFamily?.id) {
      setTasks([]);
      return;
    }

    setLoading(true);
    try {
      const list = await tasksService.getTasksForFamily(currentFamily.id);
      setTasks(list);
    } catch (e: any) {
      console.warn('refreshTasks failed', e);
      setError(e?.message ?? 'Could not load tasks');
    } finally {
      setLoading(false);
    }
  }, [currentFamily?.id]);

  // Reload when family changes
  useEffect(() => {
    refreshTasks();
  }, [refreshTasks]);

  const addTask = useCallback(
    async (input: CreateTaskInput) => {
      if (!user?.uid) throw new Error('You must be signed in');
      if (!currentFamily?.id) throw new Error('No family selected');

      setError(null);
      const task = await tasksService.createTask(
        user.uid,
        currentFamily.id,
        input
      );
      // Newest first
      setTasks((prev) => [task, ...prev]);
    },
    [user?.uid, currentFamily?.id]
  );

  const toggleTask = useCallback(
    async (taskId: string, completed: boolean) => {
      if (!user?.uid) throw new Error('You must be signed in');

      // Optimistic UI
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId
            ? {
                ...t,
                status: completed ? 'done' : 'open',
                completedBy: completed ? user.uid : null,
              }
            : t
        )
      );

      try {
        await tasksService.setTaskCompleted(taskId, user.uid, completed);
      } catch (e: any) {
        // Revert on failure
        await refreshTasks();
        setError(e?.message ?? 'Could not update task');
        throw e;
      }
    },
    [user?.uid, refreshTasks]
  );

  const openTasks = useMemo(
    () => tasks.filter((t) => t.status === 'open'),
    [tasks]
  );
  const doneTasks = useMemo(
    () => tasks.filter((t) => t.status === 'done'),
    [tasks]
  );

  const value: TasksContextValue = {
    tasks,
    openTasks,
    doneTasks,
    loading,
    error,
    clearError,
    refreshTasks,
    addTask,
    toggleTask,
  };

  return (
    <TasksContext.Provider value={value}>{children}</TasksContext.Provider>
  );
}

export function useTasks() {
  const ctx = useContext(TasksContext);
  if (!ctx) {
    throw new Error('useTasks must be used within TasksProvider');
  }
  return ctx;
}