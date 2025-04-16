'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';

export default function Home() {
  const router = useRouter();
  const { currentUser, family, createFamily } = useAuthStore();

  // 로그인 상태 확인
  useEffect(() => {
    if (!currentUser) {
      router.push('/login');
      return;
    }

    // 가족이 없는 경우 가족 생성
    if (!family) {
      createFamily('양가네');
    }
  }, [currentUser, family, router, createFamily]);

  // 로딩 상태 표시
  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">
          환영합니다, {currentUser.name}님!
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">나의 정보</h2>
            <div className="space-y-2">
              <p>역할: {
                currentUser.role === 'father' ? '아빠' :
                currentUser.role === 'mother' ? '엄마' : '자녀'
              }</p>
              <p>포인트: {currentUser.points || 0}점</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">우리 가족</h2>
            <div className="space-y-2">
              <p>가족 이름: {family?.name}</p>
              <p>생성일: {family ? new Date(family.createdAt).toLocaleDateString() : '-'}</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
