<script setup lang="ts">
import { useAnimalsStore } from '@/stores/animals'

const animalsStore = useAnimalsStore()
const selectedAnimalId = computed(() => animalsStore.selectedAnimalId)
</script>

<template>
  <VRow>
    <VCol cols="12">
      <h2 class="text-h4 mb-4">
        Assistente IA Pet
      </h2>
      <p class="text-body-1 text-medium-emphasis">
        Converse com nossa inteligência artificial para tirar dúvidas sobre o comportamento, consumo e saúde do seu pet.
      </p>
    </VCol>

    <VCol cols="12">
      <VCard class="pa-6 d-flex flex-column align-center justify-center border-dashed" min-height="400">
        <VIcon icon="bx-bot" size="64" color="primary" class="mb-4" />
        <h3 class="text-h5 mb-2">O Assistente está pronto!</h3>
        <p class="text-center text-medium-emphasis mb-6">
          Clique no ícone de chat no canto inferior da tela para começar a conversar.
          Lá você pode perguntar sobre o histórico de consumo de água, ração e as notas do diário.
        </p>
        <VBtn
          color="primary"
          prepend-icon="bx-chat"
          @click="$router.push('/monitoring')"
        >
          Ir para Monitoramento
        </VBtn>
      </VCard>
    </VCol>
  </VRow>
</template>
