import { create } from 'zustand';
import { ref, get as getDbValue, set, onValue } from 'firebase/database';
import { db } from '@/lib/firebase';

interface FamilyMember {
  id: string;
  name: string;
  isMaster: boolean;
}

interface Family {
  id: string;
  name: string;
  masterName: string;
  members: FamilyMember[];
}

interface AuthStore {
  currentUser: FamilyMember | null;
  family: Family | null;
  familyMembers: FamilyMember[];
  hasMaster: () => Promise<boolean>;
  setupMaster: (setup: { masterName: string; familyName: string; members: string[] }) => Promise<void>;
  login: (memberId: string) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>()((set, get) => ({
  currentUser: null,
  family: null,
  familyMembers: [],

  hasMaster: async () => {
    const snapshot = await getDbValue(ref(db, 'family'));
    return !!snapshot.val();
  },

  setupMaster: async ({ masterName, familyName, members }) => {
    const familyId = 'family_' + Date.now();
    const masterMember: FamilyMember = {
      id: 'member_' + Date.now(),
      name: masterName,
      isMaster: true
    };

    const familyMembers: FamilyMember[] = [
      masterMember,
      ...members.map(name => ({
        id: 'member_' + Date.now() + '_' + Math.random(),
        name,
        isMaster: false
      }))
    ];

    const family: Family = {
      id: familyId,
      name: familyName,
      masterName,
      members: familyMembers
    };

    await set(ref(db, 'family'), family);
    set({ family, familyMembers });
  },

  login: async (memberId: string) => {
    const family = get().family;
    if (!family) throw new Error('가족 정보가 없습니다.');

    const member = family.members.find(m => m.id === memberId);
    if (!member) throw new Error('가족 구성원을 찾을 수 없습니다.');

    set({ currentUser: member });
    localStorage.setItem('currentUser', JSON.stringify(member));
  },

  logout: () => {
    set({ currentUser: null });
    localStorage.removeItem('currentUser');
  }
}));

// 실시간 동기화 설정
if (typeof window !== 'undefined') {
  // 가족 정보 동기화
  const familyRef = ref(db, 'family');
  onValue(familyRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      useAuthStore.setState({
        family: data,
        familyMembers: data.members
      });
    }
  });

  // 자동 로그인
  const savedUser = localStorage.getItem('currentUser');
  if (savedUser) {
    try {
      const user = JSON.parse(savedUser);
      useAuthStore.setState({ currentUser: user });
    } catch (error) {
      localStorage.removeItem('currentUser');
    }
  }
}
