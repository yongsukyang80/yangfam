'use client';

import { useState } from 'react';
import { useAuthStore } from '@/store/auth';

export default function LoginForm() {
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login, familyUsers } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await login(name, role);
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
            이름
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">
            역할
          </label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            required
          >
            <option value="">선택해주세요</option>
            <option value="parent">부모님</option>
            <option value="child">자녀</option>
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

      {familyUsers.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-medium text-gray-700 mb-2">
            현재 접속 중인 가족
          </h3>
          <div className="space-y-2">
            {familyUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between bg-gray-50 p-2 rounded"
              >
                <span>{user.name}</span>
                <span className="text-sm text-gray-500">
                  {user.role === 'parent' ? '부모님' : '자녀'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
