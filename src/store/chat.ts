import { create } from 'zustand';
import { ref, set as firebaseSet, onValue } from 'firebase/database';
import { db } from '@/lib/firebase';
import { sendNotificationToFamily } from '@/lib/notification';

interface ChatMessage {
  id: string;
  content: string;
  userId: string;
  userName: string;
  timestamp: string;
  type: 'text' | 'image';
}

interface ChatStore {
  messages: ChatMessage[];
  sendMessage: (content: string, userId: string, userName: string, type: 'text' | 'image') => Promise<void>;
}

export const useChatStore = create<ChatStore>()((set, get) => ({
  messages: [],

  sendMessage: async (content, userId, userName, type = 'text') => {
    const messagesRef = ref(db, 'chat/messages');
    const newMessageRef = ref(db, `chat/messages/${Date.now()}`);
    
    const newMessage: ChatMessage = {
      id: newMessageRef.key!,
      content,
      userId,
      userName,
      timestamp: new Date().toISOString(),
      type
    };

    await firebaseSet(newMessageRef, newMessage);
    
    // 알림 전송
    await sendNotificationToFamily({
      title: '새 메시지가 도착했습니다',
      body: `${userName}: ${content}`,
      type: 'chat'
    });
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
