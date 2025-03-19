<template>
  <q-dialog v-model="isModalOpen">
    <q-card>
      <q-card-section>
        <div class="text-h6">Logowanie do panelu administratora</div>
      </q-card-section>

      <q-card-section>
        <q-form @submit="handleLogin">
          <q-input v-model="username" label="Nazwa użytkownika" autofocus filled required />
          <q-input v-model="password" label="Hasło" type="password" filled required />
          <div class="q-mt-md">
            <q-btn label="Zaloguj się" type="submit" color="primary" />
          </div>
        </q-form>
        <div v-if="errorMessage" class="q-mt-md text-negative">
          {{ errorMessage }}
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Notify } from 'quasar'
import { api } from 'src/boot/axios'

const isModalOpen = defineModel<boolean>()
const username = ref<string>('')
const password = ref<string>('')
const errorMessage = ref<string>('')

const emit = defineEmits(['update-navbar'])

const handleLogin = async () => {
  try {
    errorMessage.value = ''
    const response = await api.post(
      '/login',
      {
        username: username.value,
        password: password.value,
      },
      {
        withCredentials: true,
      },
    )

    if (response.status === 200) {
      Notify.create({
        type: 'positive',
        message: 'Zalogowano pomyślnie!',
      })

      emit('update-navbar')
    }
    isModalOpen.value = false
  } catch (error) {
    console.error(error.response || error) // Wydrukuj pełną odpowiedź błędu
    errorMessage.value = 'Błąd logowania. Sprawdź dane.'
  }
}
</script>

<style scoped>
.q-card {
  width: 400px;
}
</style>
