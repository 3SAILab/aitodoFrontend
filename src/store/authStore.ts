import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { User } from '../types'

interface AuthState {
    token: string | null
    user: User | null
    setLogin: (token: string, user: User) => void
    logout: () => void
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            token: null,
            user: null,
            setLogin: (token, user) => set({ token, user }),
            logout: () => set({ token:null, user:null })
        }),
        {
            name: 'auth-storage',
            storage: createJSONStorage(() => localStorage)
        }
    )
)


