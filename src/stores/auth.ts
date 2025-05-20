// src/stores/auth.ts
import { defineStore } from 'pinia'
import axios from 'axios'
import { computed, ref } from 'vue'

export interface User {
  id: number
  name: string
  email: string
  role: string
}

export interface LoginPayload {
  email: string
  password: string
  rememberMe?: boolean
}

export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  loading: boolean
}

export const useAuthStore = defineStore('auth', () => {
  // State (as refs)
  const user = ref<User | null>(null)
  const token = ref<string | null>(localStorage.getItem('token') || null)
  const isAuthenticated = ref<boolean>(!!localStorage.getItem('token'))
  const loading = ref<boolean>(false)

  // Getters
  const getUser = computed(() => user.value)
  const isLoggedIn = computed(() => isAuthenticated.value)
  const isAdmin = computed(() => user.value?.role === 'admin')

  // Actions
  async function login(payload: LoginPayload) {
    loading.value = true

    try {
      // Replace with your API endpoint
      const response = await axios.post('/api/auth/login', payload)

      const { token: newToken, user: userData } = response.data

      // Set token in localStorage for persistence
      if (payload.rememberMe) {
        localStorage.setItem('token', newToken)
      } else {
        sessionStorage.setItem('token', newToken)
      }

      // Set authorization header for future requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`

      // Update store state
      token.value = newToken
      user.value = userData
      isAuthenticated.value = true

      return userData
    } catch (error) {
      throw error
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    loading.value = true

    try {
      // Call logout endpoint if needed
      if (token.value) {
        await axios.post('/api/auth/logout')
      }

      // Clear storage
      localStorage.removeItem('token')
      sessionStorage.removeItem('token')

      // Remove authorization header
      delete axios.defaults.headers.common['Authorization']

      // Reset store state
      token.value = null
      user.value = null
      isAuthenticated.value = false
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      loading.value = false
    }
  }

  async function fetchUser() {
    if (!token.value) return null

    loading.value = true

    try {
      const response = await axios.get('/api/auth/user')
      user.value = response.data
      return user.value
    } catch (error: any) {
      // If token is invalid or expired
      if (error.response?.status === 401) {
        logout()
      }
      return null
    } finally {
      loading.value = false
    }
  }

  function setToken(newToken: string) {
    token.value = newToken
    isAuthenticated.value = true
    localStorage.setItem('token', newToken)
    axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`
  }

  function initAuth() {
    const storedToken = localStorage.getItem('token') || sessionStorage.getItem('token')

    if (storedToken) {
      setToken(storedToken)
      fetchUser()
    }
  }

  return {
    // State
    user,
    token,
    isAuthenticated,
    loading,

    // Getters
    getUser,
    isLoggedIn,
    isAdmin,

    // Actions
    login,
    logout,
    fetchUser,
    setToken,
    initAuth,
  }
})
