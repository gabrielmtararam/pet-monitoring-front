<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { monitoringService, type AnimalDiaryEntry } from '@/services/monitoring'
import { useAnimalsStore } from '@/stores/animals'
import { toUtcISOStringOrUndefined } from '@/utils/datetime'

const animalsStore = useAnimalsStore()
const { selectedAnimal } = storeToRefs(animalsStore)

const entries = ref<AnimalDiaryEntry[]>([])

const form = ref({
  text: '',
  observed_at: null as string | null,
})

const isLoading = ref(true)
const isSubmitting = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const rules = {
  required: (value: string | null | undefined) => !!value || 'Campo obrigatório',
}

const loadEntries = async () => {
  if (!animalsStore.selectedAnimalId) {
    entries.value = []
    return
  }

  isLoading.value = true
  errorMessage.value = ''

  try {
    entries.value = await monitoringService.listDiaryEntries(animalsStore.selectedAnimalId)
  }
  catch (error: any) {
    errorMessage.value = error?.response?._data?.detail || 'Erro ao carregar diário.'
  }
  finally {
    isLoading.value = false
  }
}

const handleSubmit = async () => {
  if (!animalsStore.selectedAnimalId) {
    errorMessage.value = 'Nenhum animal selecionado.'
    return
  }

  isSubmitting.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    await monitoringService.createDiaryEntry({
      animal: animalsStore.selectedAnimalId,
      text: form.value.text,
      observed_at: toUtcISOStringOrUndefined(form.value.observed_at),
    })

    successMessage.value = 'Comentário salvo no diário com sucesso.'
    form.value.text = ''
    form.value.observed_at = null

    await loadEntries()
  }
  catch (error: any) {
    const data = error?.response?._data
    if (data && typeof data === 'object') {
      const firstKey = Object.keys(data)[0]
      errorMessage.value = Array.isArray(data[firstKey]) ? data[firstKey][0] : (data.detail || 'Erro ao salvar comentário.')
    }
    else {
      errorMessage.value = 'Erro ao salvar comentário.'
    }
  }
  finally {
    isSubmitting.value = false
  }
}

onMounted(async () => {
  try {
    await animalsStore.ensureSelectedAnimal()
    await loadEntries()
  }
  catch (error: any) {
    errorMessage.value = error.message || 'Não foi possível carregar o diário.'
  }
})

definePageMeta({
  title: 'Diário do animal',
})
</script>

<template>
  <VRow>
    <VCol cols="12">
      <h2 class="text-h4 mb-4">
        Diário do animal
      </h2>
    </VCol>

    <VCol cols="12">
      <VAlert
        v-if="errorMessage"
        type="error"
        variant="tonal"
        class="mb-4"
        density="compact"
      >
        {{ errorMessage }}
      </VAlert>

      <VAlert
        v-if="successMessage"
        type="success"
        variant="tonal"
        class="mb-4"
        density="compact"
      >
        {{ successMessage }}
      </VAlert>

      <VAlert
        v-if="selectedAnimal"
        type="info"
        variant="tonal"
        class="mb-4"
        density="compact"
      >
        Registrando no diário de:
        <strong>{{ selectedAnimal.name }}</strong>
      </VAlert>
    </VCol>

    <VCol
      cols="12"
      md="5"
    >
      <VCard title="Novo comentário">
        <VCardText>
          <VForm @submit.prevent="handleSubmit">
            <VRow>
              <VCol cols="12">
                <VTextarea
                  :id="useId()"
                  v-model="form.text"
                  label="Comentário"
                  placeholder="Descreva o que aconteceu com o animal..."
                  rows="5"
                  :rules="[rules.required]"
                  required
                />
              </VCol>

              <VCol cols="12">
                <VTextField
                  :id="useId()"
                  v-model="form.observed_at"
                  label="Data e hora do acontecimento (opcional)"
                  type="datetime-local"
                  hint="Se não informar, será usada a data e hora atual"
                  persistent-hint
                />
              </VCol>

              <VCol cols="12">
                <VBtn
                  type="submit"
                  :loading="isSubmitting"
                  :disabled="!selectedAnimal"
                >
                  Salvar no diário
                </VBtn>
              </VCol>
            </VRow>
          </VForm>
        </VCardText>
      </VCard>
    </VCol>

    <VCol
      cols="12"
      md="7"
    >
      <VCard title="Histórico do diário">
        <VCardText>
          <div
            v-if="isLoading"
            class="d-flex justify-center py-8"
          >
            <VProgressCircular indeterminate color="primary" />
          </div>

          <div v-else-if="!entries.length" class="text-medium-emphasis">
            Ainda não há comentários no diário deste animal.
          </div>

          <VList
            v-else
            lines="three"
            density="comfortable"
          >
            <VListItem
              v-for="entry in entries"
              :key="entry.id"
              :title="new Date(entry.observed_at).toLocaleString()"
              :subtitle="entry.text"
            />
          </VList>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>
</template>

