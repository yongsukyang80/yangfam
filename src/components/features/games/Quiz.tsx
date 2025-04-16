'use client';

import { useState } from 'react';
import { useGamesStore } from '@/store/games';
import { useAuthStore } from '@/store/auth';

export default function Quiz() {
  const currentUser = useAuthStore((state) => state.currentUser);
  const { quiz, addQuiz, submitQuizAnswer } = useGamesStore();
  
  const [newQuestion, setNewQuestion] = useState('');
  const [newAnswer, setNewAnswer] = useState('');
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [selectedQuiz, setSelectedQuiz] = useState<string | null>(null);

  const handleAddQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    await addQuiz({
      question: newQuestion,
      answer: newAnswer,
      createdBy: currentUser.id
    });

    setNewQuestion('');
    setNewAnswer('');
  };

  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !selectedQuiz) return;

    const correct = await submitQuizAnswer(
      selectedQuiz,
      currentAnswer,
      currentUser.id,
      currentUser.name
    );

    if (correct) {
      alert('정답입니다!');
      setCurrentAnswer('');
      setSelectedQuiz(null);
    } else {
      alert('틀렸습니다. 다시 시도해주세요.');
    }
  };

  if (!currentUser) return null;

  return (
    <div className="p-4 space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-4">새 퀴즈 만들기</h2>
        <form onSubmit={handleAddQuiz} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">질문</label>
            <input
              type="text"
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">답변</label>
            <input
              type="text"
              value={newAnswer}
              onChange={(e) => setNewAnswer(e.target.value)}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            퀴즈 추가
          </button>
        </form>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-4">퀴즈 풀기</h2>
        {selectedQuiz ? (
          <form onSubmit={handleSubmitAnswer} className="space-y-4">
            <div>
              <p className="text-lg mb-2">
                {quiz.quizzes.find(q => q.id === selectedQuiz)?.question}
              </p>
              <input
                type="text"
                value={currentAnswer}
                onChange={(e) => setCurrentAnswer(e.target.value)}
                className="w-full px-3 py-2 border rounded"
                placeholder="답변을 입력하세요"
                required
              />
            </div>
            <div className="flex space-x-2">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                제출
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedQuiz(null);
                  setCurrentAnswer('');
                }}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                취소
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-2">
            {quiz.quizzes.map((q) => (
              <button
                key={q.id}
                onClick={() => setSelectedQuiz(q.id)}
                className="w-full p-4 text-left bg-gray-50 rounded hover:bg-gray-100"
              >
                {q.question}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-xl font-bold mb-4">점수</h3>
        <div className="space-y-2">
          {quiz.scores.map((score, index) => (
            <div
              key={index}
              className="flex justify-between items-center"
            >
              <span>{score.userName}</span>
              <span>{score.score}점</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
