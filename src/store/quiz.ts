import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface QuizQuestion {
  id: string;
  question: string;
  answer: string;
  createdBy: string;
  category: '취미' | '음식' | '추억' | '기타';
}

interface QuizAnswer {
  questionId: string;
  playerId: string;
  answer: string;
  isCorrect: boolean;
}

interface QuizStore {
  questions: QuizQuestion[];
  answers: QuizAnswer[];
  currentQuestionIndex: number;
  isPlaying: boolean;
  addQuestion: (question: Omit<QuizQuestion, 'id'>) => void;
  removeQuestion: (id: string) => void;
  submitAnswer: (questionId: string, playerId: string, answer: string) => void;
  startQuiz: () => void;
  endQuiz: () => void;
  nextQuestion: () => void;
  resetQuiz: () => void;
}

export const useQuizStore = create<QuizStore>()(
  persist(
    (set, get) => ({
      questions: [],
      answers: [],
      currentQuestionIndex: 0,
      isPlaying: false,

      addQuestion: (question) =>
        set((state) => ({
          questions: [
            ...state.questions,
            {
              ...question,
              id: crypto.randomUUID(),
            },
          ],
        })),

      removeQuestion: (id) =>
        set((state) => ({
          questions: state.questions.filter((q) => q.id !== id),
        })),

      submitAnswer: (questionId, playerId, answer) => {
        const question = get().questions.find((q) => q.id === questionId);
        if (!question) return;

        const isCorrect = question.answer.toLowerCase() === answer.toLowerCase();
        
        set((state) => ({
          answers: [
            ...state.answers,
            {
              questionId,
              playerId,
              answer,
              isCorrect,
            },
          ],
        }));
      },

      startQuiz: () =>
        set({
          isPlaying: true,
          currentQuestionIndex: 0,
          answers: [],
        }),

      endQuiz: () =>
        set({
          isPlaying: false,
        }),

      nextQuestion: () =>
        set((state) => ({
          currentQuestionIndex: state.currentQuestionIndex + 1,
        })),

      resetQuiz: () =>
        set({
          questions: [],
          answers: [],
          currentQuestionIndex: 0,
          isPlaying: false,
        }),
    }),
    {
      name: 'quiz-storage',
    }
  )
);
