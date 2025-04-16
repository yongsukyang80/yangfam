import { create } from 'zustand';
import { ref, set, push, remove, onValue } from 'firebase/database';
import { db } from '@/lib/firebase';

interface Quiz {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  createdBy: string;
}

interface QuizAttempt {
  quizId: string;
  userId: string;
  answer: string;
  isCorrect: boolean;
  timestamp: string;
}

interface QuizStore {
  quizzes: Quiz[];
  attempts: QuizAttempt[];
  addQuiz: (quiz: Omit<Quiz, 'id'>) => void;
  removeQuiz: (quizId: string) => void;
  submitAnswer: (quizId: string, userId: string, answer: string) => void;
}

export const useQuizStore = create<QuizStore>((set, get) => ({
  quizzes: [],
  attempts: [],

  addQuiz: async (quizData) => {
    const quizzesRef = ref(db, 'games/quiz/quizzes');
    const newQuizRef = push(quizzesRef);
    const newQuiz = {
      ...quizData,
      id: newQuizRef.key!
    };
    
    await set(newQuizRef, newQuiz);
  },

  removeQuiz: async (quizId) => {
    await remove(ref(db, `games/quiz/quizzes/${quizId}`));
  },

  submitAnswer: async (quizId, userId, answer) => {
    const quiz = get().quizzes.find(q => q.id === quizId);
    if (!quiz) return;

    const attemptsRef = ref(db, 'games/quiz/attempts');
    const newAttemptRef = push(attemptsRef);
    const attempt = {
      quizId,
      userId,
      answer,
      isCorrect: answer === quiz.correctAnswer,
      timestamp: new Date().toISOString()
    };
    
    await set(newAttemptRef, attempt);
  }
}));

// Firebase 실시간 동기화
if (typeof window !== 'undefined') {
  const quizRef = ref(db, 'games/quiz');
  onValue(quizRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      useQuizStore.setState({
        quizzes: Object.values(data.quizzes || {}),
        attempts: Object.values(data.attempts || {})
      });
    }
  });
}
