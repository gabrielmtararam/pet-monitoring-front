<script setup lang="ts">
import { useAnimalsStore } from '@/stores/animals'
import { type DailyFoodConsumption, type DailyWaterConsumption, type WaterBowl, type WaterWeightLog, monitoringService } from '@/services/monitoring'

const bowls = ref<WaterBowl[]>([])
const logs = ref<WaterWeightLog[]>([])

const dailyWater = ref<DailyWaterConsumption[]>([])
const dailyFood = ref<DailyFoodConsumption[]>([])

const selectedBowlId = ref<number | null>(null)

const isLoadingBowls = ref(false)
const isLoadingLogs = ref(false)
const isExporting = ref(false)
const errorMessage = ref('')

const animalsStore = useAnimalsStore()
const selectedAnimalId = computed(() => animalsStore.selectedAnimalId)

const dailyHeaders = [
  { title: 'Data', key: 'date' },
  { title: 'Água (g)', key: 'water' },
  { title: 'Ração (g)', key: 'food' },
]

const dailySummary = computed(() => {
  const map = new Map<string, { date: string; water: number; food: number }>()

  for (const d of dailyWater.value) {
    const item = map.get(d.date) || { date: d.date, water: 0, food: 0 }
    item.water += parseFloat((d.net_consumption as any) ?? '0')
    map.set(d.date, item)
  }

  for (const d of dailyFood.value) {
    const item = map.get(d.date) || { date: d.date, water: 0, food: 0 }
    item.food += parseFloat((d.total_consumption as any) ?? '0')
    map.set(d.date, item)
  }

  return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date))
})

const selectedBowl = computed(() => {
  if (!Array.isArray(bowls.value))
    return null

  return bowls.value.find(bowl => bowl.id === selectedBowlId.value) ?? null
})

const loadBowls = async () => {
  isLoadingBowls.value = true
  errorMessage.value = ''
  try {
    bowls.value = await monitoringService.listBowls()
    if (bowls.value.length && !selectedBowlId.value) {
      selectedBowlId.value = bowls.value[0].id
      await loadLogs()
    }
  }
  catch (error: any) {
    errorMessage.value = error?.response?._data?.detail || 'Erro ao carregar potes de água.'
  }
  finally {
    isLoadingBowls.value = false
  }
}

const handleDownloadJson = async () => {
  if (!selectedAnimalId.value) {
    errorMessage.value = 'Nenhum animal selecionado para exportar.'
    return
  }

  isExporting.value = true
  errorMessage.value = ''

  try {
    const data = await monitoringService.exportMonitoring(selectedAnimalId.value)
    dailyWater.value = data.daily_water_consumptions || []
    dailyFood.value = data.daily_food_consumptions || []
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    const today = new Date().toISOString().slice(0, 10)
    a.href = url
    a.download = `monitoring-animal-${selectedAnimalId.value}-${today}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }
  catch (error: any) {
    errorMessage.value = error?.response?._data?.detail || 'Erro ao exportar dados de monitoramento.'
  }
  finally {
    isExporting.value = false
  }
}

const loadLogs = async () => {
  if (!selectedBowlId.value)
    return

  isLoadingLogs.value = true
  errorMessage.value = ''

  try {
    logs.value = await monitoringService.listLogs(selectedBowlId.value)
  }
  catch (error: any) {
    errorMessage.value = error?.response?._data?.detail || 'Erro ao carregar logs de consumo.'
  }
  finally {
    isLoadingLogs.value = false
  }
}

const handleSelectBowl = async (bowlId: number) => {
  if (selectedBowlId.value === bowlId)
    return

  selectedBowlId.value = bowlId
  await loadLogs()
}

onMounted(() => {
  loadBowls()
})
</script>

<template>
  <VRow>
    <VCol cols="12">
      <h2 class="text-h4 mb-4">
        Monitoramento de Consumo de Água
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
    </VCol>

    <VCol
      cols="12"
      md="4"
    >
      <VCard>
        <VCardTitle>
          Potes cadastrados
        </VCardTitle>

        <VCardText>
          <div
            v-if="isLoadingBowls"
            class="d-flex justify-center py-8"
          >
            <VProgressCircular
              indeterminate
              color="primary"
            />
          </div>
          <div
            v-else-if="!bowls.length"
            class="text-medium-emphasis"
          >
            Nenhum pote cadastrado ainda.
          </div>

          <VList
            v-else
            lines="two"
            density="comfortable"
          >
            <VListItem
              v-for="bowl in bowls"
              :key="bowl.id"
              :title="bowl.name"
              :subtitle="bowl.description || `Animal #${bowl.animal}`"
              :active="bowl.id === selectedBowlId"
              @click="handleSelectBowl(bowl.id)"
            >
              <template #append>
                <VChip
                  v-if="bowl.is_reference"
                  size="x-small"
                  color="info"
                  label
                >
                  Referência
                </VChip>
              </template>
            </VListItem>
          </VList>
        </VCardText>
      </VCard>
    </VCol>

    <VCol
      cols="12"
      md="8"
    >
      <VCard>
        <VCardTitle class="d-flex justify-space-between align-center">
          <span>
            Logs de consumo
            <span v-if="selectedBowl">
              - {{ selectedBowl.name }}
            </span>
          </span>

          <VBtn
            color="primary"
            variant="outlined"
            size="small"
            :loading="isExporting"
            @click="handleDownloadJson"
          >
            Baixar JSON do animal
          </VBtn>
        </VCardTitle>

        <VCardText>
          <div
            v-if="isLoadingLogs"
            class="d-flex justify-center py-8"
          >
            <VProgressCircular
              indeterminate
              color="primary"
            />
          </div>

          <div v-else-if="!selectedBowl">
            <span class="text-medium-emphasis">Selecione um pote para visualizar os logs.</span>
          </div>

          <div v-else-if="!logs.length">
            <span class="text-medium-emphasis">Nenhum log cadastrado para este pote ainda.</span>
          </div>

          <div v-else>
            <VTable>
              <thead>
                <tr>
                  <th class="text-left">
                    Data/hora
                  </th>
                  <th class="text-left">
                    Tipo
                  </th>
                  <th class="text-left">
                    Peso (g)
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="log in logs"
                  :key="log.id"
                >
                  <td>{{ new Date(log.observed_at).toLocaleString() }}</td>
                  <td>
                    <VChip
                      size="small"
                      :color="log.entry_type === 'refill' ? 'primary' : 'success'"
                      label
                    >
                      {{ log.entry_type === 'refill' ? 'Troca / Abastecimento' : 'Leitura de Consumo' }}
                    </VChip>
                  </td>
                  <td>{{ log.weight }}</td>
                </tr>
              </tbody>
            </VTable>
          </div>
        </VCardText>
      </VCard>
    </VCol>

    <VCol
      cols="12"
      class="mt-4"
    >
      <VCard>
        <VCardTitle>
          Consumo diário agregado (água e ração)
        </VCardTitle>

        <VCardText>
          <div v-if="!dailySummary.length">
            <span class="text-medium-emphasis">Clique em &quot;Baixar JSON do animal&quot; para carregar os consumos diários.</span>
          </div>
          <div v-else>
            <VDataTable
              :headers="dailyHeaders"
              :items="dailySummary"
              density="compact"
            >
              <template #item.date="{ item }">
                {{ new Date(item.date).toLocaleDateString() }}
              </template>
              <template #item.water="{ item }">
                {{ item.water.toFixed(2) }}
              </template>
              <template #item.food="{ item }">
                {{ item.food.toFixed(2) }}
              </template>
            </VDataTable>
          </div>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>
</template>
