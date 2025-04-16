'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/auth';

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const { currentUser, logout } = useAuthStore();

  if (!currentUser) return null;

  const navItems = [
    { href: '/calendar', label: '캘린더', icon: '📅' },
    { href: '/chat', label: '채팅', icon: '💬' },
    { href: '/gallery', label: '갤러리', icon: '🖼️' },
    { href: '/games', label: '게임', icon: '🎮' },
    { href: '/food-vote', label: '식사투표', icon: '🍽️' },
    { href: '/missions', label: '미션', icon: '✨' },
  ];

  return (
    <nav className="bg-white shadow-lg fixed bottom-0 left-0 w-full md:relative md:top-0">
      {/* 모바일 하단 네비게이션 */}
      <div className="md:hidden">
        <div className="flex justify-around items-center h-16">
          {navItems.slice(0, 5).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center p-2 ${
                pathname === item.href 
                ? 'text-blue-600 font-medium' 
                : 'text-[#1a1a1a]'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-xs mt-1">{item.label}</span>
            </Link>
          ))}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex flex-col items-center p-2 text-gray-600"
          >
            <span className="text-xl">⋮</span>
            <span className="text-xs mt-1">더보기</span>
          </button>
        </div>

        {/* 더보기 메뉴 */}
        {isMenuOpen && (
          <div className="absolute bottom-16 left-0 w-full bg-white shadow-lg rounded-t-lg p-4">
            {navItems.slice(5).map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center p-3 ${
                  pathname === item.href ? 'text-blue-600' : 'text-gray-600'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <span className="mr-3">{item.icon}</span>
                {item.label}
              </Link>
            ))}
            <button
              onClick={() => {
                logout();
                setIsMenuOpen(false);
              }}
              className="flex items-center p-3 text-red-600 w-full"
            >
              <span className="mr-3">🚪</span>
              로그아웃
            </button>
          </div>
        )}
      </div>

      {/* 데스크톱 네비게이션 */}
      <div className="hidden md:block">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16">
            <div className="flex">
              <Link 
                href="/"
                className="flex items-center px-2 py-2 text-xl font-bold text-blue-600"
              >
                Family Together
              </Link>
            </div>

            <div className="flex space-x-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`inline-flex items-center px-3 py-2 text-sm font-medium
                    ${pathname === item.href
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-500 hover:text-gray-700 hover:border-b-2 hover:border-gray-300'
                    }`}
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </div>

            <div className="flex items-center">
              <div className="flex items-center mr-4">
                <span className="text-sm text-gray-500 mr-2">{currentUser.name}</span>
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  {currentUser.name[0]}
                </div>
              </div>
              <button
                onClick={() => logout()}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                로그아웃
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
