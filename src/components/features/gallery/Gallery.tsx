'use client';

import { useState } from 'react';
import { useGalleryStore } from '@/store/gallery';
import ImageUpload from '@/components/common/ImageUpload';
import { useAuthStore } from '@/store/auth';

export default function Gallery() {
  const { currentUser } = useAuthStore();
  const { images, addImage, removeImage } = useGalleryStore();
  const [isUploading, setIsUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

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
    <div className="p-4 max-w-7xl mx-auto">
      <div className="mb-6">
        <ImageUpload onUploadComplete={handleImageUpload} />
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((image) => (
          <div key={image.id} className="relative aspect-square group">
            <div className="absolute inset-0 rounded-lg overflow-hidden">
              <img
                src={image.url}
                alt={`Gallery image by ${image.uploadedByName}`}
                className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                loading="lazy"
                onClick={() => setSelectedImage(image.url)}
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-opacity duration-200 flex items-center justify-center">
                {currentUser?.id === image.uploadedBy && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(image.id);
                    }}
                    className="hidden group-hover:flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    삭제
                  </button>
                )}
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
                <p className="text-white text-sm font-medium">{image.uploadedByName}</p>
                <p className="text-white text-xs opacity-75">
                  {new Date(image.uploadedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 이미지 상세보기 모달 */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-6xl w-full max-h-[90vh] flex items-center justify-center">
            <button
              className="absolute top-4 right-4 text-white p-2 hover:bg-white/10 rounded-full"
              onClick={() => setSelectedImage(null)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <img
              src={selectedImage}
              alt="Selected gallery image"
              className="max-w-full max-h-[85vh] object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
}
