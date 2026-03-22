<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const auth = useAuthStore()

const isLoading = ref(false)
const errorMessage = ref('')

const form = ref({
  email: '',
  password: '',
  remember: false,
})

const isPasswordVisible = ref(false)

const handleLogin = async () => {
  isLoading.value = true
  errorMessage.value = ''

  try {
    await auth.login({
      email: form.value.email,
      password: form.value.password,
    })
    router.push('/')
  }
  catch (error: any) {
    errorMessage.value = error.response?.data?.detail || 'Erro ao realizar login.'
  }
  finally {
    isLoading.value = false
  }
}

definePageMeta({ layout: 'blank' })
</script>

<template>
  <div class="auth-wrapper d-flex align-center justify-center pa-4">
    <div class="position-relative my-sm-16">
      <!-- 👉 Auth Card -->
      <VCard
        class="auth-card"
        max-width="460"
        :class="$vuetify.display.smAndUp ? 'pa-6' : 'pa-0'"
      >
        <VCardItem class="justify-center">
          <NuxtLink
            to="/"
            class="app-logo"
          >
            <!-- eslint-disable vue/no-v-html -->
            <div
              class="d-flex"
              v-html="logo"
            />
            <h1 class="app-logo-title">
              Monitoramento Vet
            </h1>
          </NuxtLink>
        </VCardItem>

        <VCardText>
          <h4 class="text-h4 mb-1">
            Bem vindo!
          </h4>
          <p class="mb-0">
            Faça login na sua conta e comece a utilizar o sistema.
          </p>
        </VCardText>

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
          <VForm @submit.prevent="handleLogin">
            <VRow>
              <!-- email -->
              <VCol cols="12">
                <VTextField
                  :id="useId()"
                  v-model="form.email"
                  autofocus
                  label="Email"
                  type="email"
                  placeholder="johndoe@email.com"
                />
              </VCol>

              <!-- password -->
              <VCol cols="12">
                <VTextField
                  :id="useId()"
                  v-model="form.password"
                  label="Senha"
                  placeholder="············"
                  :type="isPasswordVisible ? 'text' : 'password'"
                  autocomplete="password"
                  :append-inner-icon="isPasswordVisible ? 'bx-hide' : 'bx-show'"
                  @click:append-inner="isPasswordVisible = !isPasswordVisible"
                />

                <div class="d-flex align-center justify-space-between flex-wrap my-6">
                  <a
                    class="text-primary"
                    href="javascript:void(0)"
                  >
                    Esqueceu a senha?
                  </a>
                </div>

                <!-- login button -->
                <VBtn
                  block
                  type="submit"
                >
                  Entrar
                </VBtn>
              </VCol>

              <!-- create account -->
              <VCol
                cols="12"
                class="text-body-1 text-center"
              >
                <span class="d-inline-block">
                  Novo no nosso sistema?
                </span>
                <NuxtLink
                  class="text-primary ms-1 d-inline-block text-body-1"
                  to="/register"
                >
                  Crie uma conta
                </NuxtLink>
              </VCol>
            </VRow>
          </VForm>
        </VCardText>
      </VCard>
    </div>
  </div>
</template>

<style lang="scss">
@use "@core/scss/template/pages/page-auth";
</style>
