'use client';

import { useState } from 'react';
import { useMissionStore } from '@/store/mission';
import { useAuthStore } from '@/store/auth';

export default function Mission() {
  const [showNewMissionForm, setShowNewMissionForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [points, setPoints] = useState(10);
  const [assignedTo, setAssignedTo] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [proof, setProof] = useState('');

  const currentUser = useAuthStore((state) => state.currentUser);
  const {
    missions,
    userPoints,
    createMission,
    completeMission,
    verifyMission,
    deleteMission,
    getUserPoints,
  } = useMissionStore();

  if (!currentUser) {
    return <div>미션에 참여하려면 로그인이 필요합니다.</div>;
  }

  const handleCreateMission = (e: React.FormEvent) => {
    e.preventDefault();
    createMission({
      title,
      description,
      points,
      assignedTo,
      assignedBy: currentUser.id,
      dueDate,
    });
    setShowNewMissionForm(false);
    setTitle('');
    setDescription('');
    setPoints(10);
    setAssignedTo('');
    setDueDate('');
  };

  const handleCompleteMission = (missionId: string) => {
    completeMission(missionId, proof);
    setProof('');
  };

  const isExpired = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* 포인트 현황 */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <h2 className="text-lg font-bold mb-2">나의 포인트</h2>
        <div className="text-2xl font-bold text-blue-600">
          {getUserPoints(currentUser.id)} 포인트
        </div>
      </div>

      {/* 새 미션 만들기 버튼 */}
      <div className="flex justify-end">
        <button
          onClick={() => setShowNewMissionForm(!showNewMissionForm)}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          {showNewMissionForm ? '취소' : '새 미션 만들기'}
        </button>
      </div>

      {/* 새 미션 폼 */}
      {showNewMissionForm && (
        <form onSubmit={handleCreateMission} className="bg-white p-6 rounded-lg shadow space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">미션 제목</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">미션 설명</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border rounded"
              rows={3}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">포인트</label>
            <input
              type="number"
              value={points}
              onChange={(e) => setPoints(Number(e.target.value))}
              min={1}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">담당자</label>
            <input
              type="text"
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">마감일</label>
            <input
              type="datetime-local"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            미션 만들기
          </button>
        </form>
      )}

      {/* 미션 목록 */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold">진행 중인 미션</h2>
        {missions
          .filter((mission) => mission.status === 'pending')
          .map((mission) => (
            <div
              key={mission.id}
              className={`bg-white p-6 rounded-lg shadow ${
                isExpired(mission.dueDate) ? 'border-red-500 border-2' : ''
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold">{mission.title}</h3>
                  <p className="text-gray-600">{mission.description}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    마감: {new Date(mission.dueDate).toLocaleString()}
                  </p>
                  <p className="text-blue-500 font-bold mt-1">
                    {mission.points} 포인트
                  </p>
                </div>
                {mission.assignedBy === currentUser.id && (
                  <button
                    onClick={() => deleteMission(mission.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    삭제
                  </button>
                )}
              </div>

              {mission.assignedTo === currentUser.id && (
                <div className="space-y-2">
                  <textarea
                    value={proof}
                    onChange={(e) => setProof(e.target.value)}
                    placeholder="미션 완료 증거를 입력하세요"
                    className="w-full px-3 py-2 border rounded"
                    rows={2}
                  />
                  <button
                    onClick={() => handleCompleteMission(mission.id)}
                    className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                  >
                    미션 완료하기
                  </button>
                </div>
              )}
            </div>
          ))}
      </div>

      {/* 완료된 미션 */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold">완료된 미션</h2>
        {missions
          .filter((mission) => mission.status === 'completed')
          .map((mission) => (
            <div key={mission.id} className="bg-white p-6 rounded-lg shadow">
              <div className="mb-4">
                <h3 className="text-lg font-bold">{mission.title}</h3>
                <p className="text-gray-600">{mission.description}</p>
                <p className="text-sm text-gray-500 mt-1">
                  완료일: {new Date(mission.completedAt!).toLocaleString()}
                </p>
                <p className="text-blue-500 font-bold mt-1">
                  {mission.points} 포인트
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded">
                <p className="font-medium">완료 증거:</p>
                <p className="text-gray-600">{mission.proof}</p>
              </div>
              {mission.assignedBy === currentUser.id && (
                <button
                  onClick={() => verifyMission(mission.id)}
                  className="mt-4 w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  미션 승인하기
                </button>
              )}
            </div>
          ))}
      </div>
    </div>
  );
}
