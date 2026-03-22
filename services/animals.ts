import { $api } from '@/utils/api'

export interface Animal {
  id: number
  name: string
  specie: string
  breed: string
  type?: string
}

interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export const animalsService = {
  async list() {
    const response = await $api<PaginatedResponse<Animal> | Animal[]>('/api/animals/')

    if (Array.isArray(response))
      return response

    return response.results
  },
}

