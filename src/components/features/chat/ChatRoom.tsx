'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '@/store/auth';
import { useChatStore } from '@/store/chat';

export default function ChatRoom() {
  const [message, setMessage] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentUser = useAuthStore((state) => state.currentUser);
  const { messages, addMessage } = useChatStore();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || (!message.trim() && !imageFile)) return;

    if (imageFile) {
      // 실제로는 이미지를 서버에 업로드하고 URL을 받아야 하지만,
      // 여기서는 로컬 URL을 생성합니다.
      const imageUrl = URL.createObjectURL(imageFile);
      addMessage({
        content: message,
        userId: currentUser.id,
        userName: currentUser.name,
        type: 'image',
        imageUrl,
      });
      setImageFile(null);
    }

    if (message.trim()) {
      addMessage({
        content: message.trim(),
        userId: currentUser.id,
        userName: currentUser.name,
        type: 'text',
      });
    }

    setMessage('');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.userId === currentUser?.id ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[70%] ${msg.userId === currentUser?.id ? 'bg-blue-500 text-white' : 'bg-gray-200'} rounded-lg p-3`}>
              {msg.userId !== currentUser?.id && (
                <div className="text-sm font-medium mb-1">{msg.userName}</div>
              )}
              {msg.type === 'image' && msg.imageUrl && (
                <div className="mb-2">
                  <img
                    src={msg.imageUrl}
                    alt="Uploaded image"
                    className="rounded-lg w-[200px] h-[200px] object-cover"
                  />
                </div>
              )}
              {msg.content && <div>{msg.content}</div>}
              <div className="text-xs mt-1 opacity-70">
                {new Date(msg.timestamp).toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200"
            title="이미지 업로드"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="20" 
              height="20" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
              <circle cx="12" cy="13" r="4"/>
            </svg>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            accept="image/*"
            className="hidden"
          />
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="메시지를 입력하세요..."
            className="flex-1 px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600"
          >
            전송
          </button>
        </div>
        {imageFile && (
          <div className="mt-2 p-2 bg-gray-100 rounded-lg flex items-center justify-between">
            <span className="text-sm">{imageFile.name}</span>
            <button
              type="button"
              onClick={() => setImageFile(null)}
              className="text-red-500 hover:text-red-700"
            >
              ✕
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
