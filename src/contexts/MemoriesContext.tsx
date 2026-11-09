/**
 * MemoriesContext — albums (folders) + photos inside them.
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { useAuth } from './AuthContext';
import { useFamily } from './FamilyContext';
import * as albumsService from '../services/albums';
import * as memoriesService from '../services/memories';
import type {
  Album,
  Memory,
  CreateAlbumInput,
  CreateMemoryInput,
  MemoryVisibility,
} from '../types';

type MemoriesContextValue = {
  albums: Album[];
  albumsLoading: boolean;
  refreshAlbums: () => Promise<void>;
  createAlbum: (input: CreateAlbumInput) => Promise<Album>;

  albumMemories: Memory[];
  albumMemoriesLoading: boolean;
  loadAlbumMemories: (albumId: string) => Promise<void>;
  clearAlbumMemories: () => void;

  addMemory: (input: CreateMemoryInput) => Promise<void>;
  removeMemory: (memory: Memory) => Promise<void>;
  deleteAlbum: (albumId: string) => Promise<void>;
  setVisibility: (
    memoryId: string,
    visibility: MemoryVisibility,
    allowedUserIds?: string[]
  ) => Promise<string | null>;

  error: string | null;
  clearError: () => void;
};

const MemoriesContext = createContext<MemoriesContextValue | undefined>(
  undefined
);

export function MemoriesProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { currentFamily } = useFamily();

  const [albums, setAlbums] = useState<Album[]>([]);
  const [albumsLoading, setAlbumsLoading] = useState(false);

  const [albumMemories, setAlbumMemories] = useState<Memory[]>([]);
  const [albumMemoriesLoading, setAlbumMemoriesLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const clearError = useCallback(() => setError(null), []);

  // ----- Albums -----
  const refreshAlbums = useCallback(async () => {
    if (!currentFamily?.id) {
      setAlbums([]);
      return;
    }
    setAlbumsLoading(true);
    try {
      const list = await albumsService.getAlbumsForFamily(currentFamily.id);
      setAlbums(list);
    } catch (e: any) {
      console.warn('refreshAlbums failed', e);
      setError(e?.message ?? 'Could not load albums');
    } finally {
      setAlbumsLoading(false);
    }
  }, [currentFamily?.id]);

  useEffect(() => {
    refreshAlbums();
  }, [refreshAlbums]);

  const createAlbum = useCallback(
    async (input: CreateAlbumInput) => {
      if (!user?.uid || !currentFamily?.id) {
        throw new Error('You must be signed in and have a family');
      }
      const album = await albumsService.createAlbum(
        user.uid,
        currentFamily.id,
        input
      );
      setAlbums((prev) => [album, ...prev]);
      return album;
    },
    [user?.uid, currentFamily?.id]
  );

  // ----- Photos in one album -----
  const loadAlbumMemories = useCallback(
    async (albumId: string) => {
      if (!user?.uid) {
        setAlbumMemories([]);
        return;
      }
      setAlbumMemoriesLoading(true);
      try {
        const list = await memoriesService.getMemoriesForAlbum(albumId);
        // Only show what this user is allowed to see
        const filtered = list.filter((m) =>
          memoriesService.canUserViewMemory(m, user.uid, true)
        );
        setAlbumMemories(filtered);
      } catch (e: any) {
        console.warn('loadAlbumMemories failed', e);
        setError(e?.message ?? 'Could not load photos');
        setAlbumMemories([]);
      } finally {
        setAlbumMemoriesLoading(false);
      }
    },
    [user?.uid]
  );

  const clearAlbumMemories = useCallback(() => {
    setAlbumMemories([]);
  }, []);

  const addMemory = useCallback(
    async (input: CreateMemoryInput) => {
      if (!user?.uid || !currentFamily?.id) {
        throw new Error('You must be signed in and have a family');
      }
      if (!input.albumId) throw new Error('albumId is required');

      const memory = await memoriesService.createMemory(
        user.uid,
        currentFamily.id,
        input
      );
      setAlbumMemories((prev) => [memory, ...prev]);
    },
    [user?.uid, currentFamily?.id]
  );

  /** DELETE — used by album detail trash button */
  const removeMemory = useCallback(async (memory: Memory) => {
    await memoriesService.deleteMemory(memory);
    setAlbumMemories((prev) => prev.filter((m) => m.id !== memory.id));
  }, []);

  /** VISIBILITY — family | members | link */
  const setVisibility = useCallback(
    async (
      memoryId: string,
      visibility: MemoryVisibility,
      allowedUserIds: string[] = []
    ) => {
      const token = await memoriesService.setMemoryVisibility(
        memoryId,
        visibility,
        allowedUserIds
      );
      setAlbumMemories((prev) =>
        prev.map((m) =>
          m.id === memoryId
            ? {
                ...m,
                visibility,
                shareToken: token,
                allowedUserIds:
                  visibility === 'members' ? allowedUserIds : [],
              }
            : m
        )
      );
      return token;
    },
    []
  );

  const deleteAlbum = useCallback(async (albumId: string) => {
  await albumsService.deleteAlbumAndMemories(albumId);
  setAlbums((prev) => prev.filter((a) => a.id !== albumId));
  setAlbumMemories([]);
}, []);

  return (
    <MemoriesContext.Provider
      value={{
        albums,
        albumsLoading,
        refreshAlbums,
        createAlbum,
        deleteAlbum,
        albumMemories,
        albumMemoriesLoading,
        loadAlbumMemories,
        clearAlbumMemories,
        addMemory,
        removeMemory,
        setVisibility,
        error,
        clearError,
      }}
    >
      {children}
    </MemoriesContext.Provider>
  );
}

export function useMemories() {
  const ctx = useContext(MemoriesContext);
  if (!ctx) {
    throw new Error('useMemories must be used within MemoriesProvider');
  }
  return ctx;
}