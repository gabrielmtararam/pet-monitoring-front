import { defineStore } from 'pinia'
import { authService } from '@/services/auth'

export const useAuthStore = defineStore('auth', () => {
  const accessToken = useCookie('access', { maxAge: 3600 }) // 1 h
  const refreshToken = useCookie('refresh', { maxAge: 86400 }) // 24 h
  const user = ref(null)

  const isAuthenticated = computed(() => !!accessToken.value)

  async function login(credentials: any) {
    try {
      const data = await authService.login(credentials)

      accessToken.value = data.access
      refreshToken.value = data.refresh
      user.value = data.user

      return data
    }
    catch (error) {
      throw error
    }
  }

  function logout() {
    authService.logout()
    accessToken.value = null
    refreshToken.value = null
    user.value = null
    navigateTo('/login')
  }

  return {
    accessToken,
    refreshToken,
    user,
    isAuthenticated,
    login,
    logout,
  }
})
