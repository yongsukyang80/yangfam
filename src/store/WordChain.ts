import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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

export const useWordChainStore = create<WordChainStore>()(
  persist(
    (set, get) => ({
      players: [],
      words: [],
      currentTurn: null,
      isGameStarted: false,

      addPlayer: (player) => 
        set((state) => ({
          players: [...state.players, { ...player, score: 0 }],
        })),

      removePlayer: (playerId) =>
        set((state) => ({
          players: state.players.filter((p) => p.id !== playerId),
        })),

      addWord: (word, playerId) => {
        const state = get();
        const lastWord = state.words[state.words.length - 1]?.word;
        
        // 첫 단어이거나 끝말잇기 규칙에 맞는 경우
        if (!lastWord || lastWord.charAt(lastWord.length - 1) === word.charAt(0)) {
          set((state) => ({
            words: [...state.words, { 
              word, 
              playerId, 
              timestamp: new Date().toISOString() 
            }],
            players: state.players.map(p => 
              p.id === playerId 
                ? { ...p, score: p.score + word.length } 
                : p
            ),
            currentTurn: state.players[
              (state.players.findIndex(p => p.id === playerId) + 1) % state.players.length
            ].id
          }));
          return true;
        }
        return false;
      },

      startGame: () =>
        set((state) => ({
          isGameStarted: true,
          currentTurn: state.players[0]?.id || null,
          words: []
        })),

      endGame: () =>
        set((state) => ({
          isGameStarted: false,
          currentTurn: null
        })),

      resetGame: () =>
        set({
          players: [],
          words: [],
          currentTurn: null,
          isGameStarted: false
        })
    }),
    {
      name: 'word-chain-storage'
    }
  )
);
