import { defineStore } from 'pinia'
import { animalsService, type Animal } from '@/services/animals'

export const useAnimalsStore = defineStore('animals', () => {
  const animals = ref<Animal[]>([])
  const isLoading = ref(false)
  const error = ref('')

  const selectedAnimalIdCookie = useCookie<number | null>('selected_animal_id', {
    default: () => null,
  })

  const selectedAnimalId = computed<number | null>({
    get: () => selectedAnimalIdCookie.value,
    set: value => {
      selectedAnimalIdCookie.value = value
    },
  })

  const selectedAnimal = computed<Animal | null>(() => {
    return animals.value.find(animal => animal.id === selectedAnimalId.value) || null
  })

  const hasSelection = computed(() => selectedAnimalId.value !== null)

  async function fetchAnimals() {
    isLoading.value = true
    error.value = ''

    try {
      animals.value = await animalsService.list()
    }
    catch (err: any) {
      error.value = err?.response?._data?.detail || 'Erro ao carregar animais.'
    }
    finally {
      isLoading.value = false
    }
  }

  function selectAnimal(id: number) {
    selectedAnimalId.value = id
  }

  async function ensureSelectedAnimal() {
    if (!animals.value.length) {
      await fetchAnimals()
    }

    if (!animals.value.length) {
      throw new Error('Nenhum animal cadastrado para este usuário.')
    }

    if (selectedAnimalId.value === null) {
      selectedAnimalId.value = animals.value[0].id
    }

    return animals.value.find(animal => animal.id === selectedAnimalId.value) || null
  }

  return {
    animals,
    isLoading,
    error,
    selectedAnimalId,
    selectedAnimal,
    hasSelection,
    fetchAnimals,
    selectAnimal,
    ensureSelectedAnimal,
  }
})

