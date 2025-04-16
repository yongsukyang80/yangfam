import { create } from 'zustand';
import { ref, set, get, push, onValue } from 'firebase/database';
import { db } from '@/lib/firebase';

// 게임 공통 타입
interface GameScore {
  userId: string;
  userName: string;
  score: number;
  timestamp: string;
}

// 끝말잇기 게임 타입
interface WordChainGame {
  currentWord: string;
  usedWords: string[];
  scores: GameScore[];
}

// 퀴즈 게임 타입
interface Quiz {
  id: string;
  question: string;
  answer: string;
  createdBy: string;
}

interface QuizGame {
  quizzes: Quiz[];
  scores: GameScore[];
}

// 메모리 게임 타입
interface MemoryGame {
  bestScores: GameScore[];
}

interface GamesStore {
  // 끝말잇기
  wordChain: WordChainGame;
  submitWord: (word: string, userId: string, userName: string) => Promise<boolean>;
  resetWordChain: () => void;
  
  // 퀴즈
  quiz: QuizGame;
  addQuiz: (quiz: Omit<Quiz, 'id'>) => Promise<void>;
  submitQuizAnswer: (quizId: string, answer: string, userId: string, userName: string) => Promise<boolean>;
  
  // 메모리 게임
  memory: MemoryGame;
  submitMemoryScore: (score: number, userId: string, userName: string) => Promise<void>;
}

export const useGamesStore = create<GamesStore>()((set, get) => ({
  wordChain: {
    currentWord: '시작',
    usedWords: [],
    scores: []
  },
  
  quiz: {
    quizzes: [],
    scores: []
  },
  
  memory: {
    bestScores: []
  },

  submitWord: async (word, userId, userName) => {
    const { wordChain } = get();
    const lastWord = wordChain.currentWord;
    
    if (word.charAt(0) !== lastWord.charAt(lastWord.length - 1)) {
      return false;
    }
    
    if (wordChain.usedWords.includes(word)) {
      return false;
    }

    const newScore: GameScore = {
      userId,
      userName,
      score: 1,
      timestamp: new Date().toISOString()
    };

    await set(ref(db, 'games/wordChain'), {
      currentWord: word,
      usedWords: [...wordChain.usedWords, word],
      scores: [...wordChain.scores, newScore]
    });

    return true;
  },

  resetWordChain: async () => {
    await set(ref(db, 'games/wordChain'), {
      currentWord: '시작',
      usedWords: [],
      scores: []
    });
  },

  addQuiz: async (quiz) => {
    const quizRef = push(ref(db, 'games/quiz/questions'));
    await set(quizRef, {
      ...quiz,
      id: quizRef.key
    });
  },

  submitQuizAnswer: async (quizId, answer, userId, userName) => {
    const quizRef = ref(db, `games/quiz/questions/${quizId}`);
    const snapshot = await get(quizRef);
    const quiz = snapshot.val();

    if (quiz.answer === answer) {
      const newScore: GameScore = {
        userId,
        userName,
        score: 1,
        timestamp: new Date().toISOString()
      };

      const { quiz: quizState } = get();
      await set(ref(db, 'games/quiz/scores'), [...quizState.scores, newScore]);
      return true;
    }

    return false;
  },

  submitMemoryScore: async (score, userId, userName) => {
    const newScore: GameScore = {
      userId,
      userName,
      score,
      timestamp: new Date().toISOString()
    };

    const { memory } = get();
    const updatedScores = [...memory.bestScores, newScore]
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    await set(ref(db, 'games/memory/scores'), updatedScores);
  }
}));

// Firebase 실시간 동기화
if (typeof window !== 'undefined') {
  // 끝말잇기 동기화
  onValue(ref(db, 'games/wordChain'), (snapshot) => {
    const data = snapshot.val() || { currentWord: '시작', usedWords: [], scores: [] };
    useGamesStore.setState({ wordChain: data });
  });

  // 퀴즈 동기화
  onValue(ref(db, 'games/quiz'), (snapshot) => {
    const data = snapshot.val() || { questions: [], scores: [] };
    useGamesStore.setState({ 
      quiz: {
        quizzes: Object.values(data.questions || {}),
        scores: data.scores || []
      }
    });
  });

  // 메모리 게임 동기화
  onValue(ref(db, 'games/memory/scores'), (snapshot) => {
    const scores = snapshot.val() || [];
    useGamesStore.setState({ 
      memory: { bestScores: scores }
    });
  });
}
