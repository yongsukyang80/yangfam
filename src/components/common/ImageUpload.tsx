'use client';

import { useState } from 'react';
import { uploadImage } from '@/lib/utils/uploadImage';
import { resizeImage } from '@/lib/utils/imageProcessing';

interface ImageUploadProps {
  onUploadComplete: (url: string) => void;
  path: string;
  compact?: boolean;
}

export default function ImageUpload({ onUploadComplete, path, compact = false }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드 가능합니다.');
      return;
    }

    try {
      setIsUploading(true);

      // 파일 크기에 따라 리사이징 적용
      let uploadFile: File | Blob = file;
      if (file.size > 1024 * 1024) { // 1MB 이상인 경우
        const resizedBlob = await resizeImage(file);
        uploadFile = resizedBlob;
      }

      // 미리보기 생성
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(uploadFile);

      const url = await uploadImage(uploadFile, path);
      onUploadComplete(url);
      setPreviewUrl(null);
    } catch (error) {
      console.error('Error processing image:', error);
      alert('이미지 처리 중 오류가 발생했습니다.');
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
          <div className="text-[#1a1a1a]">
            {isUploading ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span className="text-[#4a4a4a]">업로드 중...</span>
              </div>
            ) : (
              <>
                <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <p className="mt-1 text-[#1a1a1a]">클릭하여 이미지 선택</p>
                <p className="text-xs text-[#717171]">5MB 이하의 이미지 파일</p>
              </>
            )}
          </div>
          {previewUrl && (
            <div className="mt-4">
              <img
                src={previewUrl}
                alt="Preview"
                className="mx-auto max-h-48 rounded-lg"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
