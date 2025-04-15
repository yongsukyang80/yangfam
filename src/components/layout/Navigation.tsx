'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/auth';

const navigationItems = [
  { path: '/calendar', label: '캘린더', icon: '📅' },
  { path: '/chat', label: '채팅', icon: '💬' },
  { path: '/gallery', label: '갤러리', icon: '📷' },
  { path: '/games', label: '게임존', icon: '🎮' },
  { path: '/food-vote', label: '식단투표', icon: '🍽️' },
  { path: '/missions', label: '미션', icon: '🎯' }
];

export default function Navigation() {
  const pathname = usePathname();
  const user = useAuthStore(state => state.user);
  const logout = useAuthStore(state => state.logout);

  if (!user) return null;

  return (
    <nav className="bg-white shadow-lg">
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
            {navigationItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={`inline-flex items-center px-3 py-2 text-sm font-medium
                  ${pathname === item.path
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
              <span className="text-sm text-gray-500 mr-2">{user.name}</span>
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                {user.name[0]}
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
    </nav>
  );
}
