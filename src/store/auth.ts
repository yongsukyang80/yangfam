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
    console.log('Checking existing user:', name);
    const snapshot = await getDbValue(ref(db, 'users'));
    const users = snapshot.val();
    console.log('Existing users:', users);
    if (users) {
      const existingUser = Object.values(users as User[]).find(
        (user: User) => user.name === name
      );
      console.log('Found existing user:', existingUser);
      return existingUser || null;
    }
    return null;
  },

  login: async (name: string, role: string) => {
    console.log('Attempting login:', { name, role });
    const existingUser = await get().checkExistingUser(name);
    
    if (existingUser) {
      console.log('Logging in existing user:', existingUser);
      set({ user: existingUser });
      localStorage.setItem('userId', existingUser.id);
    } else {
      console.log('Creating new user');
      const userId = `user_${Date.now()}`;
      const newUser = { id: userId, name, role };
      await set(ref(db, `users/${userId}`), newUser);
      set({ user: newUser });
      localStorage.setItem('userId', userId);
      console.log('New user created:', newUser);
    }
  },

  logout: async () => {
    localStorage.removeItem('userId');
    set({ user: null });
  }
}));

// 페이지 로드 시 자동 로그인 처리
if (typeof window !== 'undefined') {
  console.log('Setting up Firebase real-time sync');
  // 사용자 목록 실시간 동기화
  const usersRef = ref(db, 'users');
  onValue(usersRef, (snapshot) => {
    console.log('Received users update:', snapshot.val());
    const data = snapshot.val();
    const users = data ? Object.values(data) : [];
    useAuthStore.setState({ familyUsers: users });

    // 저장된 userId가 있으면 자동 로그인
    const savedUserId = localStorage.getItem('userId');
    console.log('Saved userId:', savedUserId);
    if (savedUserId) {
      const savedUser = users.find((user: User) => user.id === savedUserId);
      console.log('Found saved user:', savedUser);
      if (savedUser) {
        useAuthStore.setState({ user: savedUser });
      }
    }
  });
}
