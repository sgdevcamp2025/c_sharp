import { create } from 'zustand';
import { User } from './user-type';

type UserStore = {
  user: User | null;
  setUser: (user: User | null) => void;
};
export const useUserStore = create<UserStore>(() => ({
  user:
    typeof window !== 'undefined'
      ? JSON.parse(localStorage.getItem('user') || 'null')
      : null,
  setUser: (user) => {
    localStorage.setItem('user', JSON.stringify(user));
    return { user };
  },
}));
