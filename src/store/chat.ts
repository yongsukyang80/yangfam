import { create } from 'zustand';
import { ref, set, push, onValue } from 'firebase/database';
import { db } from '@/lib/firebase';

interface ChatMessage {
  id: string;
  text: string;
  userId: string;
  userName: string;
  timestamp: string;
}

interface ChatStore {
  messages: ChatMessage[];
  sendMessage: (text: string, userId: string, userName: string) => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  messages: [],

  sendMessage: async (text, userId, userName) => {
    const messagesRef = ref(db, 'chat/messages');
    const newMessageRef = push(messagesRef);
    const newMessage = {
      id: newMessageRef.key!,
      text,
      userId,
      userName,
      timestamp: new Date().toISOString()
    };
    
    await set(newMessageRef, newMessage);
  }
}));

// Firebase 실시간 동기화
if (typeof window !== 'undefined') {
  const messagesRef = ref(db, 'chat/messages');
  onValue(messagesRef, (snapshot) => {
    const data = snapshot.val();
    const messages = data ? Object.values(data) : [];
    useChatStore.setState({ messages: messages.sort((a: ChatMessage, b: ChatMessage) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    ) });
  });
}
