'use client';

import { useState } from 'react';
import { useQuizStore } from '@/store/quiz';
import { useAuthStore } from '@/store/auth';

export default function Quiz() {
  const [newQuestion, setNewQuestion] = useState('');
  const [newAnswer, setNewAnswer] = useState('');
  const [newCategory, setNewCategory] = useState<'취미' | '음식' | '추억' | '기타'>('기타');
  const [userAnswer, setUserAnswer] = useState('');
  const [showAnswer, setShowAnswer] = useState(false);

  const user = useAuthStore(state => state.user);
  const {
    questions,
    answers,
    currentQuestionIndex,
    isPlaying,
    addQuestion,
    removeQuestion,
    submitAnswer,
    startQuiz,
    endQuiz,
    nextQuestion,
  } = useQuizStore();

  const handleAddQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newQuestion.trim() || !newAnswer.trim()) return;

    addQuestion({
      question: newQuestion.trim(),
      answer: newAnswer.trim(),
      category: newCategory,
      createdBy: user.id,
    });

    setNewQuestion('');
    setNewAnswer('');
    setNewCategory('기타');
  };

  const handleSubmitAnswer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !userAnswer.trim()) return;

    const currentQuestion = questions[currentQuestionIndex];
    submitAnswer(currentQuestion.id, user.id, userAnswer.trim());
    setShowAnswer(true);
  };

  const handleNextQuestion = () => {
    setUserAnswer('');
    setShowAnswer(false);
    if (currentQuestionIndex < questions.length - 1) {
      nextQuestion();
    } else {
      endQuiz();
    }
  };

  if (!user) {
    return <div>퀴즈에 참여하려면 로그인이 필요합니다.</div>;
  }

  return (
    <div className="space-y-8">
      {/* 퀴즈 문제 등록 폼 */}
      {!isPlaying && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-bold mb-4">새로운 퀴즈 등록하기</h3>
          <form onSubmit={handleAddQuestion} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">카테고리</label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as any)}
                className="w-full px-3 py-2 border rounded"
              >
                <option value="취미">취미</option>
                <option value="음식">음식</option>
                <option value="추억">추억</option>
                <option value="기타">기타</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">질문</label>
              <input
                type="text"
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                className="w-full px-3 py-2 border rounded"
                placeholder="질문을 입력하세요"
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
                placeholder="답변을 입력하세요"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              문제 등록하기
            </button>
          </form>
        </div>
      )}

      {/* 퀴즈 목록 및 시작 버튼 */}
      {!isPlaying && (
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">등록된 퀴즈 목록</h3>
            {questions.length > 0 && (
              <button
                onClick={startQuiz}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                퀴즈 시작하기
              </button>
            )}
          </div>
          <div className="space-y-2">
            {questions.map((q) => (
              <div
                key={q.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded"
              >
                <div>
                  <span className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded mr-2">
                    {q.category}
                  </span>
                  {q.question}
                </div>
                {q.createdBy === user.id && (
                  <button
                    onClick={() => removeQuestion(q.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    삭제
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 퀴즈 진행 화면 */}
      {isPlaying && questions[currentQuestionIndex] && (
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-center mb-8">
            <div className="text-sm text-gray-500 mb-2">
              {currentQuestionIndex + 1} / {questions.length}
            </div>
            <div className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full mb-4">
              {questions[currentQuestionIndex].category}
            </div>
            <h2 className="text-xl font-bold">
              {questions[currentQuestionIndex].question}
            </h2>
          </div>

          {!showAnswer ? (
            <form onSubmit={handleSubmitAnswer} className="space-y-4">
              <input
                type="text"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                className="w-full px-4 py-2 border rounded"
                placeholder="답변을 입력하세요"
                required
              />
              <button
                type="submit"
                className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                답변 제출하기
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded">
                <div className="font-medium mb-2">정답:</div>
                <div className="text-lg">{questions[currentQuestionIndex].answer}</div>
              </div>
              <button
                onClick={handleNextQuestion}
                className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                {currentQuestionIndex < questions.length - 1 ? '다음 문제' : '퀴즈 종료'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* 퀴즈 결과 */}
      {isPlaying && showAnswer && (
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="font-bold mb-2">현재 점수</h3>
          <div className="text-2xl font-bold">
            {answers.filter((a) => a.isCorrect).length} / {answers.length}
          </div>
        </div>
      )}
    </div>
  );
}
