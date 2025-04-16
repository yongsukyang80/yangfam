'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/auth';
import { useGalleryStore } from '@/store/gallery';

export default function LoginForm() {
  const [name, setName] = useState('');
  const [role, setRole] = useState<'father' | 'mother' | 'child'>('father');
  const [error, setError] = useState('');
  const [imageLoaded, setImageLoaded] = useState(false);
  const { login } = useAuthStore();
  const { images } = useGalleryStore();

  // 이미지 정렬 로직 수정
  const latestImage = images && images.length > 0 
    ? [...images].sort((a, b) => 
        new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
      )[0]
    : null;

  // 이미지 로드 상태 초기화
  useEffect(() => {
    setImageLoaded(false);
  }, [latestImage?.url]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(name, role);
    } catch (error) {
      setError('로그인 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {latestImage?.url && (
          <div className="w-full aspect-video relative rounded-lg overflow-hidden shadow-lg">
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
              </div>
            )}
            <img
              src={latestImage.url}
              alt="최근 가족 사진"
              className={`w-full h-full object-cover transition-opacity duration-300 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={() => setImageLoaded(true)}
            />
          </div>
        )}
        
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Family Together
          </h2>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                이름
              </label>
              <input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="이름을 입력하세요"
              />
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                역할
              </label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value as 'father' | 'mother' | 'child')}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="father">아빠</option>
                <option value="mother">엄마</option>
                <option value="child">자녀</option>
              </select>
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              시작하기
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
