import { create } from 'zustand';
import { ref, set as firebaseSet, onValue } from 'firebase/database';
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
  sendMessage: (text: string, userId: string, userName: string) => Promise<void>;
}

export const useChatStore = create<ChatStore>()((set, get) => ({
  messages: [],

  sendMessage: async (text, userId, userName) => {
    const messagesRef = ref(db, 'chat/messages');
    const newMessageRef = ref(db, `chat/messages/${Date.now()}`);
    
    const newMessage: ChatMessage = {
      id: newMessageRef.key!,
      text,
      userId,
      userName,
      timestamp: new Date().toISOString()
    };

    await firebaseSet(newMessageRef, newMessage);
  }
}));

// Firebase 실시간 동기화
if (typeof window !== 'undefined') {
  const messagesRef = ref(db, 'chat/messages');
  onValue(messagesRef, (snapshot) => {
    const data = snapshot.val() || {};
    useChatStore.setState({
      messages: Object.values(data)
    });
  });
}
