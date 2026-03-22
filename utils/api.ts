const API_BASE_URL = (process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:8000').replace(/^"+|"+$/g, '')

export const $api = $fetch.create({
  baseURL: API_BASE_URL,
  onRequest({ options }) {
    const token = useCookie('access').value

    if (token) {
      options.headers = {
        ...options.headers,
        Authorization: `Bearer ${token}`,
      }
    }
  },

  async onResponseError({ request, options, response }) {
    if (response.status === 401 && process.client) {
      const refreshToken = localStorage.getItem('refresh')

      if (refreshToken) {
        try {
          const data: any = await $fetch(`${API_BASE_URL}/api/auth/token/refresh/`, {
            method: 'POST',
            body: { refresh: refreshToken },
          })

          localStorage.setItem('access', data.access)

          options.headers = {
            ...options.headers,
            Authorization: `Bearer ${data.access}`,
          }

          return $fetch(request, options)
        }
        catch (refreshError) {
          localStorage.removeItem('access')
          localStorage.removeItem('refresh')
          window.location.href = '/login'
        }
      }
    }
  },
})
