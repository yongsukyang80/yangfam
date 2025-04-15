import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
  userPoints: Record<string, number>; // 사용자별 포인트 현황
  createMission: (mission: Omit<Mission, 'id' | 'status' | 'createdAt'>) => void;
  completeMission: (missionId: string, proof: string) => void;
  verifyMission: (missionId: string) => void;
  deleteMission: (missionId: string) => void;
  getUserPoints: (userId: string) => number;
}

export const useMissionStore = create<MissionStore>()(
  persist(
    (set, get) => ({
      missions: [],
      userPoints: {},

      createMission: (mission) =>
        set((state) => ({
          missions: [
            ...state.missions,
            {
              ...mission,
              id: crypto.randomUUID(),
              status: 'pending',
              createdAt: new Date().toISOString(),
            },
          ],
        })),

      completeMission: (missionId, proof) =>
        set((state) => ({
          missions: state.missions.map((mission) =>
            mission.id === missionId
              ? {
                  ...mission,
                  status: 'completed',
                  completedAt: new Date().toISOString(),
                  proof,
                }
              : mission
          ),
        })),

      verifyMission: (missionId) =>
        set((state) => {
          const mission = state.missions.find((m) => m.id === missionId);
          if (!mission) return state;

          const currentPoints = state.userPoints[mission.assignedTo] || 0;
          
          return {
            missions: state.missions.map((m) =>
              m.id === missionId
                ? {
                    ...m,
                    status: 'verified',
                    verifiedAt: new Date().toISOString(),
                  }
                : m
            ),
            userPoints: {
              ...state.userPoints,
              [mission.assignedTo]: currentPoints + mission.points,
            },
          };
        }),

      deleteMission: (missionId) =>
        set((state) => ({
          missions: state.missions.filter((mission) => mission.id !== missionId),
        })),

      getUserPoints: (userId) => get().userPoints[userId] || 0,
    }),
    {
      name: 'mission-storage',
    }
  )
);
