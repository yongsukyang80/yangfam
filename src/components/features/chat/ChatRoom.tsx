'use client';

import { useState, useRef, useEffect } from 'react';
import { useChatStore } from '@/store/chat';
import { useAuthStore } from '@/store/auth';
import ImageUpload from '@/components/common/ImageUpload';

export default function ChatRoom() {
  const currentUser = useAuthStore(state => state.currentUser);
  const { messages, sendMessage } = useChatStore();
  const [message, setMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || (!message.trim() && !isUploading)) return;

    await sendMessage(message.trim(), currentUser.id, currentUser.name);
    setMessage('');
  };

  const handleImageUpload = async (url: string) => {
    if (!currentUser) return;
    setIsUploading(true);
    try {
      await sendMessage(`[이미지](${url})`, currentUser.id, currentUser.name);
    } finally {
      setIsUploading(false);
    }
  };

  if (!currentUser) return null;

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${
              msg.userId === currentUser.id ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[70%] rounded-lg p-3 ${
                msg.userId === currentUser.id
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200'
              }`}
            >
              {msg.userId !== currentUser.id && (
                <div className="text-sm font-medium mb-1">{msg.userName}</div>
              )}
              {msg.text.startsWith('[이미지]') ? (
                <img
                  src={msg.text.match(/\((.*?)\)/)?.[1]}
                  alt="채팅 이미지"
                  className="rounded-lg max-h-60 w-auto"
                />
              ) : (
                <div>{msg.text}</div>
              )}
              <div className="text-xs mt-1 opacity-70">
                {new Date(msg.timestamp).toLocaleString()}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-white border-t">
        <form onSubmit={handleSubmit} className="space-y-2">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="flex-1 px-4 py-2 border rounded-full"
              placeholder="메시지를 입력하세요..."
              disabled={isUploading}
            />
            <button
              type="submit"
              disabled={(!message.trim() && !isUploading) || isUploading}
              className="px-4 py-2 bg-blue-500 text-white rounded-full disabled:bg-gray-300"
            >
              전송
            </button>
          </div>
          <ImageUpload
            onUploadComplete={handleImageUpload}
            path="chat"
          />
        </form>
      </div>
    </div>
  );
}
