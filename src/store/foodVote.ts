import { create } from 'zustand';
import { ref, set as firebaseSet, get as firebaseGet, remove, onValue } from 'firebase/database';
import { db } from '@/lib/firebase';

export interface Vote {
  id: string;
  userId: string;
  userName: string;
  timestamp: string;
}

export interface FoodVoteOption {
  id: string;
  text: string;
  votes: Vote[];
}

export interface FoodVote {
  id: string;
  title: string;
  options: FoodVoteOption[];
  endTime: string;
  createdBy: string;
  createdByName: string;
  createdAt: string;
}

interface FoodVoteStore {
  votes: FoodVote[];
  createVote: (vote: Omit<FoodVote, 'id' | 'createdAt'>) => Promise<void>;
  submitVote: (voteId: string, optionId: string, userId: string, userName: string) => Promise<void>;
  deleteVote: (voteId: string) => Promise<void>;
  updateVote: (voteId: string, updates: { title: string; endTime: string; options: FoodVoteOption[] }) => Promise<void>;
}

export const useFoodVoteStore = create<FoodVoteStore>()((set, get) => ({
  votes: [],

  createVote: async (voteData) => {
    const newVoteRef = ref(db, `foodVotes/${Date.now()}`);
    const newVote: FoodVote = {
      ...voteData,
      id: newVoteRef.key!,
      createdAt: new Date().toISOString(),
      options: voteData.options.map(option => ({
        ...option,
        votes: []
      }))
    };

    await firebaseSet(newVoteRef, newVote);
  },

  submitVote: async (voteId, optionId, userId, userName) => {
    const voteRef = ref(db, `foodVotes/${voteId}`);
    const snapshot = await firebaseGet(voteRef);
    const vote = snapshot.val() as FoodVote;
    
    if (!vote) return;

    if (new Date(vote.endTime) < new Date()) {
      throw new Error('투표가 마감되었습니다.');
    }

    const hasVoted = vote.options.some(opt => 
      opt.votes?.some(v => v.userId === userId)
    );

    if (hasVoted) {
      throw new Error('이미 투표하셨습니다.');
    }

    const newVote: Vote = {
      id: Date.now().toString(),
      userId,
      userName,
      timestamp: new Date().toISOString()
    };

    const updatedOptions = vote.options.map(opt =>
      opt.id === optionId
        ? { ...opt, votes: [...(opt.votes || []), newVote] }
        : opt
    );

    await firebaseSet(voteRef, {
      ...vote,
      options: updatedOptions
    });
  },

  updateVote: async (voteId, updates) => {
    const voteRef = ref(db, `foodVotes/${voteId}`);
    const snapshot = await firebaseGet(voteRef);
    const vote = snapshot.val() as FoodVote;
    
    if (!vote) return;

    await firebaseSet(voteRef, {
      ...vote,
      ...updates,
      options: updates.options.map(option => ({
        ...option,
        votes: vote.options.find(o => o.id === option.id)?.votes || []
      }))
    });
  },

  deleteVote: async (voteId) => {
    await remove(ref(db, `foodVotes/${voteId}`));
  }
}));

if (typeof window !== 'undefined') {
  const votesRef = ref(db, 'foodVotes');
  onValue(votesRef, (snapshot) => {
    const data = snapshot.val();
    const votes = data ? Object.values(data) as FoodVote[] : [];
    useFoodVoteStore.setState({ votes });
  });
}
