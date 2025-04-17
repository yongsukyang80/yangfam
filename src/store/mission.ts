import { create } from 'zustand';
import { ref, set as firebaseSet, get as firebaseGet, remove, onValue } from 'firebase/database';
import { db } from '@/lib/firebase';

export interface Mission {
  id: string;
  title: string;
  description: string;
  points: number;
  createdBy: string;
  createdByName: string;
  createdAt: string;
  deadline: string;
  status: 'pending' | 'completed' | 'verified' | 'rejected';
  completedBy?: string;
  completedByName?: string;
  completedAt?: string;
  proofImage?: string;
  verifiedBy?: string;
  verifiedByName?: string;
  verifiedAt?: string;
  rejectionReason?: string;
}

interface MissionStore {
  missions: Mission[];
  createMission: (mission: Omit<Mission, 'id' | 'createdAt' | 'status'>) => Promise<void>;
  completeMission: (missionId: string, userId: string, userName: string, proofImage?: string) => Promise<void>;
  verifyMission: (missionId: string, verifierId: string, verifierName: string, isApproved: boolean, rejectionReason?: string) => Promise<void>;
  deleteMission: (missionId: string) => Promise<void>;
}

export const useMissionStore = create<MissionStore>()((set, get) => ({
  missions: [],

  createMission: async (missionData) => {
    const newMissionRef = ref(db, `missions/${Date.now()}`);
    const newMission: Mission = {
      ...missionData,
      id: newMissionRef.key!,
      createdAt: new Date().toISOString(),
      status: 'pending'
    };

    await firebaseSet(newMissionRef, newMission);
  },

  completeMission: async (missionId, userId, userName, proofImage) => {
    const missionRef = ref(db, `missions/${missionId}`);
    const snapshot = await firebaseGet(missionRef);
    const mission = snapshot.val() as Mission;

    if (!mission || mission.status !== 'pending') return;

    const updatedMission: Mission = {
      ...mission,
      status: 'completed',
      completedBy: userId,
      completedByName: userName,
      completedAt: new Date().toISOString(),
      proofImage
    };

    await firebaseSet(missionRef, updatedMission);
  },

  verifyMission: async (missionId, verifierId, verifierName, isApproved, rejectionReason) => {
    const missionRef = ref(db, `missions/${missionId}`);
    const snapshot = await firebaseGet(missionRef);
    const mission = snapshot.val() as Mission;

    if (!mission || mission.status !== 'completed') return;

    const updatedMission: Mission = {
      ...mission,
      status: isApproved ? 'verified' : 'rejected',
      verifiedBy: verifierId,
      verifiedByName: verifierName,
      verifiedAt: new Date().toISOString()
    };

    if (!isApproved && rejectionReason) {
      updatedMission.rejectionReason = rejectionReason;
    }

    await firebaseSet(missionRef, updatedMission);

    // 미션 완료 시 포인트 지급
    if (isApproved && mission.completedBy) {
      const userRef = ref(db, `users/${mission.completedBy}`);
      const userSnapshot = await firebaseGet(userRef);
      const user = userSnapshot.val();

      if (user) {
        await firebaseSet(userRef, {
          ...user,
          points: (user.points || 0) + mission.points
        });
      }
    }
  },

  deleteMission: async (missionId) => {
    await remove(ref(db, `missions/${missionId}`));
  }
}));

if (typeof window !== 'undefined') {
  const missionsRef = ref(db, 'missions');
  onValue(missionsRef, (snapshot) => {
    const data = snapshot.val();
    const missions = data ? Object.values(data) as Mission[] : [];
    useMissionStore.setState({ missions });
  });
}
