'use client';

import { useState, useEffect, useRef } from 'react';
import { useChatStore } from '@/store/chat';
import { useAuthStore } from '@/store/auth';

export default function ChatRoom() {
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentUser = useAuthStore((state) => state.currentUser);
  const { messages, sendMessage } = useChatStore();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !currentUser) return;

    sendMessage(message.trim(), currentUser.id, currentUser.name);
    setMessage('');
  };

  if (!currentUser) return null;

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${
              msg.userId === currentUser.id ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[70%] break-words rounded-lg px-4 py-2 ${
                msg.userId === currentUser.id
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100'
              }`}
            >
              <div className="text-sm font-medium mb-1">
                {msg.userId === currentUser.id ? '나' : msg.userName}
              </div>
              <div>{msg.text}</div>
              <div className="text-xs mt-1 opacity-70">
                {new Date(msg.timestamp).toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex space-x-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="메시지를 입력하세요..."
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            전송
          </button>
        </div>
      </form>
    </div>
  );
}
