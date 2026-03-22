<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { monitoringService, type BulkWaterLogItem, type WaterBowl, type WaterLogEntryType } from '@/services/monitoring'
import { useAnimalsStore } from '@/stores/animals'
import { toUtcISOStringOrUndefined } from '@/utils/datetime'

const animalsStore = useAnimalsStore()
const { selectedAnimal } = storeToRefs(animalsStore)

const bowls = ref<WaterBowl[]>([])

interface LocalLogRow extends BulkWaterLogItem {
  name: string
  is_reference?: boolean
}

const logRows = ref<LocalLogRow[]>([])

const entryType = ref<WaterLogEntryType>('reading')
const observedAt = ref<string | null>(null)

const isLoading = ref(true)
const isSubmitting = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const entryTypeOptions = [
  { title: 'Leitura de Consumo', value: 'reading' },
  { title: 'Troca / Abastecimento', value: 'refill' },
]

const hasAnyValue = computed(() => logRows.value.some(row => row.weight !== '' && row.weight !== null && row.weight !== undefined))

const loadData = async () => {
  isLoading.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    const animal = await animalsStore.ensureSelectedAnimal()

    if (!animal) {
      throw new Error('Nenhum animal encontrado.')
    }

    const allBowls = await monitoringService.listBowls()
    bowls.value = allBowls.filter(b => b.animal === animal.id)

    logRows.value = bowls.value.map(bowl => ({
      bowl: bowl.id,
      weight: '',
      name: bowl.name,
      is_reference: bowl.is_reference,
    }))
  }
  catch (error: any) {
    errorMessage.value = error.message || error?.response?._data?.detail || 'Erro ao carregar dados.'
  }
  finally {
    isLoading.value = false
  }
}

const handleSubmit = async () => {
  errorMessage.value = ''
  successMessage.value = ''

  const items: BulkWaterLogItem[] = logRows.value
    .filter(row => row.weight !== '' && row.weight !== null && row.weight !== undefined)
    .map(row => ({
      bowl: row.bowl,
      weight: row.weight,
    }))

  if (!items.length) {
    errorMessage.value = 'Informe pelo menos um valor de peso para salvar.'
    return
  }

  isSubmitting.value = true

  try {
    const payload = {
      entry_type: entryType.value,
      observed_at: toUtcISOStringOrUndefined(observedAt.value),
      items,
    }

    await monitoringService.bulkCreateLogs(payload)
    successMessage.value = 'Logs cadastrados com sucesso.'

    // Mantém os valores para referência, mas você poderia limpar se preferir
  }
  catch (error: any) {
    const data = error?.response?._data
    if (data && data.errors) {
      errorMessage.value = 'Erro ao salvar alguns logs. Verifique os valores e tente novamente.'
    }
    else {
      errorMessage.value = data?.detail || 'Erro ao salvar logs.'
    }
  }
  finally {
    isSubmitting.value = false
  }
}

onMounted(() => {
  loadData()
})

definePageMeta({
  title: 'Cadastro em massa de logs de água',
})
</script>

<template>
  <VRow>
    <VCol cols="12">
      <VCard>
        <VCardTitle>
          Cadastro de logs de água para todos os potes
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
            Registrando logs para os potes do animal:
            <strong>{{ selectedAnimal.name }}</strong>
          </VAlert>

          <div
            v-if="isLoading"
            class="d-flex justify-center py-8"
          >
            <VProgressCircular
              indeterminate
              color="primary"
            />
          </div>

          <div v-else>
            <VRow class="mb-4">
              <VCol
                cols="12"
                md="4"
              >
                <VSelect
                  :id="useId()"
                  v-model="entryType"
                  :items="entryTypeOptions"
                  label="Tipo de lançamento"
                />
              </VCol>

              <VCol
                cols="12"
                md="4"
              >
                <VTextField
                  :id="useId()"
                  v-model="observedAt"
                  label="Data e hora (opcional)"
                  type="datetime-local"
                  hint="Se não informado, será usada a data/hora atual"
                  persistent-hint
                />
              </VCol>
            </VRow>

            <div v-if="!bowls.length" class="text-medium-emphasis">
              Nenhum pote cadastrado para este animal.
            </div>

            <div v-else>
              <VTable>
                <thead>
                  <tr>
                    <th class="text-left">
                      Pote
                    </th>
                    <th class="text-left">
                      Tipo
                    </th>
                    <th class="text-left">
                      Peso (ml)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="row in logRows"
                    :key="row.bowl"
                  >
                    <td>
                      {{ row.name }}
                      <VChip
                        v-if="row.is_reference"
                        size="x-small"
                        color="info"
                        label
                        class="ms-2"
                      >
                        Referência
                      </VChip>
                    </td>
                    <td>
                      <span>
                        {{ entryType === 'refill' ? 'Troca / Abastecimento' : 'Leitura de Consumo' }}
                      </span>
                    </td>
                    <td style="max-width: 160px;">
                      <VTextField
                        v-model="row.weight"
                        type="number"
                        density="compact"
                        hide-details
                        suffix="ml"
                      />
                    </td>
                  </tr>
                </tbody>
              </VTable>

              <div class="d-flex justify-end mt-4">
                <VBtn
                  color="primary"
                  :loading="isSubmitting"
                  :disabled="!hasAnyValue || isSubmitting"
                  @click="handleSubmit"
                >
                  Salvar logs
                </VBtn>
              </div>
            </div>
          </div>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>
</template>

