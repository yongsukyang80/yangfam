import { create } from 'zustand';
import { ref, set as firebaseSet, remove, onValue } from 'firebase/database';
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
    const missionRef = ref(db, 'missions');
    const newMissionRef = ref(db, `missions/${Date.now()}`);
    
    const newMission: Mission = {
      ...missionData,
      id: newMissionRef.key!,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    await firebaseSet(newMissionRef, newMission);
  },

  assignMission: async (missionId, userId) => {
    const mission = get().missions.find(m => m.id === missionId);
    if (!mission) return;

    await firebaseSet(ref(db, `missions/${missionId}`), {
      ...mission,
      assignedTo: userId
    });
  },

  submitMissionProof: async (missionId, userId, proofImage) => {
    const mission = get().missions.find(m => m.id === missionId);
    if (!mission) return;

    await firebaseSet(ref(db, `missions/${missionId}`), {
      ...mission,
      status: 'completed',
      completedBy: userId,
      completedAt: new Date().toISOString(),
      proofImage
    });
  },

  verifyMission: async (missionId, verifierId) => {
    const mission = get().missions.find(m => m.id === missionId);
    if (!mission || !mission.completedBy) return;

    await firebaseSet(ref(db, `missions/${missionId}`), {
      ...mission,
      status: 'verified',
      verifiedBy: verifierId,
      verifiedAt: new Date().toISOString()
    });

    // Update user points
    const userPointsRef = ref(db, `userPoints/${mission.completedBy}`);
    const currentPoints = await get().getUserPoints(mission.completedBy);
    await firebaseSet(userPointsRef, currentPoints + mission.points);
  },

  deleteMission: async (missionId) => {
    await remove(ref(db, `missions/${missionId}`));
  },

  getUserPoints: (userId) => {
    const mission = get().missions.find(m => 
      m.status === 'verified' && m.completedBy === userId
    );
    return mission ? mission.points : 0;
  }
}));

if (typeof window !== 'undefined') {
  const missionsRef = ref(db, 'missions');
  onValue(missionsRef, (snapshot) => {
    const data = snapshot.val() || {};
    useMissionStore.setState({
      missions: Object.values(data)
    });
  });
}
