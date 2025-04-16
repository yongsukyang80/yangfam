'use client';

import { useState } from 'react';
import { useGalleryStore } from '@/store/gallery';
import { useAuthStore } from '@/store/auth';
import ImageUpload from '@/components/common/ImageUpload';

export default function Gallery() {
  const currentUser = useAuthStore(state => state.currentUser);
  const { images, addImage, removeImage } = useGalleryStore();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !imageUrl) return;

    await addImage({
      title,
      description,
      url: imageUrl,
      uploadedBy: currentUser.id
    });

    setTitle('');
    setDescription('');
    setImageUrl('');
  };

  return (
    <div className="p-4 space-y-6">
      <div className="bg-white p-4 md:p-6 rounded-lg shadow">
        <h2 className="text-xl md:text-2xl font-bold mb-4">새 사진 추가</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">제목</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 border rounded-lg"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">설명</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 border rounded-lg"
              rows={3}
            />
          </div>

          <ImageUpload
            onUploadComplete={(url) => setImageUrl(url)}
            path="gallery"
          />

          <button
            type="submit"
            disabled={!imageUrl}
            className="w-full px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300"
          >
            추가하기
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {images.map((image) => (
          <div key={image.id} className="bg-white rounded-lg shadow overflow-hidden">
            <img
              src={image.url}
              alt={image.title}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h3 className="font-bold">{image.title}</h3>
              <p className="text-gray-600 text-sm">{image.description}</p>
              <div className="mt-2 text-sm text-gray-500">
                {new Date(image.uploadedAt).toLocaleString()}
              </div>
              {currentUser?.id === image.uploadedBy && (
                <button
                  onClick={() => removeImage(image.id)}
                  className="mt-2 text-red-500 hover:text-red-600"
                >
                  삭제
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
