<script setup lang="ts">
// Mantém o hook para futuras customizações de layout em mobile.
// Evita referência a configStore inexistente, que causava erro 500 em /login no mobile.
useDevice()
</script>

<template>
  <VApp>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </VApp>
</template>
