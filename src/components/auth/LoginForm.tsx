'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';

export default function LoginForm() {
  const [name, setName] = useState('');
  const [role, setRole] = useState<'father' | 'mother' | 'child'>('child');
  const [error, setError] = useState('');
  const router = useRouter();
  const { setCurrentUser, familyMembers } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 이미 등록된 사용자인지 확인
    const existingUser = familyMembers.find(
      member => member.name === name && member.role === role
    );

    if (existingUser) {
      setCurrentUser(existingUser);
      router.push('/');
    } else {
      // 새로운 사용자 생성
      const newUser = {
        id: Date.now().toString(),
        name,
        role,
        points: 0
      };
      setCurrentUser(newUser);
      router.push('/');
    }
  };

  return (
    <div className="max-w-md w-full space-y-8">
      <div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Family Together
        </h2>
      </div>
      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        <div className="rounded-md shadow-sm space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              이름
            </label>
            <input
              id="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="이름을 입력하세요"
            />
          </div>

          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700">
              역할
            </label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value as 'father' | 'mother' | 'child')}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="father">아빠</option>
              <option value="mother">엄마</option>
              <option value="child">자녀</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="text-red-500 text-sm text-center">
            {error}
          </div>
        )}

        <div>
          <button
            type="submit"
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            시작하기
          </button>
        </div>
      </form>
    </div>
  );
}
