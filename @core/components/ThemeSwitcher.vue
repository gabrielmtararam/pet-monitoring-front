<script setup lang="ts">
import { useTheme } from 'vuetify'
import type { ThemeSwitcherTheme } from '@layouts/types'

const props = defineProps<{
  themes: ThemeSwitcherTheme[]
}>()

const emit = defineEmits(['update:currentTheme'])

const { global: globalTheme } = useTheme()

const { state: currentThemeName, next: getNextThemeName, index: currentThemeIndex } = useCycleList(
  props.themes.map(t => t.name),
  { initialValue: globalTheme.name.value },
)

const changeTheme = () => {
  const nextTheme = getNextThemeName()

  globalTheme.name.value = nextTheme

  emit('update:currentTheme', nextTheme)
}

watch(() => globalTheme.name.value, val => {
  currentThemeName.value = val
})
</script>

<template>
  <IconBtn @click="changeTheme">
    <VIcon :icon="props.themes[currentThemeIndex].icon" />
    <VTooltip
      activator="parent"
      open-delay="1000"
      scroll-strategy="close"
    >
      <span class="text-capitalize">{{ currentThemeName }}</span>
    </VTooltip>
  </IconBtn>
</template>
