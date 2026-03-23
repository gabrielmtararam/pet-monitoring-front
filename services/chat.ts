import { $api } from '@/utils/api'

export interface ChatResponse {
  response: string
}

export const chatService = {
  async sendMessage(prompt: string, animalId?: number) {
    return await $api<ChatResponse>('/api/monitoring/chat/', {
      method: 'POST',
      body: {
        prompt,
        animal_id: animalId,
      },
    })
  },
}
