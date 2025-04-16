'use client';

import { useState } from 'react';
import { useGalleryStore } from '@/store/gallery';
import ImageUpload from '@/components/common/ImageUpload';
import { useAuthStore } from '@/store/auth';

export default function Gallery() {
  const { currentUser } = useAuthStore();
  const { images, addImage, removeImage } = useGalleryStore();
  const [isUploading, setIsUploading] = useState(false);

  const handleImageUpload = async (imageUrl: string) => {
    if (!currentUser) return;
    
    try {
      await addImage({
        url: imageUrl,
        uploadedBy: currentUser.id,
        uploadedByName: currentUser.name,
        description: ''
      });
    } catch (error) {
      console.error('Error adding image:', error);
      alert('이미지 추가 중 오류가 발생했습니다.');
    }
  };

  const handleDelete = async (imageId: string) => {
    try {
      await removeImage(imageId);
    } catch (error) {
      console.error('Error removing image:', error);
      alert('이미지 삭제 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="p-4">
      <div className="mb-6">
        <ImageUpload onUploadComplete={handleImageUpload} />
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((image) => (
          <div key={image.id} className="relative group">
            <img
              src={image.url}
              alt={`Gallery image`}
              className="w-full h-64 object-cover rounded-lg"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity flex items-center justify-center">
              {currentUser?.id === image.uploadedBy && (
                <button
                  onClick={() => handleDelete(image.id)}
                  className="hidden group-hover:block bg-red-500 text-white px-4 py-2 rounded-lg"
                >
                  삭제
                </button>
              )}
            </div>
            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2 text-sm">
              <p>{image.uploadedByName}</p>
              <p className="text-xs">{new Date(image.uploadedAt).toLocaleDateString()}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
