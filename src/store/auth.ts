import { create } from 'zustand';
import { ref, set as firebaseSet, get, onValue } from 'firebase/database';
import { db } from '@/lib/firebase';

export interface User {
  id: string;
  name: string;
  role: 'father' | 'mother' | 'child';
  points?: number;
}

interface Family {
  id: string;
  name: string;
  createdAt: string;
}

interface AuthStore {
  currentUser: User | null;
  family: Family | null;
  familyMembers: User[];
  setCurrentUser: (user: User | null) => void;
  createFamily: (name: string) => Promise<void>;
  addFamilyMember: (user: User) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>()((set, get) => ({
  currentUser: null,
  family: null,
  familyMembers: [],

  setCurrentUser: (user) => {
    set({ currentUser: user });
  },

  createFamily: async (name) => {
    const family: Family = {
      id: Date.now().toString(),
      name,
      createdAt: new Date().toISOString()
    };

    const user = get().currentUser;
    if (!user) return;

    const familyMembers: User[] = [{
      id: user.id,
      name: user.name,
      role: user.role,
      points: 0
    }];

    // Firebase에 데이터 저장
    await firebaseSet(ref(db, 'family'), family);
    await firebaseSet(ref(db, 'familyMembers'), familyMembers);

    // Zustand 상태 업데이트
    set({ family, familyMembers });
  },

  addFamilyMember: async (user) => {
    const currentMembers = get().familyMembers;
    const updatedMembers = [...currentMembers, { ...user, points: 0 }];

    // Firebase에 데이터 저장
    await firebaseSet(ref(db, 'familyMembers'), updatedMembers);

    // Zustand 상태 업데이트
    set({ familyMembers: updatedMembers });
  },

  logout: () => {
    set({ currentUser: null, family: null, familyMembers: [] });
  }
}));

// Firebase 실시간 동기화
if (typeof window !== 'undefined') {
  // 가족 정보 동기화
  onValue(ref(db, 'family'), (snapshot) => {
    const data = snapshot.val();
    if (data) {
      useAuthStore.setState({ family: data });
    }
  });

  // 가족 구성원 동기화
  onValue(ref(db, 'familyMembers'), (snapshot) => {
    const data = snapshot.val() || [];
    useAuthStore.setState({ familyMembers: data });
  });
}
