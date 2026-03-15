import { create } from 'zustand';

interface User {
  id: number;
  username: string;
  role: 'manager' | 'editer';
  name: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  login: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user') as string) : null,
  token: localStorage.getItem('token') || null,
  login: (user, token) => {
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('token', token);
    set({ user, token });
  },
  logout: () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    set({ user: null, token: null });
  },
}));

interface AppState {
  headerInfo: string;
  setHeaderInfo: (info: string) => void;
  refreshTrigger: number;
  triggerRefresh: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  headerInfo: 'TRẦN THỊ THU PHƯƠNG',
  setHeaderInfo: (info) => set({ headerInfo: info }),
  refreshTrigger: 0,
  triggerRefresh: () => set((state) => ({ refreshTrigger: state.refreshTrigger + 1 })),
}));
