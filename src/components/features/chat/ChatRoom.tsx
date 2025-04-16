'use client';

import { useState, useRef, useEffect } from 'react';
import { useChatStore } from '@/store/chat';
import { useAuthStore } from '@/store/auth';
import ImageUpload from '@/components/common/ImageUpload';

export default function ChatRoom() {
  const { messages, sendMessage } = useChatStore();
  const { currentUser } = useAuthStore();
  const [message, setMessage] = useState('');
  const [showImageUpload, setShowImageUpload] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !message.trim()) return;

    try {
      await sendMessage(message.trim(), currentUser.id, currentUser.name, 'text');
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      alert('메시지 전송 중 오류가 발생했습니다.');
    }
  };

  const handleImageUpload = async (imageUrl: string) => {
    if (!currentUser) return;

    try {
      await sendMessage(imageUrl, currentUser.id, currentUser.name, 'image');
      setShowImageUpload(false);
    } catch (error) {
      console.error('Error sending image:', error);
      alert('이미지 전송 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${
              msg.userId === currentUser?.id ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[70%] break-words rounded-lg p-3 ${
                msg.userId === currentUser?.id
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200'
              }`}
            >
              <div className="text-xs mb-1">{msg.userName}</div>
              {msg.type === 'image' ? (
                <img
                  src={msg.content}
                  alt="Shared image"
                  className="max-w-full rounded"
                />
              ) : (
                <p>{msg.content}</p>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {showImageUpload && (
        <div className="p-4 border-t">
          <ImageUpload
            onUploadComplete={handleImageUpload}
            compact={true}
          />
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-4 border-t flex gap-2">
        <button
          type="button"
          onClick={() => setShowImageUpload(!showImageUpload)}
          className="p-2 text-gray-500 hover:text-gray-700"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </button>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="flex-1 border rounded-lg px-4 py-2"
          placeholder="메시지를 입력하세요..."
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded-lg"
          disabled={!message.trim()}
        >
          전송
        </button>
      </form>
    </div>
  );
}
