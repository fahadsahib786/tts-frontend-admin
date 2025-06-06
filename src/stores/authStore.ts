// frontend-admin/src/stores/authStore.ts
import { create } from 'zustand'
import { persist, PersistOptions } from 'zustand/middleware'
import type { User } from '@/types/auth'
import type { StateCreator } from 'zustand'


interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  setUser: (user: User) => void
  setToken: (token: string) => void
  logout: () => void
  setLoading: (loading: boolean) => void
}

type AuthPersist = (
  config: StateCreator<AuthState>,
  options: PersistOptions<AuthState>
) => StateCreator<AuthState>

export const useAuthStore = create<AuthState>()(
  (persist as AuthPersist)(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      setUser: (user) =>
        set({
          user,
          isAuthenticated: true,
        }),
      setToken: (token) =>
        set({
          token,
        }),
      logout: () =>
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        }),
      setLoading: (loading) =>
        set({
          isLoading: loading,
        }),
    }),
    {
      name: 'admin-auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
