import { create } from 'zustand'
import { useEffect } from 'react'
import api from '../api'

const useAuthStore = create((set, get) => ({
  user: null,
  loading: true,
  isAuthenticated: false,

  fetchUser: async () => {
    try {
      const res = await api.get('/auth/me')
      set({ user: res.data, isAuthenticated: true, loading: false })
    } catch {
      localStorage.removeItem('token')
      set({ user: null, isAuthenticated: false, loading: false })
    }
  },

  login: async (email, password) => {
    const res = await api.post('/auth/login', { email, password })
    localStorage.setItem('token', res.data.token)
    await get().fetchUser()
    return res.data
  },

  signup: async (email, password, nickname, privacyPolicyAgreed) => {
    const res = await api.post('/auth/signup', { email, password, nickname, privacyPolicyAgreed })
    localStorage.setItem('token', res.data.token)
    await get().fetchUser()
    return res.data
  },

  oauthLogin: async (provider, code) => {
    const res = await api.post('/auth/oauth', { provider, code })
    localStorage.setItem('token', res.data.token)
    await get().fetchUser()
    return res.data
  },

  logout: () => {
    localStorage.removeItem('token')
    set({ user: null, isAuthenticated: false })
  },
}))

// AuthProvider: 앱 시작 시 토큰 확인 및 유저 로드
export function AuthProvider({ children }) {
  const fetchUser = useAuthStore(s => s.fetchUser)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      fetchUser()
    } else {
      useAuthStore.setState({ loading: false })
    }
  }, [])

  return children
}

// 기존 useAuth() 인터페이스 유지 — 다른 파일 변경 불필요
export function useAuth() {
  return useAuthStore()
}
