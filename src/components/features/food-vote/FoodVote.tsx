'use client';

import { useState } from 'react';
import { useFoodVoteStore } from '@/store/foodVote';
import { useAuthStore } from '@/store/auth';

export default function FoodVote() {
  const [title, setTitle] = useState('');
  const [options, setOptions] = useState<string[]>([]);
  const [newOption, setNewOption] = useState('');
  const [endTime, setEndTime] = useState('');

  const currentUser = useAuthStore((state) => state.currentUser);
  const { votes, userVotes, createVote, submitVote, closeVote } = useFoodVoteStore();

  const handleAddOption = () => {
    if (newOption.trim() && !options.includes(newOption.trim())) {
      setOptions([...options, newOption.trim()]);
      setNewOption('');
    }
  };

  const handleCreateVote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    createVote({
      title,
      options,
      createdBy: currentUser.id,
      endTime: new Date(endTime).toISOString()
    });

    setTitle('');
    setOptions([]);
    setEndTime('');
  };

  const handleVote = (voteId: string, option: string) => {
    if (!currentUser) return;
    submitVote(voteId, currentUser.id, option);
  };

  if (!currentUser) return null;

  return (
    <div className="space-y-6">
      {/* 투표 생성 폼 */}
      <form onSubmit={handleCreateVote} className="bg-white p-6 rounded-lg shadow space-y-4">
        <h2 className="text-xl font-bold mb-4">새 투표 만들기</h2>
        
        <div>
          <label className="block text-sm font-medium mb-1">제목</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border rounded"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">투표 마감 시간</label>
          <input
            type="datetime-local"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="w-full px-3 py-2 border rounded"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">선택지</label>
          <div className="flex space-x-2">
            <input
              type="text"
              value={newOption}
              onChange={(e) => setNewOption(e.target.value)}
              className="flex-1 px-3 py-2 border rounded"
              placeholder="선택지 입력"
            />
            <button
              type="button"
              onClick={handleAddOption}
              className="px-4 py-2 bg-gray-100 rounded hover:bg-gray-200"
            >
              추가
            </button>
          </div>
          
          {options.length > 0 && (
            <div className="mt-2 space-y-2">
              {options.map((option, index) => (
                <div key={index} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                  <span>{option}</span>
                  <button
                    type="button"
                    onClick={() => setOptions(options.filter((_, i) => i !== index))}
                    className="text-red-500 hover:text-red-600"
                  >
                    삭제
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          type="submit"
          className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          disabled={options.length < 2}
        >
          투표 만들기
        </button>
      </form>

      {/* 진행 중인 투표 목록 */}
      <div className="space-y-4">
        {votes
          .filter(vote => vote.isActive)
          .map(vote => {
            const totalVotes = userVotes.filter(v => v.voteId === vote.id).length;
            const isExpired = new Date(vote.endTime) < new Date();
            const userVote = userVotes.find(
              v => v.voteId === vote.id && v.userId === currentUser.id
            );

            return (
              <div key={vote.id} className="bg-white p-6 rounded-lg shadow">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-bold">{vote.title}</h3>
                  <div className="text-sm text-gray-500">
                    마감: {new Date(vote.endTime).toLocaleString()}
                  </div>
                </div>

                <div className="space-y-2">
                  {vote.options.map((option) => {
                    const optionVotes = userVotes.filter(
                      v => v.voteId === vote.id && v.option === option
                    ).length;
                    const percentage = totalVotes ? (optionVotes / totalVotes) * 100 : 0;

                    return (
                      <div key={option} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                        <span>{option}</span>
                        <div className="text-sm text-gray-500">
                          {percentage.toFixed(2)}%
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}
