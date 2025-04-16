'use client';

import { useState } from 'react';
import { useMissionStore, type Mission } from '@/store/mission';
import { useAuthStore } from '@/store/auth';

export default function MissionComponent() {
  const currentUser = useAuthStore((state) => state.currentUser);
  const { 
    missions, 
    userPoints,
    createMission, 
    assignMission,
    submitMissionProof, 
    verifyMission, 
    deleteMission,
    getUserPoints 
  } = useMissionStore();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [points, setPoints] = useState('');
  const [deadline, setDeadline] = useState('');
  const [proofImage, setProofImage] = useState('');

  const handleCreateMission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    await createMission({
      title,
      description,
      points: Number(points),
      deadline,
      createdBy: currentUser.id
    });

    setTitle('');
    setDescription('');
    setPoints('');
    setDeadline('');
  };

  const handleSubmitProof = async (missionId: string) => {
    if (!currentUser || !proofImage) return;
    await submitMissionProof(missionId, currentUser.id, proofImage);
    setProofImage('');
  };

  if (!currentUser) return null;

  const userPoints = getUserPoints(currentUser.id);
  const pendingMissions = missions.filter(m => m.status === 'pending');
  const completedMissions = missions.filter(m => m.status === 'completed');
  const verifiedMissions = missions.filter(m => m.status === 'verified');

  return (
    <div className="p-4 space-y-6">
      {/* 사용자 포인트 표시 */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold">나의 포인트</h2>
        <p className="text-3xl font-bold text-blue-600 mt-2">{userPoints} 점</p>
      </div>

      {/* 미션 생성 폼 */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-4">새 미션 만들기</h2>
        <form onSubmit={handleCreateMission} className="space-y-4">
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
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">포인트</label>
            <input
              type="number"
              value={points}
              onChange={(e) => setPoints(e.target.value)}
              className="w-full px-3 py-2 border rounded"
              required
              min="1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">마감일</label>
            <input
              type="datetime-local"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            미션 생성
          </button>
        </form>
      </div>

      {/* 진행 중인 미션 */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-4">진행 중인 미션</h2>
        <div className="space-y-4">
          {pendingMissions.map((mission) => (
            <div key={mission.id} className="border p-4 rounded">
              <h3 className="font-bold">{mission.title}</h3>
              <p className="text-gray-600">{mission.description}</p>
              <div className="mt-2 text-sm text-gray-500">
                <p>포인트: {mission.points}</p>
                <p>마감일: {new Date(mission.deadline).toLocaleString()}</p>
              </div>
              {!mission.assignedTo && (
                <button
                  onClick={() => assignMission(mission.id, currentUser.id)}
                  className="mt-2 px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  미션 수락
                </button>
              )}
              {mission.assignedTo === currentUser.id && (
                <div className="mt-2 space-y-2">
                  <input
                    type="text"
                    value={proofImage}
                    onChange={(e) => setProofImage(e.target.value)}
                    placeholder="인증 이미지 URL"
                    className="w-full px-3 py-2 border rounded"
                  />
                  <button
                    onClick={() => handleSubmitProof(mission.id)}
                    className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    인증하기
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 완료 대기 중인 미션 */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-4">완료 대기 중인 미션</h2>
        <div className="space-y-4">
          {completedMissions.map((mission) => (
            <div key={mission.id} className="border p-4 rounded">
              <h3 className="font-bold">{mission.title}</h3>
              <p className="text-gray-600">{mission.description}</p>
              <div className="mt-2">
                <img
                  src={mission.proofImage}
                  alt="인증 이미지"
                  className="w-full h-48 object-cover rounded"
                />
              </div>
              {mission.createdBy === currentUser.id && (
                <button
                  onClick={() => verifyMission(mission.id, currentUser.id)}
                  className="mt-2 px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  인증 확인
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 완료된 미션 */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-4">완료된 미션</h2>
        <div className="space-y-4">
          {verifiedMissions.map((mission) => (
            <div key={mission.id} className="border p-4 rounded">
              <h3 className="font-bold">{mission.title}</h3>
              <p className="text-gray-600">{mission.description}</p>
              <div className="mt-2">
                <img
                  src={mission.proofImage}
                  alt="인증 이미지"
                  className="w-full h-48 object-cover rounded"
                />
              </div>
              <div className="mt-2 text-sm text-gray-500">
                <p>완료자: {mission.completedBy}</p>
                <p>완료일: {new Date(mission.completedAt!).toLocaleString()}</p>
                <p>검증자: {mission.verifiedBy}</p>
                <p>검증일: {new Date(mission.verifiedAt!).toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
