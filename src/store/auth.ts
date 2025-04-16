import { create } from 'zustand';
import { ref, get as getDbValue, set, onValue } from 'firebase/database';
import { db } from '@/lib/firebase';

interface User {
  id: string;
  name: string;
  role: string;
}

interface AuthStore {
  user: User | null;
  familyUsers: User[];
  login: (name: string, role: string) => Promise<void>;
  logout: () => Promise<void>;
  checkExistingUser: (name: string) => Promise<User | null>;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  familyUsers: [],

  checkExistingUser: async (name: string) => {
    const snapshot = await getDbValue(ref(db, 'users'));
    const users = snapshot.val();
    if (users) {
      const existingUser = Object.values(users as User[]).find(
        (user: User) => user.name === name
      );
      return existingUser || null;
    }
    return null;
  },

  login: async (name: string, role: string) => {
    // 먼저 같은 이름의 기존 사용자가 있는지 확인
    const existingUser = await get().checkExistingUser(name);
    
    if (existingUser) {
      // 기존 사용자가 있으면 해당 사용자로 로그인
      set({ user: existingUser });
      localStorage.setItem('userId', existingUser.id);
    } else {
      // 새로운 사용자 생성
      const userId = `user_${Date.now()}`;
      const newUser = { id: userId, name, role };
      await set(ref(db, `users/${userId}`), newUser);
      set({ user: newUser });
      localStorage.setItem('userId', userId);
    }
  },

  logout: async () => {
    localStorage.removeItem('userId');
    set({ user: null });
  }
}));

// 페이지 로드 시 자동 로그인 처리
if (typeof window !== 'undefined') {
  // 사용자 목록 실시간 동기화
  const usersRef = ref(db, 'users');
  onValue(usersRef, (snapshot) => {
    const data = snapshot.val();
    const users = data ? Object.values(data) : [];
    useAuthStore.setState({ familyUsers: users });

    // 저장된 userId가 있으면 자동 로그인
    const savedUserId = localStorage.getItem('userId');
    if (savedUserId) {
      const savedUser = users.find((user: User) => user.id === savedUserId);
      if (savedUser) {
        useAuthStore.setState({ user: savedUser });
      }
    }
  });
}
