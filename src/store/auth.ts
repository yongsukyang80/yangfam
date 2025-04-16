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
}

export const useAuthStore = create<AuthStore>()((set, get) => ({
  user: null,
  familyUsers: [],

  login: async (name: string, role: string) => {
    try {
      // 먼저 같은 이름의 사용자가 있는지 확인
      const snapshot = await getDbValue(ref(db, 'users'));
      const users = snapshot.val() || {};
      
      // 이름으로 사용자 ID 생성 (일관성 유지)
      const userId = `user_${name.toLowerCase().replace(/\s+/g, '_')}`;
      
      let user: User;

      if (users[userId]) {
        // 기존 사용자가 있으면 해당 정보 사용
        user = users[userId];
        console.log('Existing user found:', user);
      } else {
        // 새 사용자 생성
        user = { id: userId, name, role };
        console.log('Creating new user:', user);
      }

      // Firebase에 사용자 정보 저장/업데이트
      await set(ref(db, `users/${userId}`), user);
      
      // 로컬 상태 업데이트
      set({ user });
      
      // 로컬 스토리지에 사용자 ID 저장
      localStorage.setItem('userId', userId);
      localStorage.setItem('userName', name);
      localStorage.setItem('userRole', role);

    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  logout: async () => {
    try {
      const userId = get().user?.id;
      if (userId) {
        // 로컬 상태 및 스토리지 클리어
        set({ user: null });
        localStorage.removeItem('userId');
        localStorage.removeItem('userName');
        localStorage.removeItem('userRole');
      }
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }
}));

// 자동 로그인 처리
if (typeof window !== 'undefined') {
  // 사용자 목록 실시간 동기화
  const usersRef = ref(db, 'users');
  onValue(usersRef, (snapshot) => {
    try {
      const data = snapshot.val() || {};
      const users = Object.values(data);
      useAuthStore.setState({ familyUsers: users as User[] });

      // 저장된 사용자 정보로 자동 로그인
      const savedUserId = localStorage.getItem('userId');
      const savedName = localStorage.getItem('userName');
      const savedRole = localStorage.getItem('userRole');

      if (savedUserId && savedName && savedRole && !useAuthStore.getState().user) {
        const savedUser = users.find((u: User) => u.id === savedUserId);
        if (savedUser) {
          useAuthStore.setState({ user: savedUser });
        } else {
          // 저장된 사용자가 없으면 새로 생성
          const user = { id: savedUserId, name: savedName, role: savedRole };
          set(ref(db, `users/${savedUserId}`), user);
          useAuthStore.setState({ user });
        }
      }
    } catch (error) {
      console.error('Error syncing users:', error);
    }
  });
}
