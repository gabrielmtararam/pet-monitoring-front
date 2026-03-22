<script setup lang="ts">
import { monitoringService } from '@/services/monitoring'

const isLoading = ref(false)
const isProcessing = ref(false)
const isUpdatingMedications = ref(false)
const isProcessingReceitas = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const handleUpdateExams = async () => {
  isLoading.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    const response = await monitoringService.updateExams()
    successMessage.value = response.detail || 'Exames atualizados com sucesso.'
  }
  catch (error: any) {
    errorMessage.value = error?.response?._data?.detail || 'Falha ao atualizar exames.'
  }
  finally {
    isLoading.value = false
  }
}

const handleProcessExams = async () => {
  isProcessing.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    const response = await monitoringService.processExams()
    if (response.success) {
      const extra = response.parameters_created != null
        ? ` ${response.parameters_created} parâmetro(s) extraído(s).`
        : ''
      successMessage.value = (response.detail || 'Exame processado.') + extra
    }
    else {
      errorMessage.value = response.detail || 'Falha ao processar exame.'
      if (response.raw)
        errorMessage.value += ` (resposta: ${response.raw})`
    }
  }
  catch (error: any) {
    errorMessage.value = error?.response?._data?.detail || 'Falha ao processar exames.'
  }
  finally {
    isProcessing.value = false
  }
}

const handleUpdateMedications = async () => {
  isUpdatingMedications.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    const response = await monitoringService.updateMedications() as { detail?: string; created?: number; downloaded?: number }
    let msg = response.detail || 'Medicações atualizadas com sucesso.'
    if (response.created != null || response.downloaded != null) {
      const parts = []
      if (response.created != null) parts.push(`${response.created} receita(s) criada(s)`)
      if (response.downloaded != null) parts.push(`${response.downloaded} arquivo(s) baixado(s)`)
      if (parts.length) msg += ' ' + parts.join(', ') + '.'
    }
    successMessage.value = msg
  }
  catch (error: any) {
    errorMessage.value = error?.response?._data?.detail || 'Falha ao atualizar medicações.'
  }
  finally {
    isUpdatingMedications.value = false
  }
}

const handleProcessReceitas = async () => {
  isProcessingReceitas.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    const response = await monitoringService.processReceitas() as { success?: boolean; detail?: string; indicacoes_created?: number; raw?: string }
    if (response.success) {
      const extra = response.indicacoes_created != null
        ? ` ${response.indicacoes_created} indicação(ões) salva(s).`
        : ''
      successMessage.value = (response.detail || 'Receita processada.') + extra
    }
    else {
      errorMessage.value = response.detail || 'Falha ao processar receita.'
      if (response.raw)
        errorMessage.value += ` (resposta: ${response.raw})`
    }
  }
  catch (error: any) {
    errorMessage.value = error?.response?._data?.detail || 'Falha ao processar receitas.'
  }
  finally {
    isProcessingReceitas.value = false
  }
}

definePageMeta({
  title: 'Exames',
})
</script>

<template>
  <VRow>
    <VCol cols="12">
      <h2 class="text-h4 mb-4">
        Exames
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
    </VCol>

    <VCol
      cols="12"
      md="6"
    >
      <VCard title="Atualizar exames">
        <VCardText>
          <p class="mb-4">
            Clique no botão abaixo para acionar a atualização de exames.
          </p>

          <div class="d-flex flex-wrap gap-2">
            <VBtn
              color="primary"
              :loading="isLoading"
              @click="handleUpdateExams"
            >
              Atualizar exames
            </VBtn>
            <VBtn
              color="primary"
              variant="outlined"
              :loading="isUpdatingMedications"
              @click="handleUpdateMedications"
            >
              Atualizar medicações
            </VBtn>
          </div>
        </VCardText>
      </VCard>
    </VCol>

    <VCol
      cols="12"
      md="6"
    >
      <VCard title="Processar exames">
        <VCardText>
          <p class="mb-4">
            Processa o primeiro exame da lista de arquivos baixados com IA (Gemini) e cadastra tipos, parâmetros e resultados.
          </p>

          <VBtn
            color="secondary"
            :loading="isProcessing"
            @click="handleProcessExams"
          >
            Processar exames
          </VBtn>
        </VCardText>
      </VCard>
    </VCol>

    <VCol
      cols="12"
      md="6"
    >
      <VCard title="Processar receitas">
        <VCardText>
          <p class="mb-4">
            Processa a primeira receita da lista (com arquivo e ainda sem indicações) com IA (Gemini), cadastra remédios novos se necessário e salva as indicações de medicação.
          </p>

          <VBtn
            color="secondary"
            variant="outlined"
            :loading="isProcessingReceitas"
            @click="handleProcessReceitas"
          >
            Processar receitas
          </VBtn>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>
</template>

