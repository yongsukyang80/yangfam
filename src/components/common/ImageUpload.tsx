'use client';

import { useState } from 'react';

interface ImageUploadProps {
  onUploadComplete: (url: string) => void;
  compact?: boolean;
}

export default function ImageUpload({ onUploadComplete, compact = false }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);

  const uploadToImgBB = async (file: File) => {
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch(
        `https://api.imgbb.com/1/upload?key=ec16e894458d3d9d649feda3e7edbf12`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error('이미지 업로드에 실패했습니다.');
      }

      const data = await response.json();
      return data.data.url;
    } catch (error) {
      console.error('Error uploading to imgBB:', error);
      throw new Error('이미지 업로드에 실패했습니다.');
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드 가능합니다.');
      return;
    }

    try {
      setIsUploading(true);
      const url = await uploadToImgBB(file);
      onUploadComplete(url);
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('이미지 업로드 중 오류가 발생했습니다.');
    } finally {
      setIsUploading(false);
    }
  };

  if (compact) {
    return (
      <div className="relative">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          id="image-upload"
          disabled={isUploading}
        />
        <label
          htmlFor="image-upload"
          className={`flex items-center justify-center p-2 rounded-full hover:bg-gray-100 cursor-pointer ${
            isUploading ? 'opacity-50' : ''
          }`}
        >
          {isUploading ? (
            <svg className="animate-spin h-5 w-5 text-gray-500" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          ) : (
            <svg className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          )}
        </label>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isUploading}
        />
        <div className="space-y-2">
          <div className="text-gray-600">
            {isUploading ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                업로드 중...
              </div>
            ) : (
              <>
                <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <p className="mt-1">클릭하여 이미지 선택</p>
                <p className="text-xs text-gray-500">5MB 이하의 이미지 파일</p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
