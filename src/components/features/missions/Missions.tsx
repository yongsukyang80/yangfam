'use client';

import { useState } from 'react';
import { useMissionStore } from '@/store/mission';
import { useAuthStore } from '@/store/auth';
import ImageUpload from '@/components/common/ImageUpload';

export default function Mission() {
  const { currentUser } = useAuthStore();
  const {
    missions,
    createMission,
    submitMissionProof,
    verifyMission,
    deleteMission
  } = useMissionStore();

  const [newMission, setNewMission] = useState({
    title: '',
    description: '',
    points: 0,
    deadline: new Date().toISOString().split('T')[0]
  });

  const [selectedMission, setSelectedMission] = useState<string | null>(null);

  const handleCreateMission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    try {
      await createMission({
        ...newMission,
        createdBy: currentUser.id,
        deadline: new Date(newMission.deadline).toISOString()
      });
      setNewMission({
        title: '',
        description: '',
        points: 0,
        deadline: new Date().toISOString().split('T')[0]
      });
    } catch (error) {
      console.error('Error creating mission:', error);
      alert('미션 생성 중 오류가 발생했습니다.');
    }
  };

  const handleImageUpload = async (imageUrl: string) => {
    if (!currentUser || !selectedMission) return;

    try {
      await submitMissionProof(selectedMission, currentUser.id, imageUrl);
      setSelectedMission(null);
    } catch (error) {
      console.error('Error submitting mission proof:', error);
      alert('미션 완료 증명 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="p-4 space-y-6">
      {currentUser && (
        <form onSubmit={handleCreateMission} className="space-y-4">
          <input
            type="text"
            value={newMission.title}
            onChange={(e) => setNewMission({ ...newMission, title: e.target.value })}
            placeholder="미션 제목"
            className="w-full border rounded-lg px-4 py-2"
            required
          />
          <textarea
            value={newMission.description}
            onChange={(e) => setNewMission({ ...newMission, description: e.target.value })}
            placeholder="미션 설명"
            className="w-full border rounded-lg px-4 py-2"
            required
          />
          <input
            type="number"
            value={newMission.points}
            onChange={(e) => setNewMission({ ...newMission, points: parseInt(e.target.value) })}
            placeholder="포인트"
            className="w-full border rounded-lg px-4 py-2"
            required
            min="0"
          />
          <input
            type="date"
            value={newMission.deadline}
            onChange={(e) => setNewMission({ ...newMission, deadline: e.target.value })}
            className="w-full border rounded-lg px-4 py-2"
            required
          />
          <button
            type="submit"
            className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg"
          >
            미션 생성
          </button>
        </form>
      )}

      <div className="space-y-4">
        {missions.map((mission) => (
          <div key={mission.id} className="border rounded-lg p-4">
            <h3 className="text-lg font-bold">{mission.title}</h3>
            <p className="text-gray-600">{mission.description}</p>
            <p className="text-sm text-gray-500">포인트: {mission.points}</p>
            <p className="text-sm text-gray-500">마감일: {new Date(mission.deadline).toLocaleDateString()}</p>
            
            {mission.status === 'completed' ? (
              <div className="mt-4">
                <p className="text-yellow-500">검증 대기중</p>
                {mission.proofImage && (
                  <img
                    src={mission.proofImage}
                    alt="Mission proof"
                    className="mt-2 max-w-full h-40 object-cover rounded-lg"
                  />
                )}
                {currentUser?.id === mission.createdBy && (
                  <button
                    onClick={() => verifyMission(mission.id, currentUser.id)}
                    className="mt-2 bg-green-500 text-white px-4 py-2 rounded-lg"
                  >
                    인증하기
                  </button>
                )}
              </div>
            ) : mission.status === 'verified' ? (
              <div className="mt-4">
                <p className="text-green-500">완료됨</p>
                {mission.proofImage && (
                  <img
                    src={mission.proofImage}
                    alt="Mission proof"
                    className="mt-2 max-w-full h-40 object-cover rounded-lg"
                  />
                )}
              </div>
            ) : (
              currentUser && (
                <div className="mt-4">
                  {selectedMission === mission.id ? (
                    <div className="space-y-2">
                      <ImageUpload onUploadComplete={handleImageUpload} />
                      <button
                        onClick={() => setSelectedMission(null)}
                        className="text-gray-500"
                      >
                        취소
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setSelectedMission(mission.id)}
                      className="bg-blue-500 text-white px-4 py-2 rounded-lg"
                    >
                      미션 완료하기
                    </button>
                  )}
                </div>
              )
            )}

            {currentUser?.id === mission.createdBy && mission.status === 'pending' && (
              <button
                onClick={() => deleteMission(mission.id)}
                className="mt-2 text-red-500"
              >
                삭제
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
