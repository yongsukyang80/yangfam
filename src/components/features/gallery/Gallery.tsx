'use client';

import { useState } from 'react';
import { useGalleryStore } from '@/store/gallery';
import { useAuthStore } from '@/store/auth';

export default function Gallery() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');

  const currentUser = useAuthStore((state) => state.currentUser);
  const { images, addImage, removeImage } = useGalleryStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    await addImage({
      title,
      description,
      url,
      uploadedBy: currentUser.id
    });

    setTitle('');
    setDescription('');
    setUrl('');
  };

  const handleDelete = async (imageId: string) => {
    await removeImage(imageId);
  };

  if (!currentUser) return null;

  return (
    <div className="space-y-6 p-4">
      {/* 이미지 업로드 폼 */}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow space-y-4">
        <h2 className="text-xl font-bold mb-4">새 사진 추가</h2>
        
        <div>
          <label className="block text-sm font-medium mb-1">제목</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border rounded"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">설명</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border rounded"
            rows={3}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">이미지 URL</label>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full px-3 py-2 border rounded"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          추가하기
        </button>
      </form>

      {/* 이미지 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {images.map((image) => (
          <div key={image.id} className="bg-white rounded-lg shadow overflow-hidden">
            <img
              src={image.url}
              alt={image.title}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h3 className="font-bold text-lg mb-2">{image.title}</h3>
              <p className="text-gray-600 text-sm mb-4">{image.description}</p>
              <div className="flex justify-between items-center text-sm text-gray-500">
                <span>{new Date(image.uploadedAt).toLocaleDateString()}</span>
                {image.uploadedBy === currentUser.id && (
                  <button
                    onClick={() => handleDelete(image.id)}
                    className="text-red-500 hover:text-red-600"
                  >
                    삭제
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
