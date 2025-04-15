'use client';

import { useState, useRef } from 'react';
import { useGalleryStore } from '@/store/gallery';
import { useAuthStore } from '@/store/auth';

export default function Gallery() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [uploadStatus, setUploadStatus] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { items, addItem, removeItem, toggleLike } = useGalleryStore();
  const user = useAuthStore(state => state.user);

  console.log('Current gallery items:', items);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0];
      if (!file || !user) {
        setUploadStatus('파일이나 사용자 정보가 없습니다.');
        return;
      }

      setUploadStatus('파일 처리 중...');
      const isVideo = file.type.startsWith('video/');
      
      // 직접 data URL로 변환
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      addItem({
        type: isVideo ? 'video' : 'image',
        url: dataUrl,  // data URL 사용
        title,
        description,
        uploadedBy: user.id,
      });

      setTitle('');
      setDescription('');
      setUploadStatus('업로드 완료!');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Upload error:', error);
      setUploadStatus('업로드 중 오류 발생');
    }
  };

  return (
    <div className="container mx-auto p-4">
      {uploadStatus && (
        <div className="mb-4 p-2 bg-blue-100 text-blue-700 rounded">
          {uploadStatus}
        </div>
      )}

      <div className="mb-8 p-4 bg-white rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">추억 올리기</h2>
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            console.log('Form submitted');
            if (fileInputRef.current?.files?.length) {
              handleFileUpload({ target: fileInputRef.current } as any);
            }
          }}
          className="space-y-4"
        >
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="제목"
            className="w-full px-4 py-2 border rounded"
            required
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="설명"
            className="w-full px-4 py-2 border rounded h-24"
          />
          <div className="flex flex-col space-y-2">
            <label className="text-sm text-gray-600">
              사진 또는 동영상을 선택하세요
            </label>
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => {
                console.log('File input changed');
                handleFileUpload(e);
              }}
              accept="image/*,video/*"
              className="w-full border p-2 rounded"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
          >
            업로드
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => {
          console.log('Rendering item:', item);
          return (
            <div key={item.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="h-64 relative bg-gray-100">
                {item.type === 'image' ? (
                  <img
                    src={item.url}
                    alt={item.title}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                ) : (
                  <video
                    src={item.url}
                    controls
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                )}
              </div>
              <div className="p-4">
                <h3 className="font-bold text-lg">{item.title}</h3>
                {item.description && (
                  <p className="text-gray-600 mt-2 text-sm">{item.description}</p>
                )}
                <div className="flex items-center justify-between mt-4">
                  <button
                    onClick={() => user && toggleLike(item.id, user.id)}
                    className={`flex items-center space-x-2 ${
                      user && item.likes.includes(user.id)
                        ? 'text-red-500'
                        : 'text-gray-500'
                    }`}
                  >
                    <span>❤️</span>
                    <span className="text-sm">{item.likes.length}</span>
                  </button>
                  {user && item.uploadedBy === user.id && (
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      삭제
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {items.length === 0 && (
        <div className="text-center text-gray-500 mt-8">
          아직 추억이 없습니다. 첫 번째 추억을 공유해보세요!
        </div>
      )}
    </div>
  );
}
