'use client';

import { useState } from 'react';
import { useFoodVoteStore } from '@/store/foodVote';
import { useAuthStore } from '@/store/auth';

export default function FoodVote() {
  const [showNewVoteForm, setShowNewVoteForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [endTime, setEndTime] = useState('');
  const [newOption, setNewOption] = useState({ name: '', description: '' });

  const user = useAuthStore((state) => state.user);
  const { votes, createVote, addOption, removeOption, toggleVote, endVote, deleteVote } =
    useFoodVoteStore();

  if (!user) {
    return <div>투표에 참여하려면 로그인이 필요합니다.</div>;
  }

  const handleCreateVote = (e: React.FormEvent) => {
    e.preventDefault();
    createVote({
      title,
      description,
      endTime,
      createdBy: user.id,
      options: [],
    });
    setTitle('');
    setDescription('');
    setEndTime('');
    setShowNewVoteForm(false);
  };

  const handleAddOption = (voteId: string, e: React.FormEvent) => {
    e.preventDefault();
    addOption(voteId, {
      name: newOption.name,
      description: newOption.description,
      createdBy: user.id,
    });
    setNewOption({ name: '', description: '' });
  };

  const isVoteExpired = (endTime: string) => {
    return new Date(endTime) < new Date();
  };

  return (
    <div className="space-y-6">
      {/* 새 투표 만들기 버튼 */}
      <div className="flex justify-end">
        <button
          onClick={() => setShowNewVoteForm(!showNewVoteForm)}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          {showNewVoteForm ? '취소' : '새 투표 만들기'}
        </button>
      </div>

      {/* 새 투표 폼 */}
      {showNewVoteForm && (
        <form onSubmit={handleCreateVote} className="bg-white p-6 rounded-lg shadow space-y-4">
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
            <label className="block text-sm font-medium mb-1">설명</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border rounded"
              rows={3}
            />
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
            투표 만들기
          </button>
        </form>
      )}

      {/* 투표 목록 */}
      <div className="space-y-6">
        {votes.map((vote) => (
          <div key={vote.id} className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-bold">{vote.title}</h2>
                <p className="text-gray-600">{vote.description}</p>
                <p className="text-sm text-gray-500 mt-1">
                  마감: {new Date(vote.endTime).toLocaleString()}
                </p>
              </div>
              {vote.createdBy === user.id && (
                <button
                  onClick={() => deleteVote(vote.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  삭제
                </button>
              )}
            </div>

            {/* 옵션 목록 */}
            <div className="space-y-4">
              {vote.options.map((option) => (
                <div
                  key={option.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded"
                >
                  <div>
                    <div className="font-medium">{option.name}</div>
                    <div className="text-sm text-gray-600">{option.description}</div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-sm text-gray-500">
                      {option.votes.length}표
                    </div>
                    {vote.isActive && !isVoteExpired(vote.endTime) && (
                      <button
                        onClick={() => toggleVote(vote.id, option.id, user.id)}
                        className={`px-4 py-2 rounded ${
                          option.votes.includes(user.id)
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200 hover:bg-gray-300'
                        }`}
                      >
                        {option.votes.includes(user.id) ? '투표 취소' : '투표하기'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* 새 옵션 추가 폼 */}
            {vote.isActive && !isVoteExpired(vote.endTime) && (
              <form
                onSubmit={(e) => handleAddOption(vote.id, e)}
                className="mt-4 space-y-3"
              >
                <input
                  type="text"
                  value={newOption.name}
                  onChange={(e) =>
                    setNewOption({ ...newOption, name: e.target.value })
                  }
                  placeholder="메뉴 이름"
                  className="w-full px-3 py-2 border rounded"
                  required
                />
                <input
                  type="text"
                  value={newOption.description}
                  onChange={(e) =>
                    setNewOption({ ...newOption, description: e.target.value })
                  }
                  placeholder="메뉴 설명"
                  className="w-full px-3 py-2 border rounded"
                />
                <button
                  type="submit"
                  className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  메뉴 추가하기
                </button>
              </form>
            )}

            {/* 투표 종료 버튼 */}
            {vote.isActive && vote.createdBy === user.id && (
              <button
                onClick={() => endVote(vote.id)}
                className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                투표 종료하기
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
