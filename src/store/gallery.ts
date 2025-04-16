import { create } from 'zustand';
import { ref, set, push, remove, onValue } from 'firebase/database';
import { db } from '@/lib/firebase';

interface GalleryImage {
  id: string;
  url: string;
  title: string;
  description: string;
  uploadedBy: string;
  uploadedAt: string;
}

interface GalleryStore {
  images: GalleryImage[];
  addImage: (image: Omit<GalleryImage, 'id' | 'uploadedAt'>) => Promise<void>;
  removeImage: (imageId: string) => Promise<void>;
}

export const useGalleryStore = create<GalleryStore>()((set) => ({
  images: [],

  addImage: async (imageData) => {
    const imagesRef = ref(db, 'gallery/images');
    const newImageRef = push(imagesRef);
    const newImage = {
      ...imageData,
      id: newImageRef.key!,
      uploadedAt: new Date().toISOString()
    };
    
    await set(newImageRef, newImage);
  },

  removeImage: async (imageId) => {
    await remove(ref(db, `gallery/images/${imageId}`));
  }
}));

// Firebase 실시간 동기화
if (typeof window !== 'undefined') {
  const imagesRef = ref(db, 'gallery/images');
  onValue(imagesRef, (snapshot) => {
    const data = snapshot.val() || {};
    useGalleryStore.setState({
      images: Object.values(data)
    });
  });
}
