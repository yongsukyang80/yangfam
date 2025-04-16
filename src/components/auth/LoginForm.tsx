'use client';

import { useState } from 'react';
import { useAuthStore } from '@/store/auth';
import { useRouter } from 'next/navigation';

export default function LoginForm() {
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { familyMembers, login } = useAuthStore();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await login(selectedMemberId);
      router.push('/calendar'); // 또는 메인 페이지로
    } catch (err) {
      setError('로그인 중 오류가 발생했습니다.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            가족 구성원 선택
          </label>
          <select
            value={selectedMemberId}
            onChange={(e) => setSelectedMemberId(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            required
          >
            <option value="">선택해주세요</option>
            {familyMembers.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name} {member.isMaster ? '(부모님)' : ''}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:bg-gray-400"
        >
          {isLoading ? '로그인 중...' : '시작하기'}
        </button>
      </form>

      {error && (
        <div className="text-red-500 text-sm text-center">{error}</div>
      )}

      {familyMembers.length === 0 && (
        <div className="text-center text-gray-500">
          등록된 가족 구성원이 없습니다. 먼저 가족 정보를 설정해주세요.
        </div>
      )}
    </div>
  );
}
