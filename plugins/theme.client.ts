export default defineNuxtPlugin(nuxtApp => {
  const themeStore = useThemeStore()

  nuxtApp.hook('app:mounted', () => {
    const vuetify = nuxtApp.$vuetify as any
    if (vuetify)
      vuetify.theme.global.name.value = themeStore.currentTheme
  })
})
