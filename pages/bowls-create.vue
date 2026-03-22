<script setup lang="ts">
import type { WaterBowl } from '@/services/monitoring'
import { monitoringService } from '@/services/monitoring'
import { useAnimalsStore } from '@/stores/animals'

const router = useRouter()
const animalsStore = useAnimalsStore()

const form = ref<Partial<WaterBowl>>({
  name: '',
  description: '',
  is_reference: false,
})

const isSubmitting = ref(false)
const isLoadingAnimal = ref(true)
const successMessage = ref('')
const errorMessage = ref('')

const rules = {
  required: (value: string | number | undefined | null) => !!value || 'Campo obrigatório',
}

const handleSubmit = async () => {
  if (!animalsStore.selectedAnimalId) {
    errorMessage.value = 'Nenhum animal selecionado para vincular ao pote.'
    return
  }

  isSubmitting.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    await monitoringService.createBowl({
      name: form.value.name || '',
      description: form.value.description || '',
      animal: animalsStore.selectedAnimalId,
      is_reference: !!form.value.is_reference,
    })

    successMessage.value = 'Pote cadastrado com sucesso.'

    router.push('/monitoring')
  }
  catch (error: any) {
    const data = error?.response?._data
    if (data && typeof data === 'object') {
      const firstKey = Object.keys(data)[0]
      errorMessage.value = Array.isArray(data[firstKey]) ? data[firstKey][0] : (data.detail || 'Erro ao cadastrar pote.')
    }
    else {
      errorMessage.value = 'Erro ao cadastrar pote.'
    }
  }
  finally {
    isSubmitting.value = false
  }
}

onMounted(async () => {
  try {
    await animalsStore.ensureSelectedAnimal()
  }
  catch (error: any) {
    errorMessage.value = error.message || 'Não foi possível definir um animal padrão.'
  }
  finally {
    isLoadingAnimal.value = false
  }
})

definePageMeta({
  title: 'Cadastrar pote de água',
})
</script>

<template>
  <VRow>
    <VCol cols="12">
      <VCard>
        <VCardTitle>
          Cadastrar novo pote de água
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
            v-if="animalsStore.selectedAnimal"
            type="info"
            variant="tonal"
            class="mb-4"
            density="compact"
          >
            Cadastrando pote para o animal:
            <strong>{{ animalsStore.selectedAnimal.name }}</strong>
          </VAlert>

          <VForm @submit.prevent="handleSubmit">
            <VRow>
              <VCol
                cols="12"
                md="6"
              >
                <VTextField
                  :id="useId()"
                  v-model="form.name"
                  label="Nome do pote"
                  placeholder="Ex: Sala, Saída, Cozinha"
                  :rules="[rules.required]"
                  required
                />
              </VCol>

              <VCol cols="12">
                <VCheckbox
                  :id="useId()"
                  v-model="form.is_reference"
                  label="Este pote é apenas de referência (evaporação)"
                />
              </VCol>

              <VCol cols="12">
                <VTextarea
                  :id="useId()"
                  v-model="form.description"
                  label="Descrição"
                  placeholder="Localização, observações etc."
                  auto-grow
                  rows="3"
                />
              </VCol>

              <VCol
                cols="12"
                class="d-flex gap-4"
              >
                <VBtn
                  type="submit"
                  :loading="isSubmitting || isLoadingAnimal"
                  :disabled="isLoadingAnimal || !animalsStore.selectedAnimalId"
                >
                  Salvar pote
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

