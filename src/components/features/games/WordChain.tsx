'use client';

import { useState, useRef, useEffect } from 'react';
import { useWordChainStore } from '@/store/wordChain';
import { useAuthStore } from '@/store/auth';

export default function WordChain() {
  const [word, setWord] = useState('');
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const user = useAuthStore(state => state.user);
  const {
    players,
    words,
    currentTurn,
    isGameStarted,
    addPlayer,
    removePlayer,
    addWord,
    startGame,
    endGame,
    resetGame
  } = useWordChainStore();

  useEffect(() => {
    if (user && !players.find(p => p.id === user.id)) {
      addPlayer({ id: user.id, name: user.name });
    }
  }, [user, players, addPlayer]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || currentTurn !== user.id) return;

    const trimmedWord = word.trim();
    if (!trimmedWord) {
      setError('단어를 입력해주세요');
      return;
    }

    if (addWord(trimmedWord, user.id)) {
      setWord('');
      setError('');
    } else {
      setError('올바른 단어를 입력해주세요');
    }
  };

  if (!user) {
    return <div>게임에 참여하려면 로그인이 필요합니다.</div>;
  }

  return (
    <div className="space-y-6">
      {/* 게임 상태 */}
      <div className="flex items-center justify-between">
        <div className="text-lg font-bold">
          {isGameStarted ? '게임 진행 중' : '대기 중'}
        </div>
        <div className="space-x-2">
          {!isGameStarted && players.length >= 2 && (
            <button
              onClick={startGame}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              게임 시작
            </button>
          )}
          {isGameStarted && (
            <button
              onClick={endGame}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              게임 종료
            </button>
          )}
        </div>
      </div>

      {/* 플레이어 목록 */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {players.map((player) => (
          <div
            key={player.id}
            className={`p-4 rounded-lg ${
              currentTurn === player.id
                ? 'bg-yellow-100 border-2 border-yellow-400'
                : 'bg-gray-100'
            }`}
          >
            <div className="font-medium">{player.name}</div>
            <div className="text-sm text-gray-600">점수: {player.score}</div>
          </div>
        ))}
      </div>

      {/* 단어 히스토리 */}
      <div className="bg-gray-50 p-4 rounded-lg max-h-60 overflow-y-auto">
        <div className="space-y-2">
          {words.map((wordItem, index) => {
            const player = players.find(p => p.id === wordItem.playerId);
            return (
              <div key={index} className="flex items-center space-x-2">
                <span className="text-gray-500">{player?.name}:</span>
                <span className="font-medium">{wordItem.word}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 입력 폼 */}
      {isGameStarted && (
        <form onSubmit={handleSubmit} className="space-y-2">
          <div className="flex space-x-2">
            <input
              ref={inputRef}
              type="text"
              value={word}
              onChange={(e) => setWord(e.target.value)}
              placeholder={
                currentTurn === user.id
                  ? '단어를 입력하세요...'
                  : '다른 플레이어의 차례입니다'
              }
              disabled={currentTurn !== user.id}
              className="flex-1 px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={currentTurn !== user.id}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300"
            >
              입력
            </button>
          </div>
          {error && <div className="text-red-500 text-sm">{error}</div>}
        </form>
      )}

      {/* 게임 규칙 */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="font-bold mb-2">게임 규칙</h3>
        <ul className="list-disc list-inside text-sm space-y-1">
          <li>이전 단어의 마지막 글자로 시작하는 단어를 입력하세요</li>
          <li>단어의 길이만큼 점수를 획득합니다</li>
          <li>게임을 시작하려면 2명 이상의 플레이어가 필요합니다</li>
        </ul>
      </div>
    </div>
  );
}
