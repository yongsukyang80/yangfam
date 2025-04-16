import { create } from 'zustand';
import { ref, set, onValue } from 'firebase/database';
import { db } from '@/lib/firebase';

interface Card {
  id: number;
  emoji: string;
  isFlipped: boolean;
  isMatched: boolean;
}

interface Player {
  id: string;
  name: string;
  score: number;
}

interface MemoryStore {
  cards: Card[];
  players: Player[];
  currentPlayer: string | null;
  isPlaying: boolean;
  moves: number;
  initializeGame: (players: Player[]) => void;
  flipCard: (cardId: number) => void;
  resetGame: () => void;
}

const EMOJIS = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼'];

export const useMemoryStore = create<MemoryStore>((set, get) => ({
  cards: [],
  players: [],
  currentPlayer: null,
  isPlaying: false,
  moves: 0,

  initializeGame: async (players) => {
    const cards = [...EMOJIS, ...EMOJIS]
      .sort(() => Math.random() - 0.5)
      .map((emoji, index) => ({
        id: index,
        emoji,
        isFlipped: false,
        isMatched: false
      }));

    await set(ref(db, 'games/memory'), {
      cards,
      players,
      currentPlayer: players[0].id,
      isPlaying: true,
      moves: 0
    });
  },

  flipCard: async (cardId) => {
    const state = get();
    const cards = [...state.cards];
    const flippedCards = cards.filter(c => c.isFlipped && !c.isMatched);

    if (flippedCards.length === 2 || cards[cardId].isMatched) return;

    cards[cardId].isFlipped = true;

    if (flippedCards.length === 1) {
      const moves = state.moves + 1;
      await set(ref(db, 'games/memory/moves'), moves);

      if (cards[cardId].emoji === flippedCards[0].emoji) {
        cards[cardId].isMatched = true;
        cards[flippedCards[0].id].isMatched = true;
        
        // Update player score
        const players = [...state.players];
        const playerIndex = players.findIndex(p => p.id === state.currentPlayer);
        if (playerIndex !== -1) {
          players[playerIndex].score += 2;
        }
        await set(ref(db, 'games/memory/players'), players);
      } else {
        setTimeout(async () => {
          cards[cardId].isFlipped = false;
          cards[flippedCards[0].id].isFlipped = false;
          await set(ref(db, 'games/memory/cards'), cards);
        }, 1000);
      }

      // Switch to next player
      const currentPlayerIndex = state.players.findIndex(p => p.id === state.currentPlayer);
      const nextPlayer = state.players[(currentPlayerIndex + 1) % state.players.length];
      await set(ref(db, 'games/memory/currentPlayer'), nextPlayer.id);
    }

    await set(ref(db, 'games/memory/cards'), cards);
  },

  resetGame: async () => {
    await set(ref(db, 'games/memory'), {
      cards: [],
      players: [],
      currentPlayer: null,
      isPlaying: false,
      moves: 0
    });
  }
}));

// Firebase 실시간 동기화
if (typeof window !== 'undefined') {
  const gameRef = ref(db, 'games/memory');
  onValue(gameRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      useMemoryStore.setState(data);
    }
  });
}
