<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { monitoringService, type FoodBrand, type FoodType, type WaterLogEntryType } from '@/services/monitoring'
import { useAnimalsStore } from '@/stores/animals'
import { toUtcISOStringOrUndefined } from '@/utils/datetime'

const animalsStore = useAnimalsStore()
const { selectedAnimal } = storeToRefs(animalsStore)

const router = useRouter()

const form = ref<{
  weight: string | number
  entry_type: WaterLogEntryType
  observed_at: string | null
  brand: number | null
  type: number | null
}>({
  weight: '',
  entry_type: 'reading',
  observed_at: null,
  brand: null,
  type: null,
})

const isLoadingAnimal = ref(true)
const isLoadingMeta = ref(true)
const isSubmitting = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const entryTypeOptions = [
  { title: 'Leitura de Consumo', value: 'reading' },
  { title: 'Troca / Abastecimento', value: 'refill' },
]

const brands = ref<FoodBrand[]>([])
const types = ref<FoodType[]>([])

const rules = {
  required: (value: string | number | null | undefined) => !!value || 'Campo obrigatório',
}

const loadMeta = async () => {
  isLoadingMeta.value = true
  try {
    const [brandsData, typesData] = await Promise.all([
      monitoringService.listFoodBrands(),
      monitoringService.listFoodTypes(),
    ])
    brands.value = brandsData
    types.value = typesData
  }
  catch (error: any) {
    // Apenas logamos o erro no formulário
    console.error('Erro ao carregar marcas/tipos de ração', error)
  }
  finally {
    isLoadingMeta.value = false
  }
}

const handleSubmit = async () => {
  if (!animalsStore.selectedAnimalId) {
    errorMessage.value = 'Nenhum animal selecionado para vincular o consumo de ração.'
    return
  }

  isSubmitting.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    await monitoringService.createFoodLog({
      animal: animalsStore.selectedAnimalId,
      weight: form.value.weight,
      entry_type: form.value.entry_type,
      observed_at: toUtcISOStringOrUndefined(form.value.observed_at),
      brand: form.value.brand,
      type: form.value.type,
    })

    successMessage.value = 'Consumo de ração registrado com sucesso.'
    router.push('/monitoring')
  }
  catch (error: any) {
    const data = error?.response?._data
    if (data && typeof data === 'object') {
      const firstKey = Object.keys(data)[0]
      errorMessage.value = Array.isArray(data[firstKey]) ? data[firstKey][0] : (data.detail || 'Erro ao registrar consumo de ração.')
    }
    else {
      errorMessage.value = 'Erro ao registrar consumo de ração.'
    }
  }
  finally {
    isSubmitting.value = false
  }
}

onMounted(async () => {
  try {
    await animalsStore.ensureSelectedAnimal()
    await loadMeta()
  }
  catch (error: any) {
    errorMessage.value = error.message || 'Não foi possível carregar os dados para o cadastro.'
  }
  finally {
    isLoadingAnimal.value = false
  }
})

definePageMeta({
  title: 'Registrar consumo de ração',
})
</script>

<template>
  <VRow>
    <VCol cols="12">
      <VCard>
        <VCardTitle>
          Registrar consumo de ração
        </VCardTitle>

        <VCardText>
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
            Registrando consumo de ração para o animal:
            <strong>{{ selectedAnimal.name }}</strong>
          </VAlert>

          <VForm @submit.prevent="handleSubmit">
            <VRow>
              <VCol
                cols="12"
                md="4"
              >
                <VTextField
                  :id="useId()"
                  v-model="form.weight"
                  label="Peso do pote"
                  placeholder="Ex: 120"
                  type="number"
                  suffix="g"
                  :rules="[rules.required]"
                  required
                />
              </VCol>

              <VCol
                cols="12"
                md="4"
              >
                <VSelect
                  :id="useId()"
                  v-model="form.entry_type"
                  :items="entryTypeOptions"
                  label="Tipo de lançamento"
                />
              </VCol>

              <VCol
                cols="12"
                md="4"
              >
                <VSelect
                  :id="useId()"
                  v-model="form.brand"
                  :items="brands"
                  item-title="name"
                  item-value="id"
                  label="Marca da ração (opcional)"
                  :loading="isLoadingMeta"
                  clearable
                />
              </VCol>

              <VCol
                cols="12"
                md="4"
              >
                <VSelect
                  :id="useId()"
                  v-model="form.type"
                  :items="types"
                  item-title="name"
                  item-value="id"
                  label="Tipo da ração (opcional)"
                  :loading="isLoadingMeta"
                  clearable
                />
              </VCol>

              <VCol
                cols="12"
                md="4"
              >
                <VTextField
                  :id="useId()"
                  v-model="form.observed_at"
                  label="Data e hora (opcional)"
                  type="datetime-local"
                  hint="Se não informado, será usada a data/hora atual"
                  persistent-hint
                />
              </VCol>

              <VCol
                cols="12"
                class="d-flex gap-4"
              >
                <VBtn
                  type="submit"
                  :loading="isSubmitting || isLoadingAnimal"
                  :disabled="isLoadingAnimal"
                >
                  Salvar
                </VBtn>

                <VBtn
                  type="button"
                  color="secondary"
                  variant="tonal"
                  @click="router.push('/monitoring')"
                >
                  Cancelar
                </VBtn>
              </VCol>
            </VRow>
          </VForm>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>
</template>

