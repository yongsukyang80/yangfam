import { create } from 'zustand';

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
  selectedCards: number[];
  isPlaying: boolean;
  moves: number;
  initializeGame: (players: Player[]) => void;
  flipCard: (cardId: number) => void;
  nextTurn: () => void;
  resetGame: () => void;
}

const EMOJIS = ['👨', '👩', '👶', '🐕', '🏠', '❤️', '🌟', '🎂'];
const createCards = () => {
  const cards: Card[] = [];
  // 각 이모지를 두 번씩 추가
  [...EMOJIS, ...EMOJIS].forEach((emoji, index) => {
    cards.push({
      id: index,
      emoji,
      isFlipped: false,
      isMatched: false,
    });
  });
  // 카드 섞기
  return cards.sort(() => Math.random() - 0.5);
};

export const useMemoryStore = create<MemoryStore>((set, get) => ({
  cards: [],
  players: [],
  currentPlayer: null,
  selectedCards: [],
  isPlaying: false,
  moves: 0,

  initializeGame: (players) => {
    set({
      cards: createCards(),
      players: players.map(p => ({ ...p, score: 0 })),
      currentPlayer: players[0].id,
      selectedCards: [],
      isPlaying: true,
      moves: 0,
    });
  },

  flipCard: (cardId) => {
    const { cards, selectedCards, players, currentPlayer } = get();
    
    // 이미 매칭된 카드거나 선택된 카드는 무시
    if (
      cards[cardId].isMatched ||
      selectedCards.includes(cardId) ||
      selectedCards.length >= 2
    ) {
      return;
    }

    // 카드 뒤집기
    set((state) => ({
      cards: state.cards.map((card) =>
        card.id === cardId ? { ...card, isFlipped: true } : card
      ),
      selectedCards: [...state.selectedCards, cardId],
    }));

    // 두 번째 카드를 선택한 경우
    if (selectedCards.length === 1) {
      const firstCard = cards[selectedCards[0]];
      const secondCard = cards[cardId];

      setTimeout(() => {
        if (firstCard.emoji === secondCard.emoji) {
          // 매칭 성공
          set((state) => ({
            cards: state.cards.map((card) =>
              card.id === firstCard.id || card.id === secondCard.id
                ? { ...card, isMatched: true }
                : card
            ),
            players: state.players.map((player) =>
              player.id === currentPlayer
                ? { ...player, score: player.score + 1 }
                : player
            ),
            selectedCards: [],
          }));
        } else {
          // 매칭 실패
          set((state) => ({
            cards: state.cards.map((card) =>
              card.id === firstCard.id || card.id === secondCard.id
                ? { ...card, isFlipped: false }
                : card
            ),
            selectedCards: [],
          }));
          get().nextTurn();
        }
      }, 1000);

      set((state) => ({
        moves: state.moves + 1,
      }));
    }
  },

  nextTurn: () => {
    set((state) => {
      const currentIndex = state.players.findIndex(
        (p) => p.id === state.currentPlayer
      );
      const nextIndex = (currentIndex + 1) % state.players.length;
      return {
        currentPlayer: state.players[nextIndex].id,
      };
    });
  },

  resetGame: () => {
    set({
      cards: [],
      players: [],
      currentPlayer: null,
      selectedCards: [],
      isPlaying: false,
      moves: 0,
    });
  },
}));
