'use client';

import { useState } from 'react';
import { useFoodVoteStore } from '@/store/foodVote';
import { useAuthStore } from '@/store/auth';

export default function FoodVote() {
  const currentUser = useAuthStore(state => state.currentUser);
  const { votes, createVote, submitVote, deleteVote } = useFoodVoteStore();
  
  const [title, setTitle] = useState('');
  const [options, setOptions] = useState<string[]>(['']);
  const [endTime, setEndTime] = useState('');

  const handleAddOption = () => {
    setOptions([...options, '']);
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleCreateVote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    const filteredOptions = options.filter(option => option.trim() !== '');
    if (filteredOptions.length < 2) {
      alert('최소 2개의 옵션이 필요합니다.');
      return;
    }

    await createVote({
      title,
      options: filteredOptions.map(text => ({
        id: Date.now().toString(),
        text,
        votes: []
      })),
      endTime,
      createdBy: currentUser.id
    });

    setTitle('');
    setOptions(['']);
    setEndTime('');
  };

  const handleVote = async (voteId: string, optionId: string) => {
    if (!currentUser) return;
    await submitVote(voteId, optionId, currentUser.id);
  };

  const handleDelete = async (voteId: string) => {
    if (!currentUser) return;
    await deleteVote(voteId);
  };

  if (!currentUser) return null;

  const activeVotes = votes.filter(vote => new Date(vote.endTime) > new Date());
  const completedVotes = votes.filter(vote => new Date(vote.endTime) <= new Date());

  return (
    <div className="p-4 space-y-6">
      {/* 새 투표 생성 폼 */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-4">새 투표 만들기</h2>
        <form onSubmit={handleCreateVote} className="space-y-4">
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
            <label className="block text-sm font-medium mb-1">옵션</label>
            {options.map((option, index) => (
              <input
                key={index}
                type="text"
                value={option}
                onChange={(e) => handleOptionChange(index, e.target.value)}
                className="w-full px-3 py-2 border rounded mb-2"
                placeholder={`옵션 ${index + 1}`}
                required
              />
            ))}
            <button
              type="button"
              onClick={handleAddOption}
              className="text-blue-500 hover:text-blue-600"
            >
              + 옵션 추가
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">마감 시간</label>
            <input
              type="datetime-local"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            투표 생성
          </button>
        </form>
      </div>

      {/* 진행 중인 투표 */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-4">진행 중인 투표</h2>
        <div className="space-y-4">
          {activeVotes.map((vote) => (
            <div key={vote.id} className="border p-4 rounded">
              <div className="flex justify-between items-start">
                <h3 className="font-bold">{vote.title}</h3>
                {vote.createdBy === currentUser.id && (
                  <button
                    onClick={() => handleDelete(vote.id)}
                    className="text-red-500 hover:text-red-600"
                  >
                    삭제
                  </button>
                )}
              </div>
              <p className="text-sm text-gray-500 mb-2">
                마감: {new Date(vote.endTime).toLocaleString()}
              </p>
              <div className="space-y-2">
                {vote.options.map((option) => {
                  const voteCount = option.votes.length;
                  const totalVotes = vote.options.reduce((sum, opt) => sum + opt.votes.length, 0);
                  const percentage = totalVotes === 0 ? 0 : (voteCount / totalVotes) * 100;
                  const hasVoted = option.votes.some(v => v.userId === currentUser.id);

                  return (
                    <div key={option.id} className="space-y-1">
                      <div className="flex justify-between">
                        <span>{option.text}</span>
                        <span>{voteCount}표 ({percentage.toFixed(1)}%)</span>
                      </div>
                      <div className="relative pt-1">
                        <div className="flex mb-2 items-center justify-between">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      </div>
                      {!hasVoted && (
                        <button
                          onClick={() => handleVote(vote.id, option.id)}
                          className="text-blue-500 hover:text-blue-600 text-sm"
                        >
                          투표하기
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 완료된 투표 */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-4">완료된 투표</h2>
        <div className="space-y-4">
          {completedVotes.map((vote) => (
            <div key={vote.id} className="border p-4 rounded">
              <h3 className="font-bold">{vote.title}</h3>
              <p className="text-sm text-gray-500 mb-2">
                마감: {new Date(vote.endTime).toLocaleString()}
              </p>
              <div className="space-y-2">
                {vote.options.map((option) => {
                  const voteCount = option.votes.length;
                  const totalVotes = vote.options.reduce((sum, opt) => sum + opt.votes.length, 0);
                  const percentage = totalVotes === 0 ? 0 : (voteCount / totalVotes) * 100;

                  return (
                    <div key={option.id} className="space-y-1">
                      <div className="flex justify-between">
                        <span>{option.text}</span>
                        <span>{voteCount}표 ({percentage.toFixed(1)}%)</span>
                      </div>
                      <div className="relative pt-1">
                        <div className="flex mb-2 items-center justify-between">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
