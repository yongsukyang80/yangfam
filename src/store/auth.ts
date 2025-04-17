import { create } from 'zustand';
import { ref, set as firebaseSet, get, onValue } from 'firebase/database';
import { db } from '@/lib/firebase';

export interface User {
  id: string;
  name: string;
  role: 'father' | 'mother' | 'child' | 'master';
  points?: number;
  isMaster?: boolean;
}

interface Family {
  id: string;
  name: string;
  createdAt: string;
}

interface AuthState {
  currentUser: User | null;
  family: Family | null;
  familyMembers: User[];
}

interface AuthActions {
  login: (name: string, role: 'father' | 'mother' | 'child') => Promise<void>;
  setCurrentUser: (user: User | null) => void;
  createFamily: (name: string) => Promise<void>;
  addFamilyMember: (user: User) => Promise<void>;
  logout: () => void;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()((set) => ({
  currentUser: null,
  family: null,
  familyMembers: [],

  setCurrentUser: (user) => set({ currentUser: user }),

  login: async (name, role) => {
    const user: User = {
      id: Date.now().toString(),
      name,
      role,
      points: 0
    };

    set({ currentUser: user });

    const familyRef = ref(db, 'family');
    const snapshot = await get(familyRef);
    
    if (!snapshot.exists()) {
      const newFamily: Family = {
        id: Date.now().toString(),
        name: `${name}의 가족`,
        createdAt: new Date().toISOString()
      };
      await firebaseSet(familyRef, newFamily);
      set({ family: newFamily });
    }

    await firebaseSet(ref(db, `users/${user.id}`), user);
  },

  createFamily: async (name) => {
    const newFamily: Family = {
      id: Date.now().toString(),
      name,
      createdAt: new Date().toISOString()
    };

    await firebaseSet(ref(db, 'family'), newFamily);
    set({ family: newFamily });
  },

  addFamilyMember: async (user) => {
    await firebaseSet(ref(db, `users/${user.id}`), {
      ...user,
      points: 0
    });
  },

  logout: () => set({ currentUser: null, family: null, familyMembers: [] })
}));

if (typeof window !== 'undefined') {
  const familyRef = ref(db, 'family');
  onValue(familyRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      useAuthStore.setState({ family: data as Family });
    } else {
      useAuthStore.setState({ family: null });
    }
  });

  const usersRef = ref(db, 'users');
  onValue(usersRef, (snapshot) => {
    const data = snapshot.val();
    const members = data ? (Object.values(data) as User[]) : [];
    useAuthStore.setState({ familyMembers: members });
  });
}
