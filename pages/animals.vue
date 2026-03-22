<script setup lang="ts">
import { useAnimalsStore } from '@/stores/animals'

const animalsStore = useAnimalsStore()

const { animals, isLoading, error, selectedAnimalId, selectedAnimal, hasSelection } = storeToRefs(animalsStore)

const localError = ref('')

const loadAnimals = async () => {
  localError.value = ''

  try {
    await animalsStore.fetchAnimals()
  }
  catch (err: any) {
    localError.value = err?.response?._data?.detail || 'Erro ao carregar animais.'
  }
}

const handleSelect = (id: number) => {
  animalsStore.selectAnimal(id)
}

onMounted(() => {
  if (!animals.value.length)
    loadAnimals()
})
</script>

<template>
  <VRow>
    <VCol cols="12">
      <h2 class="text-h4 mb-4">
        Meus animais
      </h2>
    </VCol>

    <VCol cols="12">
      <VAlert
        v-if="error || localError"
        type="error"
        variant="tonal"
        class="mb-4"
        density="compact"
      >
        {{ error || localError }}
      </VAlert>

      <VAlert
        v-if="hasSelection && selectedAnimal"
        type="success"
        variant="tonal"
        class="mb-4"
        density="compact"
      >
        Animal selecionado: <strong>{{ selectedAnimal.name }}</strong> ({{ selectedAnimal.specie }} - {{ selectedAnimal.breed }})
      </VAlert>
    </VCol>

    <VCol cols="12">
      <VCard>
        <VCardTitle class="d-flex justify-space-between align-center">
          <span>Animais sob minha guarda</span>
          <VBtn
            variant="tonal"
            color="primary"
            @click="loadAnimals"
          >
            Recarregar
          </VBtn>
        </VCardTitle>

        <VCardText>
          <div v-if="isLoading" class="d-flex justify-center py-8">
            <VProgressCircular indeterminate color="primary" />
          </div>

          <div v-else-if="!animals.length" class="text-medium-emphasis">
            Nenhum animal cadastrado para este usuário.
          </div>

          <VList
            v-else
            density="comfortable"
            lines="two"
          >
            <VListItem
              v-for="animal in animals"
              :key="animal.id"
              :title="animal.name"
              :subtitle="`${animal.specie} - ${animal.breed}`"
              :active="animal.id === selectedAnimalId"
              @click="handleSelect(animal.id)"
            >
              <template #append>
                <VChip
                  v-if="animal.id === selectedAnimalId"
                  color="success"
                  size="small"
                  label
                >
                  Selecionado
                </VChip>
              </template>
            </VListItem>
          </VList>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>
</template>

