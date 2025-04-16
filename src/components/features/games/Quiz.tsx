'use client';

import { useState } from 'react';
import { useQuizStore } from '@/store/quiz';
import { useAuthStore } from '@/store/auth';

export default function Quiz() {
  const [showAddQuiz, setShowAddQuiz] = useState(false);
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [error, setError] = useState('');

  const currentUser = useAuthStore((state) => state.currentUser);
  const { quizzes, attempts, addQuiz, submitAnswer } = useQuizStore();

  if (!currentUser) {
    return <div>퀴즈에 참여하려면 로그인이 필요합니다.</div>;
  }

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleAddQuiz = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || options.some(opt => !opt.trim())) {
      setError('모든 필드를 입력해주세요.');
      return;
    }
    if (!options.includes(correctAnswer)) {
      setError('정답은 보기 중 하나여야 합니다.');
      return;
    }

    addQuiz({
      question,
      options,
      correctAnswer,
      createdBy: currentUser.id
    });

    setShowAddQuiz(false);
    setQuestion('');
    setOptions(['', '', '', '']);
    setCorrectAnswer('');
    setError('');
  };

  const handleSubmitAnswer = (quizId: string, answer: string) => {
    submitAnswer(quizId, currentUser.id, answer);
    setSelectedAnswer('');
  };

  const getQuizStatus = (quizId: string) => {
    const attempt = attempts.find(
      a => a.quizId === quizId && a.userId === currentUser.id
    );
    return attempt;
  };

  return (
    <div className="space-y-6">
      {/* 퀴즈 추가 버튼 */}
      <div className="flex justify-end">
        <button
          onClick={() => setShowAddQuiz(!showAddQuiz)}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          {showAddQuiz ? '취소' : '새 퀴즈 만들기'}
        </button>
      </div>

      {/* 퀴즈 추가 폼 */}
      {showAddQuiz && (
        <form onSubmit={handleAddQuiz} className="bg-white p-6 rounded-lg shadow space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">질문</label>
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>

          {options.map((option, index) => (
            <div key={index}>
              <label className="block text-sm font-medium mb-1">
                보기 {index + 1}
              </label>
              <input
                type="text"
                value={option}
                onChange={(e) => handleOptionChange(index, e.target.value)}
                className="w-full px-3 py-2 border rounded"
                required
              />
            </div>
          ))}

          <div>
            <label className="block text-sm font-medium mb-1">정답</label>
            <select
              value={correctAnswer}
              onChange={(e) => setCorrectAnswer(e.target.value)}
              className="w-full px-3 py-2 border rounded"
              required
            >
              <option value="">정답 선택</option>
              {options.map((option, index) => (
                option && (
                  <option key={index} value={option}>
                    {option}
                  </option>
                )
              ))}
            </select>
          </div>

          {error && <div className="text-red-500 text-sm">{error}</div>}

          <button
            type="submit"
            className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            퀴즈 만들기
          </button>
        </form>
      )}

      {/* 퀴즈 목록 */}
      <div className="space-y-4">
        {quizzes.map((quiz) => {
          const status = getQuizStatus(quiz.id);
          return (
            <div key={quiz.id} className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-bold mb-4">{quiz.question}</h3>
              
              {status ? (
                <div className="space-y-2">
                  <div className={`font-medium ${status.isCorrect ? 'text-green-500' : 'text-red-500'}`}>
                    {status.isCorrect ? '정답입니다!' : '틀렸습니다.'}
                  </div>
                  <div className="text-sm text-gray-600">
                    제출한 답: {status.answer}
                  </div>
                  {!status.isCorrect && (
                    <div className="text-sm text-gray-600">
                      정답: {quiz.correctAnswer}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  {quiz.options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => handleSubmitAnswer(quiz.id, option)}
                      className={`w-full p-2 text-left rounded ${
                        selectedAnswer === option
                          ? 'bg-blue-100 border-blue-500'
                          : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
