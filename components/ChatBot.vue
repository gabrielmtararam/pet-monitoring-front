<script setup lang="ts">
import { ref, nextTick, computed } from 'vue'
import { chatService } from '@/services/chat'
import { useAnimalsStore } from '@/stores/animals'

interface Message {
  text: string
  isUser: boolean
}

const props = defineProps<{
  animalId?: number
}>()

const animalsStore = useAnimalsStore()
const activeAnimalId = computed(() => props.animalId || animalsStore.selectedAnimalId)

const messages = ref<Message[]>([
  { text: 'Olá! Sou seu assistente de monitoramento pet. Como posso ajudar?', isUser: false },
])

const newMessage = ref('')
const isLoading = ref(false)
const isOpen = ref(false)
const chatMessagesRef = ref<HTMLElement | null>(null)

const scrollToBottom = async () => {
  await nextTick()
  if (chatMessagesRef.value)
    chatMessagesRef.value.scrollTop = chatMessagesRef.value.scrollHeight
}

const sendMessage = async () => {
  if (!newMessage.value.trim() || isLoading.value)
    return

  const userText = newMessage.value

  messages.value.push({ text: userText, isUser: true })
  newMessage.value = ''
  isLoading.value = true
  await scrollToBottom()

  try {
    const { response } = await chatService.sendMessage(userText, activeAnimalId.value || undefined)

    messages.value.push({ text: response, isUser: false })
  }
  catch (error) {
    messages.value.push({ text: 'Desculpe, ocorreu um erro ao processar sua pergunta.', isUser: false })
  }
  finally {
    isLoading.value = false
    await scrollToBottom()
  }
}

const toggleChat = () => {
  isOpen.value = !isOpen.value
  if (isOpen.value)
    scrollToBottom()
}
</script>

<template>
  <div class="chatbot-container">
    <!-- Toggle Button -->
    <VBtn
      v-if="!isOpen"
      icon="bx-chat"
      color="primary"
      size="large"
      class="chat-toggle-btn elevation-4"
      @click="toggleChat"
    />

    <!-- Chat Card -->
    <VCard
      v-else
      class="chat-card elevation-12"
      width="350"
      height="500"
    >
      <VToolbar
        color="primary"
        density="compact"
      >
        <VToolbarTitle class="text-subtitle-1">
          Assistente Pet
        </VToolbarTitle>
        <VSpacer />
        <VBtn
          icon="bx-x"
          variant="text"
          @click="isOpen = false"
        />
      </VToolbar>

      <VCardText
        ref="chatMessagesRef"
        class="chat-messages d-flex flex-column pa-4"
      >
        <div
          v-for="(msg, index) in messages"
          :key="index"
          :class="['message-bubble pa-3 mb-2 rounded-lg', msg.isUser ? 'user-message align-self-end bg-primary' : 'bot-message align-self-start bg-grey-lighten-3']"
        >
          {{ msg.text }}
        </div>
        <div
          v-if="isLoading"
          class="bot-message align-self-start pa-3 mb-2 rounded-lg bg-grey-lighten-3"
        >
          <VProgressCircular
            indeterminate
            size="20"
            width="2"
          />
        </div>
      </VCardText>

      <VDivider />

      <VCardActions class="pa-4">
        <VTextarea
          v-model="newMessage"
          placeholder="Pergunte algo..."
          rows="1"
          max-rows="4"
          auto-grow
          hide-details
          variant="outlined"
          density="comfortable"
          class="mr-2"
          @keyup.enter.prevent="sendMessage"
        />
        <VBtn
          icon="bx-send"
          color="primary"
          variant="text"
          :disabled="!newMessage.trim() || isLoading"
          @click="sendMessage"
        />
      </VCardActions>
    </VCard>
  </div>
</template>

<style scoped>
.chatbot-container {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 1000;
}

.chat-card {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-radius: 12px;
}

.chat-messages {
  flex-grow: 1;
  overflow-y: auto;
  background-color: #fcfcfc;
}

.message-bubble {
  max-width: 85%;
  font-size: 0.875rem;
  line-height: 1.4;
  white-space: pre-wrap;
  word-break: break-word;
}

.user-message {
  color: white;
  border-bottom-right-radius: 4px !important;
}

.bot-message {
  color: rgba(0, 0, 0, 0.87);
  border-bottom-left-radius: 4px !important;
}

/* Custom Scrollbar */
.chat-messages::-webkit-scrollbar {
  width: 4px;
}

.chat-messages::-webkit-scrollbar-thumb {
  background: #e0e0e0;
  border-radius: 10px;
}
</style>
