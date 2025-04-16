import { create } from 'zustand';
import { ref, set, push, remove, onValue } from 'firebase/database';
import { db } from '@/lib/firebase';

interface Mission {
  id: string;
  title: string;
  description: string;
  points: number;
  assignedTo: string;
  assignedBy: string;
  status: 'pending' | 'completed' | 'verified';
  dueDate: string;
  completedAt?: string;
  verifiedAt?: string;
  createdAt: string;
  proof?: string; // 미션 완료 증거 (이미지 URL 또는 텍스트)
}

interface MissionStore {
  missions: Mission[];
  userPoints: { [userId: string]: number };
  createMission: (mission: Omit<Mission, 'id' | 'status'>) => void;
  completeMission: (missionId: string, proof: string) => void;
  verifyMission: (missionId: string) => void;
  deleteMission: (missionId: string) => void;
  getUserPoints: (userId: string) => number;
}

export const useMissionStore = create<MissionStore>((set, get) => ({
  missions: [],
  userPoints: {},

  createMission: async (missionData) => {
    const missionsRef = ref(db, 'missions/list');
    const newMissionRef = push(missionsRef);
    const newMission = {
      ...missionData,
      id: newMissionRef.key!,
      status: 'pending'
    };
    
    await set(newMissionRef, newMission);
  },

  completeMission: async (missionId, proof) => {
    const mission = get().missions.find(m => m.id === missionId);
    if (!mission) return;

    await set(ref(db, `missions/list/${missionId}`), {
      ...mission,
      status: 'completed',
      proof,
      completedAt: new Date().toISOString()
    });
  },

  verifyMission: async (missionId) => {
    const mission = get().missions.find(m => m.id === missionId);
    if (!mission) return;

    const userPoints = { ...get().userPoints };
    userPoints[mission.assignedTo] = (userPoints[mission.assignedTo] || 0) + mission.points;

    await Promise.all([
      set(ref(db, `missions/list/${missionId}`), {
        ...mission,
        status: 'verified'
      }),
      set(ref(db, 'missions/userPoints'), userPoints)
    ]);
  },

  deleteMission: async (missionId) => {
    await remove(ref(db, `missions/list/${missionId}`));
  },

  getUserPoints: (userId) => {
    return get().userPoints[userId] || 0;
  }
}));

// Firebase 실시간 동기화
if (typeof window !== 'undefined') {
  const missionsRef = ref(db, 'missions');
  onValue(missionsRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      useMissionStore.setState({
        missions: Object.values(data.list || {}),
        userPoints: data.userPoints || {}
      });
    }
  });
}
