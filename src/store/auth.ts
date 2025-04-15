import { create } from 'zustand';
import { User } from '@/types';

interface AuthState {
  user: User | null;
  login: (name: string, role: User['role']) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: typeof window !== 'undefined' 
    ? JSON.parse(localStorage.getItem('user') || 'null')
    : null,
  login: (name, role) => {
    const user: User = {
      id: Date.now().toString(),
      name,
      role,
      createdAt: new Date().toISOString()
    };
    localStorage.setItem('user', JSON.stringify(user));
    set({ user });
  },
  logout: () => {
    localStorage.removeItem('user');
    set({ user: null });
  }
}));
