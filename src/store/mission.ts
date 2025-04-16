import { create } from 'zustand';
import { ref, set, push, remove, onValue } from 'firebase/database';
import { db } from '@/lib/firebase';

export interface Mission {
  id: string;
  title: string;
  description: string;
  points: number;
  createdBy: string;
  createdAt: string;
  deadline: string;
  status: 'pending' | 'completed' | 'verified';
  assignedTo?: string;
  completedBy?: string;
  completedAt?: string;
  proofImage?: string;
  verifiedBy?: string;
  verifiedAt?: string;
}

interface MissionStore {
  missions: Mission[];
  createMission: (mission: Omit<Mission, 'id' | 'status' | 'createdAt'>) => Promise<void>;
  assignMission: (missionId: string, userId: string) => Promise<void>;
  submitMissionProof: (missionId: string, userId: string, proofImage: string) => Promise<void>;
  verifyMission: (missionId: string, verifierId: string) => Promise<void>;
  deleteMission: (missionId: string) => Promise<void>;
}

export const useMissionStore = create<MissionStore>()((set, get) => ({
  missions: [],

  createMission: async (missionData) => {
    const missionRef = push(ref(db, 'missions'));
    const newMission: Mission = {
      ...missionData,
      id: missionRef.key!,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    
    await set(missionRef, newMission);
  },

  assignMission: async (missionId, userId) => {
    const missionRef = ref(db, `missions/${missionId}`);
    await set(missionRef, {
      ...get().missions.find(m => m.id === missionId),
      assignedTo: userId
    });
  },

  submitMissionProof: async (missionId, userId, proofImage) => {
    const missionRef = ref(db, `missions/${missionId}`);
    await set(missionRef, {
      ...get().missions.find(m => m.id === missionId),
      status: 'completed',
      completedBy: userId,
      completedAt: new Date().toISOString(),
      proofImage
    });
  },

  verifyMission: async (missionId, verifierId) => {
    const missionRef = ref(db, `missions/${missionId}`);
    await set(missionRef, {
      ...get().missions.find(m => m.id === missionId),
      status: 'verified',
      verifiedBy: verifierId,
      verifiedAt: new Date().toISOString()
    });
  },

  deleteMission: async (missionId) => {
    await remove(ref(db, `missions/${missionId}`));
  }
}));

// Firebase 실시간 동기화
if (typeof window !== 'undefined') {
  const missionsRef = ref(db, 'missions');
  onValue(missionsRef, (snapshot) => {
    const data = snapshot.val() || {};
    useMissionStore.setState({
      missions: Object.values(data)
    });
  });
}
