'use client';

import { useState, useEffect } from 'react';
import { useGamesStore } from '@/store/games';
import { useAuthStore } from '@/store/auth';

const CARDS = [
  '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼',
  '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼'
];

export default function Memory() {
  const currentUser = useAuthStore((state) => state.currentUser);
  const { memory, submitMemoryScore } = useGamesStore();
  
  const [cards, setCards] = useState<string[]>([]);
  const [flipped, setFlipped] = useState<boolean[]>([]);
  const [matched, setMatched] = useState<boolean[]>([]);
  const [moves, setMoves] = useState(0);
  const [firstChoice, setFirstChoice] = useState<number | null>(null);
  const [secondChoice, setSecondChoice] = useState<number | null>(null);

  useEffect(() => {
    initializeGame();
  }, []);

  const initializeGame = () => {
    const shuffled = [...CARDS].sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setFlipped(new Array(16).fill(false));
    setMatched(new Array(16).fill(false));
    setMoves(0);
    setFirstChoice(null);
    setSecondChoice(null);
  };

  const handleCardClick = async (index: number) => {
    if (!currentUser) return;
    if (flipped[index] || matched[index]) return;
    if (firstChoice === null) {
      setFirstChoice(index);
      setFlipped(prev => {
        const next = [...prev];
        next[index] = true;
        return next;
      });
    } else if (secondChoice === null && index !== firstChoice) {
      setSecondChoice(index);
      setFlipped(prev => {
        const next = [...prev];
        next[index] = true;
        return next;
      });
      setMoves(prev => prev + 1);

      if (cards[firstChoice] === cards[index]) {
        setMatched(prev => {
          const next = [...prev];
          next[firstChoice] = true;
          next[index] = true;
          return next;
        });
        setFirstChoice(null);
        setSecondChoice(null);

        // 게임 완료 체크
        if (matched.filter(Boolean).length === 14) {
          await submitMemoryScore(moves, currentUser.id, currentUser.name);
        }
      } else {
        setTimeout(() => {
          setFlipped(prev => {
            const next = [...prev];
            next[firstChoice] = false;
            next[index] = false;
            return next;
          });
          setFirstChoice(null);
          setSecondChoice(null);
        }, 1000);
      }
    }
  };

  if (!currentUser) return null;

  return (
    <div className="p-4 space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">메모리 게임</h2>
          <div className="space-x-4">
            <span>이동 횟수: {moves}</span>
            <button
              onClick={initializeGame}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              새 게임
            </button>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {cards.map((card, index) => (
            <button
              key={index}
              onClick={() => handleCardClick(index)}
              className={`h-24 text-4xl flex items-center justify-center rounded
                ${flipped[index] || matched[index] ? 'bg-white' : 'bg-gray-200'}`}
              disabled={flipped[index] || matched[index]}
            >
              {(flipped[index] || matched[index]) ? card : '?'}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-xl font-bold mb-4">최고 기록</h3>
        <div className="space-y-2">
          {memory.bestScores.map((score, index) => (
            <div
              key={index}
              className="flex justify-between items-center"
            >
              <span>{score.userName}</span>
              <span>{score.score} 이동</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
