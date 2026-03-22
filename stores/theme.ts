import { defineStore } from 'pinia'

export const useThemeStore = defineStore('theme', () => {
  const themeCookie = useCookie<'light' | 'dark'>('theme-preference', {
    default: () => 'light',
    maxAge: 31536000, // 1 ano
  })

  const currentTheme = ref(themeCookie.value)

  const setTheme = (themeName: 'light' | 'dark') => {
    currentTheme.value = themeName
    themeCookie.value = themeName
  }

  return {
    currentTheme,
    setTheme,
  }
})
