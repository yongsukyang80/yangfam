'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';

export default function Home() {
  const [isMasterSetup, setIsMasterSetup] = useState(false);
  const [masterName, setMasterName] = useState('');
  const [familyName, setFamilyName] = useState('');
  const [members, setMembers] = useState<string[]>([]);
  const [newMember, setNewMember] = useState('');
  const router = useRouter();
  const { setupMaster, login } = useAuthStore();

  // 마스터 계정이 이미 설정되어 있는지 확인
  useEffect(() => {
    const checkMaster = async () => {
      const hasMaster = await useAuthStore.getState().hasMaster();
      setIsMasterSetup(hasMaster);
    };
    checkMaster();
  }, []);

  const handleAddMember = () => {
    if (newMember.trim() && !members.includes(newMember.trim())) {
      setMembers([...members, newMember.trim()]);
      setNewMember('');
    }
  };

  const handleRemoveMember = (memberToRemove: string) => {
    setMembers(members.filter(member => member !== memberToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isMasterSetup) {
      // 일반 로그인
      router.push('/login');
    } else {
      // 마스터 계정 설정
      await setupMaster({
        masterName,
        familyName,
        members
      });
      router.push('/login');
    }
  };

  if (isMasterSetup) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-lg">
          <h1 className="text-2xl font-bold text-center mb-6">우리집 커뮤니티</h1>
          <p className="text-center mb-4">로그인 페이지로 이동합니다.</p>
          <button
            onClick={() => router.push('/login')}
            className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
          >
            로그인하기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-center mb-6">우리집 커뮤니티 설정</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">부모님 이름</label>
            <input
              type="text"
              value={masterName}
              onChange={(e) => setMasterName(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">우리 가족 이름</label>
            <input
              type="text"
              value={familyName}
              onChange={(e) => setFamilyName(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              placeholder="예: 양가네"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">가족 구성원</label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={newMember}
                onChange={(e) => setNewMember(e.target.value)}
                className="flex-1 rounded-md border border-gray-300 px-3 py-2"
                placeholder="이름 입력"
              />
              <button
                type="button"
                onClick={handleAddMember}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                추가
              </button>
            </div>
          </div>

          {members.length > 0 && (
            <div className="bg-gray-50 p-4 rounded">
              <h3 className="font-medium mb-2">등록된 가족 구성원</h3>
              <div className="space-y-2">
                {members.map((member, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span>{member}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveMember(member)}
                      className="text-red-500 hover:text-red-600"
                    >
                      삭제
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
          >
            설정 완료
          </button>
        </form>
      </div>
    </div>
  );
}
