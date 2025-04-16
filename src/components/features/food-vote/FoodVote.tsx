'use client';

import { useState } from 'react';
import { useFoodVoteStore, type FoodVote, type FoodVoteOption, type Vote } from '@/store/foodVote';
import { useAuthStore } from '@/store/auth';

export default function FoodVote() {
  const currentUser = useAuthStore(state => state.currentUser);
  const { votes = [], createVote, submitVote, deleteVote, updateVote } = useFoodVoteStore();
  
  const [title, setTitle] = useState('');
  const [options, setOptions] = useState<string[]>(['', '']);
  const [endTime, setEndTime] = useState('');

  const [editingVote, setEditingVote] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editOptions, setEditOptions] = useState<string[]>([]);
  const [editEndTime, setEditEndTime] = useState('');

  const handleCreateVote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    const filteredOptions = options.filter(option => option.trim() !== '');
    if (filteredOptions.length < 2) {
      alert('최소 2개의 옵션이 필요합니다.');
      return;
    }

    try {
      await createVote({
        title,
        options: filteredOptions.map(text => ({
          id: Date.now().toString(),
          text,
          votes: []
        })),
        endTime,
        createdBy: currentUser.id,
        createdByName: currentUser.name
      });

      setTitle('');
      setOptions(['', '']);
      setEndTime('');
    } catch (error) {
      alert('투표 생성 중 오류가 발생했습니다.');
    }
  };

  const handleVote = async (voteId: string, optionId: string) => {
    if (!currentUser) return;
    
    try {
      await submitVote(voteId, optionId, currentUser.id, currentUser.name);
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert('투표 중 오류가 발생했습니다.');
      }
    }
  };

  const handleDelete = async (voteId: string) => {
    if (!currentUser) return;

    try {
      const confirmed = window.confirm('정말로 이 투표를 삭제하시겠습니까?');
      if (confirmed) {
        await deleteVote(voteId);
      }
    } catch (error) {
      console.error('Error deleting vote:', error);
      alert('투표 삭제 중 오류가 발생했습니다.');
    }
  };

  const handleStartEdit = (vote: FoodVote) => {
    setEditingVote(vote.id);
    setEditTitle(vote.title);
    setEditOptions(vote.options.map((opt: FoodVoteOption) => opt.text));
    setEditEndTime(vote.endTime);
  };

  const handleCancelEdit = () => {
    setEditingVote(null);
    setEditTitle('');
    setEditOptions([]);
    setEditEndTime('');
  };

  const handleSaveEdit = async (voteId: string) => {
    if (!currentUser) return;

    const filteredOptions = editOptions.filter(option => option.trim() !== '');
    if (filteredOptions.length < 2) {
      alert('최소 2개의 옵션이 필요합니다.');
      return;
    }

    try {
      const vote = votes.find(v => v.id === voteId);
      if (!vote) return;

      const updatedOptions = filteredOptions.map((text, index) => ({
        id: vote.options[index]?.id || `${Date.now()}-${index}`,
        text,
        votes: vote.options[index]?.votes || []
      }));

      await updateVote(voteId, {
        title: editTitle,
        endTime: editEndTime,
        options: updatedOptions
      });

      handleCancelEdit();
    } catch (error) {
      console.error('Error updating vote:', error);
      alert('투표 수정 중 오류가 발생했습니다.');
    }
  };

  const activeVotes = votes?.filter(vote => new Date(vote.endTime) > new Date()) || [];
  const completedVotes = votes?.filter(vote => new Date(vote.endTime) <= new Date()) || [];

  return (
    <div className="p-4 pb-20 md:pb-4 space-y-6">
      {/* 새 투표 생성 폼 */}
      <div className="bg-white p-4 md:p-6 rounded-lg shadow">
        <h2 className="text-xl md:text-2xl font-bold mb-4">새 투표 만들기</h2>
        <form onSubmit={handleCreateVote} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">제목</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 text-base border rounded-lg"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">옵션</label>
            {options.map((option, index) => (
              <input
                key={index}
                type="text"
                value={option}
                onChange={(e) => {
                  const newOptions = [...options];
                  newOptions[index] = e.target.value;
                  setOptions(newOptions);
                }}
                className="w-full px-4 py-3 border rounded-lg mb-2"
                placeholder={`옵션 ${index + 1}`}
                required
              />
            ))}
            {options.length < 5 && (
              <button
                type="button"
                onClick={() => setOptions([...options, ''])}
                className="text-blue-500 hover:text-blue-600"
              >
                + 옵션 추가
              </button>
            )}
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
            className="w-full px-4 py-4 md:py-3 text-base bg-blue-500 text-white rounded-lg hover:bg-blue-600 active:bg-blue-700"
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
              {editingVote === vote.id ? (
                <div className="space-y-4">
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full px-4 py-2 border rounded"
                    placeholder="투표 제목"
                  />
                  
                  {editOptions.map((option, index) => (
                    <input
                      key={index}
                      type="text"
                      value={option}
                      onChange={(e) => {
                        const newOptions = [...editOptions];
                        newOptions[index] = e.target.value;
                        setEditOptions(newOptions);
                      }}
                      className="w-full px-4 py-2 border rounded"
                      placeholder={`옵션 ${index + 1}`}
                    />
                  ))}
                  
                  {editOptions.length < 5 && (
                    <button
                      type="button"
                      onClick={() => setEditOptions([...editOptions, ''])}
                      className="text-blue-500 hover:text-blue-600"
                    >
                      + 옵션 추가
                    </button>
                  )}

                  <input
                    type="datetime-local"
                    value={editEndTime}
                    onChange={(e) => setEditEndTime(e.target.value)}
                    className="w-full px-3 py-2 border rounded"
                  />

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSaveEdit(vote.id)}
                      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      저장
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                    >
                      취소
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold">{vote.title}</h3>
                    {vote.createdBy === currentUser?.id && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleStartEdit(vote)}
                          className="text-blue-500 hover:text-blue-600"
                        >
                          수정
                        </button>
                        <button
                          onClick={() => handleDelete(vote.id)}
                          className="text-red-500 hover:text-red-600"
                        >
                          삭제
                        </button>
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mb-2">
                    생성자: {vote.createdByName}<br />
                    마감: {new Date(vote.endTime).toLocaleString()}
                  </p>
                  <div className="space-y-2">
                    {vote.options.map((option) => {
                      const voteCount = option.votes?.length || 0;
                      const totalVotes = vote.options.reduce((sum, opt) => sum + (opt.votes?.length || 0), 0);
                      const percentage = totalVotes === 0 ? 0 : (voteCount / totalVotes) * 100;
                      const hasVoted = option.votes?.some(v => v.userId === currentUser?.id) || false;

                      return (
                        <div key={option.id} className="space-y-1">
                          <div className="flex justify-between">
                            <span>{option.text}</span>
                            <span>{voteCount}표 ({percentage.toFixed(1)}%)</span>
                          </div>
                          <div className="relative pt-1">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${percentage}%` }}
                              />
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
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 완료된 투표 */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-4">완료된 투표</h2>
        <div className="space-y-4">
          {completedVotes.map((vote) => (
            <div key={vote.id} className="border p-4 rounded opacity-75">
              <h3 className="font-bold">{vote.title}</h3>
              <p className="text-sm text-gray-500 mb-2">
                생성자: {vote.createdByName}<br />
                마감: {new Date(vote.endTime).toLocaleString()}
              </p>
              <div className="space-y-2">
                {vote.options.map((option) => {
                  const voteCount = option.votes?.length || 0;
                  const totalVotes = vote.options.reduce((sum, opt) => sum + (opt.votes?.length || 0), 0);
                  const percentage = totalVotes === 0 ? 0 : (voteCount / totalVotes) * 100;

                  return (
                    <div key={option.id} className="space-y-1">
                      <div className="flex justify-between">
                        <span>{option.text}</span>
                        <span>{voteCount}표 ({percentage.toFixed(1)}%)</span>
                      </div>
                      <div className="relative pt-1">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-gray-600 h-2 rounded-full"
                            style={{ width: `${percentage}%` }}
                          />
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
