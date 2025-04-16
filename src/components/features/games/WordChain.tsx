'use client';

import { useState } from 'react';
import { useGamesStore } from '@/store/games';
import { useAuthStore } from '@/store/auth';

export default function WordChain() {
  const [input, setInput] = useState('');
  const currentUser = useAuthStore((state) => state.currentUser);
  const { wordChain, submitWord, resetWordChain } = useGamesStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    const success = await submitWord(
      input.trim(),
      currentUser.id,
      currentUser.name
    );

    if (success) {
      setInput('');
    } else {
      alert('잘못된 단어입니다. 다시 시도해주세요.');
    }
  };

  if (!currentUser) return null;

  return (
    <div className="p-4 space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-4">끝말잇기</h2>
        <div className="mb-4">
          <p className="text-lg">현재 단어: <span className="font-bold">{wordChain.currentWord}</span></p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full px-3 py-2 border rounded"
            placeholder="다음 단어를 입력하세요"
            required
          />
          <div className="flex space-x-2">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              제출
            </button>
            <button
              type="button"
              onClick={resetWordChain}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              게임 리셋
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-xl font-bold mb-4">사용된 단어들</h3>
        <div className="flex flex-wrap gap-2">
          {wordChain.usedWords.map((word, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-gray-100 rounded"
            >
              {word}
            </span>
          ))}
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-xl font-bold mb-4">점수</h3>
        <div className="space-y-2">
          {wordChain.scores.map((score, index) => (
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
