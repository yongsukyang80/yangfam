import { create } from 'zustand';
import { ref, set as firebaseSet, remove, onValue } from 'firebase/database';
import { db } from '@/lib/firebase';
import { sendNotificationToFamily } from '@/lib/notification';

interface GalleryImage {
  id: string;
  url: string;
  uploadedBy: string;
  uploadedByName: string;
  uploadedAt: string;
  description: string;
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
    const newImageRef = ref(db, `gallery/images/${Date.now()}`);
    
    const newImage: GalleryImage = {
      ...imageData,
      id: newImageRef.key!,
      uploadedAt: new Date().toISOString()
    };

    await firebaseSet(newImageRef, newImage);
    
    // 알림 전송
    await sendNotificationToFamily({
      title: '새로운 사진이 추가되었습니다',
      body: `${imageData.uploadedByName}님이 새 사진을 업로드했습니다`,
      type: 'gallery'
    });
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
