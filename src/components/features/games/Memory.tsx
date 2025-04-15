'use client';

import { useEffect } from 'react';
import { useMemoryStore } from '@/store/memory';
import { useAuthStore } from '@/store/auth';

export default function Memory() {
  const {
    cards,
    players,
    currentPlayer,
    isPlaying,
    moves,
    initializeGame,
    flipCard,
    resetGame,
  } = useMemoryStore();

  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    return () => {
      resetGame();
    };
  }, [resetGame]);

  if (!user) {
    return <div>게임에 참여하려면 로그인이 필요합니다.</div>;
  }

  const handleStartGame = () => {
    initializeGame([{ id: user.id, name: user.name, score: 0 }]);
  };

  const allMatched = cards.every((card) => card.isMatched);

  return (
    <div className="space-y-6">
      {!isPlaying ? (
        <div className="text-center">
          <button
            onClick={handleStartGame}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            게임 시작하기
          </button>
        </div>
      ) : (
        <>
          {/* 게임 정보 */}
          <div className="flex justify-between items-center">
            <div className="space-y-1">
              <div className="text-sm text-gray-600">현재 플레이어</div>
              <div className="font-bold">
                {players.find((p) => p.id === currentPlayer)?.name}
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-gray-600">시도 횟수</div>
              <div className="font-bold text-center">{moves}</div>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-gray-600">점수</div>
              <div className="font-bold">
                {players.find((p) => p.id === user.id)?.score}
              </div>
            </div>
          </div>

          {/* 카드 그리드 */}
          <div className="grid grid-cols-4 gap-4">
            {cards.map((card) => (
              <button
                key={card.id}
                onClick={() => flipCard(card.id)}
                className={`aspect-square text-4xl flex items-center justify-center rounded-lg transition-all duration-300 transform ${
                  card.isFlipped || card.isMatched
                    ? 'bg-white rotate-0'
                    : 'bg-blue-500 rotate-180'
                }`}
                disabled={card.isMatched}
              >
                <span
                  className={`transition-all duration-300 transform ${
                    card.isFlipped || card.isMatched ? 'rotate-0' : 'rotate-180'
                  }`}
                >
                  {card.isFlipped || card.isMatched ? card.emoji : ''}
                </span>
              </button>
            ))}
          </div>

          {/* 게임 종료 */}
          {allMatched && (
            <div className="text-center space-y-4">
              <div className="text-2xl font-bold">게임 종료!</div>
              <div className="text-gray-600">
                총 {moves}번 시도해서 완성했습니다!
              </div>
              <button
                onClick={handleStartGame}
                className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                다시 시작하기
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
