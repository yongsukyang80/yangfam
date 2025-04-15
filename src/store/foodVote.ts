import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface FoodOption {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
  votes: string[]; // 투표한 사용자 ID 배열
  createdBy: string;
  createdAt: string;
}

interface Vote {
  id: string;
  title: string;
  description: string;
  options: FoodOption[];
  endTime: string;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
}

interface FoodVoteStore {
  votes: Vote[];
  createVote: (vote: Omit<Vote, 'id' | 'isActive' | 'createdAt'>) => void;
  addOption: (voteId: string, option: Omit<FoodOption, 'id' | 'votes' | 'createdAt'>) => void;
  removeOption: (voteId: string, optionId: string) => void;
  toggleVote: (voteId: string, optionId: string, userId: string) => void;
  endVote: (voteId: string) => void;
  deleteVote: (voteId: string) => void;
}

export const useFoodVoteStore = create<FoodVoteStore>()(
  persist(
    (set) => ({
      votes: [],

      createVote: (vote) =>
        set((state) => ({
          votes: [
            ...state.votes,
            {
              ...vote,
              id: crypto.randomUUID(),
              isActive: true,
              createdAt: new Date().toISOString(),
              options: [],
            },
          ],
        })),

      addOption: (voteId, option) =>
        set((state) => ({
          votes: state.votes.map((vote) =>
            vote.id === voteId
              ? {
                  ...vote,
                  options: [
                    ...vote.options,
                    {
                      ...option,
                      id: crypto.randomUUID(),
                      votes: [],
                      createdAt: new Date().toISOString(),
                    },
                  ],
                }
              : vote
          ),
        })),

      removeOption: (voteId, optionId) =>
        set((state) => ({
          votes: state.votes.map((vote) =>
            vote.id === voteId
              ? {
                  ...vote,
                  options: vote.options.filter((option) => option.id !== optionId),
                }
              : vote
          ),
        })),

      toggleVote: (voteId, optionId, userId) =>
        set((state) => ({
          votes: state.votes.map((vote) =>
            vote.id === voteId
              ? {
                  ...vote,
                  options: vote.options.map((option) =>
                    option.id === optionId
                      ? {
                          ...option,
                          votes: option.votes.includes(userId)
                            ? option.votes.filter((id) => id !== userId)
                            : [...option.votes, userId],
                        }
                      : {
                          ...option,
                          votes: option.votes.filter((id) => id !== userId),
                        }
                  ),
                }
              : vote
          ),
        })),

      endVote: (voteId) =>
        set((state) => ({
          votes: state.votes.map((vote) =>
            vote.id === voteId ? { ...vote, isActive: false } : vote
          ),
        })),

      deleteVote: (voteId) =>
        set((state) => ({
          votes: state.votes.filter((vote) => vote.id !== voteId),
        })),
    }),
    {
      name: 'food-vote-storage',
    }
  )
);
