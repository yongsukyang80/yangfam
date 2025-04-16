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

interface UserPoints {
  [userId: string]: number;
}

interface MissionStore {
  missions: Mission[];
  userPoints: UserPoints;
  createMission: (mission: Omit<Mission, 'id' | 'status' | 'createdAt'>) => Promise<void>;
  assignMission: (missionId: string, userId: string) => Promise<void>;
  submitMissionProof: (missionId: string, userId: string, proofImage: string) => Promise<void>;
  verifyMission: (missionId: string, verifierId: string) => Promise<void>;
  deleteMission: (missionId: string) => Promise<void>;
  getUserPoints: (userId: string) => number;
}

export const useMissionStore = create<MissionStore>()((set, get) => ({
  missions: [],
  userPoints: {},

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
    const mission = get().missions.find(m => m.id === missionId);
    if (!mission || !mission.completedBy) return;

    const missionRef = ref(db, `missions/${missionId}`);
    const userPointsRef = ref(db, `userPoints/${mission.completedBy}`);
    
    // 미션 상태 업데이트
    await set(missionRef, {
      ...mission,
      status: 'verified',
      verifiedBy: verifierId,
      verifiedAt: new Date().toISOString()
    });

    // 사용자 포인트 업데이트
    const currentPoints = get().userPoints[mission.completedBy] || 0;
    await set(userPointsRef, currentPoints + mission.points);
  },

  deleteMission: async (missionId) => {
    await remove(ref(db, `missions/${missionId}`));
  },

  getUserPoints: (userId) => {
    return get().userPoints[userId] || 0;
  }
}));

// Firebase 실시간 동기화
if (typeof window !== 'undefined') {
  // 미션 데이터 동기화
  const missionsRef = ref(db, 'missions');
  onValue(missionsRef, (snapshot) => {
    const data = snapshot.val() || {};
    useMissionStore.setState({
      missions: Object.values(data)
    });
  });

  // 사용자 포인트 동기화
  const userPointsRef = ref(db, 'userPoints');
  onValue(userPointsRef, (snapshot) => {
    const data = snapshot.val() || {};
    useMissionStore.setState({
      userPoints: data
    });
  });
}
