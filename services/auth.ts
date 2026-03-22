import { $api } from '@/utils/api'

export const authService = {
  async login(credentials: any) {
    return await $api('/api/auth/login/', {
      method: 'POST',
      body: credentials,
    })
  },

  async logout() {
    const refresh = useCookie('refresh').value

    return await $api('/api/auth/logout/', {
      method: 'POST',
      body: { refresh },
    })
  },
}
