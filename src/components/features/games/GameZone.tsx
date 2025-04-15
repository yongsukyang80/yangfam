'use client';

import { useState } from 'react';
import { useAuthStore } from '@/store/auth';
import WordChain from './WordChain';
import Quiz from './Quiz';
import Memory from './Memory';

type GameType = 'quiz' | 'memory' | 'word-chain';

interface Game {
  id: GameType;
  title: string;
  description: string;
  icon: string;
}

const GAMES: Game[] = [
  {
    id: 'quiz',
    title: '가족 퀴즈',
    description: '우리 가족에 대해 얼마나 알고 있나요?',
    icon: '❓'
  },
  {
    id: 'memory',
    title: '카드 매칭',
    description: '가족 사진으로 만드는 메모리 게임',
    icon: '🎴'
  },
  {
    id: 'word-chain',
    title: '끝말잇기',
    description: '가족과 함께하는 끝말잇기',
    icon: '💭'
  }
];

export default function GameZone() {
  const [selectedGame, setSelectedGame] = useState<GameType | null>(null);
  const user = useAuthStore(state => state.user);

  if (!user) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <p className="text-gray-500">게임을 시작하려면 로그인이 필요합니다.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">가족 게임존</h1>
      
      {!selectedGame ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {GAMES.map((game) => (
            <button
              key={game.id}
              onClick={() => setSelectedGame(game.id)}
              className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="text-4xl mb-4">{game.icon}</div>
              <h2 className="text-xl font-bold mb-2">{game.title}</h2>
              <p className="text-gray-600">{game.description}</p>
            </button>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">
              {GAMES.find(game => game.id === selectedGame)?.title}
            </h2>
            <button
              onClick={() => setSelectedGame(null)}
              className="text-gray-500 hover:text-gray-700"
            >
              돌아가기
            </button>
          </div>
          
          {/* 게임 컴포넌트들은 여기에 추가될 예정 */}
          {selectedGame === 'quiz' && <Quiz />}
          {selectedGame === 'memory' && <Memory />}
          {selectedGame === 'word-chain' && <WordChain />}
        </div>
      )}
    </div>
  );
}
