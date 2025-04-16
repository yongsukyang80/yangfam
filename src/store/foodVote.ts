import { create } from 'zustand';
import { ref, set, push, remove, onValue } from 'firebase/database';
import { db } from '@/lib/firebase';

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

interface FoodVote {
  id: string;
  title: string;
  options: string[];
  createdBy: string;
  endTime: string;
  isActive: boolean;
}

interface Vote {
  voteId: string;
  userId: string;
  option: string;
  timestamp: string;
}

interface FoodVoteStore {
  votes: FoodVote[];
  userVotes: Vote[];
  createVote: (vote: Omit<FoodVote, 'id' | 'isActive'>) => void;
  submitVote: (voteId: string, userId: string, option: string) => void;
  closeVote: (voteId: string) => void;
  deleteVote: (voteId: string) => void;
}

export const useFoodVoteStore = create<FoodVoteStore>((set, get) => ({
  votes: [],
  userVotes: [],

  createVote: async (voteData) => {
    const votesRef = ref(db, 'foodVote/votes');
    const newVoteRef = push(votesRef);
    const newVote = {
      ...voteData,
      id: newVoteRef.key!,
      isActive: true
    };
    
    await set(newVoteRef, newVote);
  },

  submitVote: async (voteId, userId, option) => {
    const userVotesRef = ref(db, 'foodVote/userVotes');
    const newVoteRef = push(userVotesRef);
    const vote = {
      voteId,
      userId,
      option,
      timestamp: new Date().toISOString()
    };
    
    await set(newVoteRef, vote);
  },

  closeVote: async (voteId) => {
    await set(ref(db, `foodVote/votes/${voteId}/isActive`), false);
  },

  deleteVote: async (voteId) => {
    await remove(ref(db, `foodVote/votes/${voteId}`));
  }
}));

// Firebase 실시간 동기화
if (typeof window !== 'undefined') {
  const foodVoteRef = ref(db, 'foodVote');
  onValue(foodVoteRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      useFoodVoteStore.setState({
        votes: Object.values(data.votes || {}),
        userVotes: Object.values(data.userVotes || {})
      });
    }
  });
}
