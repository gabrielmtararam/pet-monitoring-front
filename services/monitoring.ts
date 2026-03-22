import { $api } from '@/utils/api'

export interface WaterBowl {
  id: number
  animal: number
  name: string
  description?: string | null
  is_reference?: boolean
}

export interface WaterWeightLog {
  id: number
  bowl: number
  weight: string
  entry_type: 'reading' | 'refill'
  observed_at: string
}

export type WaterLogEntryType = 'reading' | 'refill'

export interface BulkWaterLogItem {
  bowl: number
  weight: string | number
}

export interface BulkWaterLogPayload {
  entry_type: WaterLogEntryType
  observed_at?: string
  items: BulkWaterLogItem[]
}

export interface FoodWeightLog {
  id: number
  animal: number
  brand?: number | null
  type?: number | null
  weight: string
  entry_type: WaterLogEntryType
  observed_at: string
}

export interface FoodBrand {
  id: number
  name: string
}

export interface FoodType {
  id: number
  name: string
}

export interface AnimalDiaryEntry {
  id: number
  animal: number
  text: string
  observed_at: string
}

export interface DailyWaterConsumption {
  id: number
  animal: number
  date: string
  gross_consumption: string
  evaporation: string
  net_consumption: string
  negative_periods: number
  missing_readings: boolean
  created_at: string
}

export interface DailyFoodConsumption {
  id: number
  animal: number
  date: string
  total_consumption: string
  negative_periods: number
  missing_readings: boolean
  created_at: string
}

export interface ExamsUpdateResponse {
  detail: string
}

export interface ExamsProcessResponse {
  success: boolean
  detail: string
  extracted_exam_id?: number
  parameters_created?: number
  exam_type?: string
  raw?: string
}

interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export const monitoringService = {
  async listBowls() {
    const response = await $api<PaginatedResponse<WaterBowl> | WaterBowl[]>('/api/monitoring/bowls/')

    if (Array.isArray(response))
      return response

    return response.results
  },

  async createBowl(payload: { name: string; description?: string; animal: number; is_reference?: boolean }) {
    return await $api<WaterBowl>('/api/monitoring/bowls/', {
      method: 'POST',
      body: payload,
    })
  },

  async listLogs(bowlId?: number) {
    const query = bowlId ? `?bowl_id=${bowlId}` : ''
    const response = await $api<PaginatedResponse<WaterWeightLog> | WaterWeightLog[]>(`/api/monitoring/logs/${query}`)

    if (Array.isArray(response))
      return response

    return response.results
  },

  async bulkCreateLogs(payload: BulkWaterLogPayload) {
    return await $api<WaterWeightLog[]>('/api/monitoring/logs/bulk_create/', {
      method: 'POST',
      body: payload,
    })
  },

  async createFoodLog(payload: { animal: number; weight: string | number; entry_type: WaterLogEntryType; observed_at?: string; brand?: number | null; type?: number | null }) {
    return await $api<FoodWeightLog>('/api/monitoring/food-logs/', {
      method: 'POST',
      body: payload,
    })
  },

  async listFoodBrands() {
    const response = await $api<PaginatedResponse<FoodBrand> | FoodBrand[]>('/api/monitoring/food-brands/')

    if (Array.isArray(response))
      return response

    return response.results
  },

  async listFoodTypes() {
    const response = await $api<PaginatedResponse<FoodType> | FoodType[]>('/api/monitoring/food-types/')

    if (Array.isArray(response))
      return response

    return response.results
  },

  async listDiaryEntries(animalId?: number) {
    const query = animalId ? `?animal_id=${animalId}` : ''
    const response = await $api<PaginatedResponse<AnimalDiaryEntry> | AnimalDiaryEntry[]>(`/api/monitoring/diary-entries/${query}`)

    if (Array.isArray(response))
      return response

    return response.results
  },

  async createDiaryEntry(payload: { animal: number; text: string; observed_at?: string }) {
    return await $api<AnimalDiaryEntry>('/api/monitoring/diary-entries/', {
      method: 'POST',
      body: payload,
    })
  },

  async updateExams() {
    return await $api<ExamsUpdateResponse>('/api/monitoring/exams/update/', {
      method: 'POST',
    })
  },

  async processExams() {
    return await $api<ExamsProcessResponse>('/api/monitoring/exams/process/', {
      method: 'POST',
    })
  },

  async updateMedications() {
    return await $api<{ detail: string }>('/api/monitoring/exams/update-medications/', {
      method: 'POST',
    })
  },

  async processReceitas() {
    return await $api<{ success: boolean; detail: string; indicacoes_created?: number; receita_id?: number; raw?: string }>(
      '/api/monitoring/receitas/process/',
      { method: 'POST' },
    )
  },

  async exportMonitoring(animalId: number) {
    return await $api<{
      animal_id: number
      bowls: WaterBowl[]
      water_logs: WaterWeightLog[]
      food_logs: FoodWeightLog[]
      diary_entries: AnimalDiaryEntry[]
      daily_water_consumptions: DailyWaterConsumption[]
      daily_food_consumptions: DailyFoodConsumption[]
    }>(`/api/monitoring/export/?animal_id=${animalId}`)
  },
}

