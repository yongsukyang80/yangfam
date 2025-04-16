import { create } from 'zustand';
import { ref, set, push, remove, onValue } from 'firebase/database';
import { db } from '@/lib/firebase';

interface WordChainPlayer {
  id: string;
  name: string;
  score: number;
}

interface WordChainWord {
  word: string;
  playerId: string;
  timestamp: string;
}

interface WordChainStore {
  players: WordChainPlayer[];
  words: WordChainWord[];
  currentTurn: string | null;
  isGameStarted: boolean;
  addPlayer: (player: Omit<WordChainPlayer, 'score'>) => void;
  removePlayer: (playerId: string) => void;
  addWord: (word: string, playerId: string) => boolean;
  startGame: () => void;
  endGame: () => void;
  resetGame: () => void;
}

export const useWordChainStore = create<WordChainStore>((set, get) => ({
  players: [],
  words: [],
  currentTurn: null,
  isGameStarted: false,

  addPlayer: async (player) => {
    const playersRef = ref(db, 'games/wordChain/players');
    await push(playersRef, { ...player, score: 0 });
  },

  removePlayer: async (playerId) => {
    const players = get().players;
    const playerToRemove = players.find(p => p.id === playerId);
    if (playerToRemove) {
      await remove(ref(db, `games/wordChain/players/${playerId}`));
    }
  },

  addWord: async (word, playerId) => {
    const state = get();
    const lastWord = state.words[state.words.length - 1]?.word;
    
    if (!lastWord || lastWord.charAt(lastWord.length - 1) === word.charAt(0)) {
      const wordsRef = ref(db, 'games/wordChain/words');
      await push(wordsRef, {
        word,
        playerId,
        timestamp: new Date().toISOString()
      });

      const players = state.players;
      const playerIndex = players.findIndex(p => p.id === playerId);
      if (playerIndex !== -1) {
        const updatedPlayers = [...players];
        updatedPlayers[playerIndex] = {
          ...players[playerIndex],
          score: players[playerIndex].score + word.length
        };
        await set(ref(db, 'games/wordChain/players'), updatedPlayers);
      }

      const nextPlayer = players[(playerIndex + 1) % players.length];
      await set(ref(db, 'games/wordChain/currentTurn'), nextPlayer.id);
      return true;
    }
    return false;
  },

  startGame: async () => {
    await set(ref(db, 'games/wordChain/isGameStarted'), true);
    const state = get();
    if (state.players.length > 0) {
      await set(ref(db, 'games/wordChain/currentTurn'), state.players[0].id);
    }
    await set(ref(db, 'games/wordChain/words'), []);
  },

  endGame: async () => {
    await set(ref(db, 'games/wordChain/isGameStarted'), false);
    await set(ref(db, 'games/wordChain/currentTurn'), null);
  },

  resetGame: async () => {
    await set(ref(db, 'games/wordChain'), {
      players: [],
      words: [],
      currentTurn: null,
      isGameStarted: false
    });
  }
}));

// Firebase 실시간 동기화
if (typeof window !== 'undefined') {
  const gameRef = ref(db, 'games/wordChain');
  onValue(gameRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      useWordChainStore.setState({
        players: Object.values(data.players || {}),
        words: Object.values(data.words || {}),
        currentTurn: data.currentTurn,
        isGameStarted: data.isGameStarted
      });
    }
  });
}
