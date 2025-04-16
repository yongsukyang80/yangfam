import { create } from 'zustand';
import { ref, set as firebaseSet, remove, onValue } from 'firebase/database';
import { db } from '@/lib/firebase';

interface Vote {
  id: string;
  userId: string;
  option: string;
}

interface FoodVoteOption {
  id: string;
  text: string;
  votes: Vote[];
}

interface FoodVote {
  id: string;
  title: string;
  options: FoodVoteOption[];
  endTime: string;
  createdBy: string;
  createdAt: string;
}

interface FoodVoteStore {
  votes: FoodVote[];
  createVote: (vote: Omit<FoodVote, 'id' | 'createdAt'>) => Promise<void>;
  submitVote: (voteId: string, optionId: string, userId: string) => Promise<void>;
  deleteVote: (voteId: string) => Promise<void>;
}

export const useFoodVoteStore = create<FoodVoteStore>()((set, get) => ({
  votes: [],

  createVote: async (voteData) => {
    const votesRef = ref(db, 'foodVotes');
    const newVoteRef = ref(db, `foodVotes/${Date.now()}`);
    
    const newVote: FoodVote = {
      ...voteData,
      id: newVoteRef.key!,
      createdAt: new Date().toISOString()
    };

    await firebaseSet(newVoteRef, newVote);
  },

  submitVote: async (voteId, optionId, userId) => {
    const vote = get().votes.find(v => v.id === voteId);
    if (!vote) return;

    const option = vote.options.find(o => o.id === optionId);
    if (!option) return;

    const newVote: Vote = {
      id: Date.now().toString(),
      userId,
      option: optionId
    };

    const updatedOptions = vote.options.map(o =>
      o.id === optionId
        ? { ...o, votes: [...o.votes, newVote] }
        : o
    );

    await firebaseSet(ref(db, `foodVotes/${voteId}`), {
      ...vote,
      options: updatedOptions
    });
  },

  deleteVote: async (voteId) => {
    await remove(ref(db, `foodVotes/${voteId}`));
  }
}));

if (typeof window !== 'undefined') {
  const votesRef = ref(db, 'foodVotes');
  onValue(votesRef, (snapshot) => {
    const data = snapshot.val() || {};
    useFoodVoteStore.setState({
      votes: Object.values(data)
    });
  });
}
