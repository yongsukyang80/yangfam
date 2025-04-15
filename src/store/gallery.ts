import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { GalleryItem } from '@/types';

interface GalleryStore {
  items: GalleryItem[];
  addItem: (item: Omit<GalleryItem, 'id' | 'uploadedAt' | 'likes'>) => void;
  removeItem: (id: string) => void;
  toggleLike: (itemId: string, userId: string) => void;
}

export const useGalleryStore = create<GalleryStore>()(
  persist(
    (set) => ({
      items: [],
      addItem: (item) =>
        set((state) => ({
          items: [
            ...state.items,
            {
              ...item,
              id: crypto.randomUUID(),
              uploadedAt: new Date().toISOString(),
              likes: [],
            },
          ],
        })),
      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        })),
      toggleLike: (itemId, userId) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.id === itemId
              ? {
                  ...item,
                  likes: item.likes.includes(userId)
                    ? item.likes.filter((id) => id !== userId)
                    : [...item.likes, userId],
                }
              : item
          ),
        })),
    }),
    {
      name: 'gallery-storage',
    }
  )
);
