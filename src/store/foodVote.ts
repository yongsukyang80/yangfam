import { create } from 'zustand';
import { ref, set as firebaseSet, remove, onValue, get as firebaseGet } from 'firebase/database';
import { db } from '@/lib/firebase';

export interface Vote {
  id: string;
  userId: string;
  userName: string;
  option: string;
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
  lastModified?: string;
}

interface FoodVoteStore {
  votes: FoodVote[];
  createVote: (vote: Omit<FoodVote, 'id' | 'createdAt'>) => Promise<void>;
  submitVote: (voteId: string, optionId: string, userId: string, userName: string) => Promise<void>;
  deleteVote: (voteId: string) => Promise<void>;
  updateVote: (voteId: string, updates: { title: string; endTime: string; options: FoodVoteOption[] }) => Promise<void>;
  getVoteParticipants: (voteId: string) => Vote[];
  subscribeToVote: (voteId: string, callback: (vote: FoodVote) => void) => () => void;
}

export const useFoodVoteStore = create<FoodVoteStore>()((set, get) => ({
  votes: [],

  createVote: async (voteData) => {
    const votesRef = ref(db, 'foodVotes');
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
      opt.votes.some(v => v.userId === userId)
    );

    if (hasVoted) {
      throw new Error('이미 투표하셨습니다.');
    }

    const option = vote.options.find(o => o.id === optionId);
    if (!option) return;

    const newVote: Vote = {
      id: Date.now().toString(),
      userId,
      userName,
      option: optionId,
      timestamp: new Date().toISOString()
    };

    const updatedOptions = vote.options.map(o =>
      o.id === optionId
        ? { ...o, votes: [...(o.votes || []), newVote] }
        : o
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

    const updatedVote = {
      ...vote,
      title: updates.title,
      endTime: updates.endTime,
      options: updates.options.map(option => ({
        ...option,
        votes: vote.options.find(o => o.id === option.id)?.votes || []
      }))
    };

    await firebaseSet(voteRef, updatedVote);
  },

  deleteVote: async (voteId) => {
    await remove(ref(db, `foodVotes/${voteId}`));
  },

  getVoteParticipants: (voteId) => {
    const vote = get().votes.find(v => v.id === voteId);
    if (!vote) return [];

    const participants = vote.options.flatMap(option => option.votes);
    return participants.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  },

  subscribeToVote: (voteId, callback) => {
    const voteRef = ref(db, `foodVotes/${voteId}`);
    const unsubscribe = onValue(voteRef, (snapshot) => {
      const vote = snapshot.val() as FoodVote;
      if (vote) {
        callback(vote);
      }
    });
    return unsubscribe;
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
