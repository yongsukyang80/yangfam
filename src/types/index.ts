export interface User {
  id: string;
  name: string;
  role: '부모' | '자녀' | '조부모';
  createdAt: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  date: string;  // 'YYYY-MM-DD'
  type: '생일' | '약속' | '기념일';
  createdBy: string;  // User ID
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  content: string;
  userId: string;
  userName: string;
  timestamp: string;
  type: 'text' | 'image';
  imageUrl?: string;
}

export interface GalleryItem {
  id: string;
  type: 'image' | 'video';
  url: string;
  thumbnail?: string;
  title: string;
  description?: string;
  uploadedBy: string;
  uploadedAt: string;
  likes: string[]; // 좋아요를 누른 사용자 ID 배열
}
