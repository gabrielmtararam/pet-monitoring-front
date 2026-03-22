<script setup lang="ts">
import { useTheme } from 'vuetify'
import { useThemeStore } from '@/stores/theme'
import type { ThemeSwitcherTheme } from '@layouts/types'

const themeStore = useThemeStore()
const vuetifyTheme = useTheme()

const themes: ThemeSwitcherTheme[] = [
  {
    name: 'light',
    icon: 'bx-sun',
  },
  {
    name: 'dark',
    icon: 'bx-moon',
  },
]

watch(() => themeStore.currentTheme, newTheme => {
  vuetifyTheme.global.name.value = newTheme
}, { immediate: true })

const handleThemeChange = (newTheme: string) => {
  themeStore.setTheme(newTheme as 'light' | 'dark')
}
</script>

<template>
  <ThemeSwitcher
    :themes="themes"
    :current-theme="themeStore.currentTheme"
    @update:current-theme="handleThemeChange"
  />
</template>
