'use client';

import { useState } from 'react';
import { useAuthStore } from '@/store/auth';
import { useMissionStore, type Mission } from '@/store/mission';

export default function Missions() {
  const { currentUser } = useAuthStore();
  const { missions, createMission, completeMission, verifyMission, deleteMission } = useMissionStore();
  
  const [newMission, setNewMission] = useState({
    title: '',
    description: '',
    points: 0,
    deadline: ''
  });

  const [proofImage, setProofImage] = useState('');

  const isMaster = currentUser?.role === 'father' || currentUser?.role === 'mother';

  const handleCreateMission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    try {
      await createMission({
        ...newMission,
        createdBy: currentUser.id,
        createdByName: currentUser.name
      });

      setNewMission({
        title: '',
        description: '',
        points: 0,
        deadline: ''
      });
    } catch (error) {
      console.error('미션 생성 중 오류:', error);
      alert('미션 생성에 실패했습니다.');
    }
  };

  const handleCompleteMission = async (mission: Mission) => {
    if (!currentUser) return;

    const proofImage = prompt('미션 완료 증명 이미지 URL을 입력하세요:');
    if (!proofImage) return;

    try {
      await completeMission(mission.id, currentUser.id, currentUser.name, proofImage);
    } catch (error) {
      console.error('미션 완료 처리 중 오류:', error);
      alert('미션 완료 처리에 실패했습니다.');
    }
  };

  const handleVerifyMission = async (mission: Mission, isApproved: boolean) => {
    if (!currentUser || !isMaster) return;

    try {
      const rejectionReason = !isApproved ? prompt('거절 사유를 입력하세요:') || undefined : undefined;
      await verifyMission(mission.id, currentUser.id, currentUser.name, isApproved, rejectionReason);
    } catch (error) {
      console.error('미션 검증 중 오류:', error);
      alert('미션 검증에 실패했습니다.');
    }
  };

  const pendingMissions = missions.filter(m => m.status === 'pending');
  const completedMissions = missions.filter(m => m.status === 'completed');
  const verifiedMissions = missions.filter(m => m.status === 'verified');
  const rejectedMissions = missions.filter(m => m.status === 'rejected');

  return (
    <div className="p-4 space-y-8">
      {/* 미션 생성 폼 (마스터만 볼 수 있음) */}
      {isMaster && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-2xl font-bold mb-4">새 미션 만들기</h2>
          <form onSubmit={handleCreateMission} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">제목</label>
              <input
                type="text"
                value={newMission.title}
                onChange={(e) => setNewMission({ ...newMission, title: e.target.value })}
                className="w-full px-3 py-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">설명</label>
              <textarea
                value={newMission.description}
                onChange={(e) => setNewMission({ ...newMission, description: e.target.value })}
                className="w-full px-3 py-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">포인트</label>
              <input
                type="number"
                value={newMission.points}
                onChange={(e) => setNewMission({ ...newMission, points: Number(e.target.value) })}
                className="w-full px-3 py-2 border rounded"
                required
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">마감일</label>
              <input
                type="date"
                value={newMission.deadline}
                onChange={(e) => setNewMission({ ...newMission, deadline: e.target.value })}
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
      )}

      {/* 진행 중인 미션 */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-4">진행 중인 미션</h2>
        <div className="space-y-4">
          {pendingMissions.map((mission) => (
            <div key={mission.id} className="border p-4 rounded">
              <h3 className="font-bold">{mission.title}</h3>
              <p className="text-gray-600">{mission.description}</p>
              <p className="text-sm text-gray-500">
                포인트: {mission.points} / 마감일: {new Date(mission.deadline).toLocaleDateString()}
              </p>
              {currentUser && !isMaster && (
                <button
                  onClick={() => handleCompleteMission(mission)}
                  className="mt-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  완료하기
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 검수 대기 중인 미션 (마스터만 볼 수 있음) */}
      {isMaster && completedMissions.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-2xl font-bold mb-4">검수 대기 중인 미션</h2>
          <div className="space-y-4">
            {completedMissions.map((mission) => (
              <div key={mission.id} className="border p-4 rounded">
                <h3 className="font-bold">{mission.title}</h3>
                <p className="text-gray-600">{mission.description}</p>
                <p className="text-sm text-gray-500">
                  완료자: {mission.completedByName} / 
                  완료일: {new Date(mission.completedAt!).toLocaleDateString()}
                </p>
                {mission.proofImage && (
                  <img
                    src={mission.proofImage}
                    alt="미션 증명"
                    className="mt-2 max-w-xs rounded"
                  />
                )}
                <div className="mt-2 flex gap-2">
                  <button
                    onClick={() => handleVerifyMission(mission, true)}
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                  >
                    승인
                  </button>
                  <button
                    onClick={() => handleVerifyMission(mission, false)}
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    거절
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 완료된 미션 */}
      {verifiedMissions.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-2xl font-bold mb-4">완료된 미션</h2>
          <div className="space-y-4">
            {verifiedMissions.map((mission) => (
              <div key={mission.id} className="border p-4 rounded opacity-75">
                <h3 className="font-bold">{mission.title}</h3>
                <p className="text-gray-600">{mission.description}</p>
                <p className="text-sm text-gray-500">
                  완료자: {mission.completedByName} / 
                  검증자: {mission.verifiedByName} /
                  포인트: {mission.points}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 거절된 미션 */}
      {rejectedMissions.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-2xl font-bold mb-4">거절된 미션</h2>
          <div className="space-y-4">
            {rejectedMissions.map((mission) => (
              <div key={mission.id} className="border p-4 rounded bg-red-50">
                <h3 className="font-bold">{mission.title}</h3>
                <p className="text-gray-600">{mission.description}</p>
                <p className="text-sm text-red-500">
                  거절 사유: {mission.rejectionReason}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
