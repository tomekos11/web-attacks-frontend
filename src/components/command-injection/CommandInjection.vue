<template>
  <div class="items-center justify-evenly full-height full-width q-pa-md" style="display: inline-grid">
    <h1 style="font-size: 30px; line-height: normal">Command Injection</h1>

    <q-card bordered flat>
      <q-card-section>
        <p class="text-bold">
          W tym przykładzie zobaczysz, jak atak Command Injection pozwala na wykonanie nieautoryzowanych komend na serwerze.
        </p>

        <q-form @submit.prevent="handlePing">
          <q-input
            v-model.trim="hostname"
            label="Host (payload Command Injection)"
            outlined
            class="q-my-md"
            style="width: 40%; min-width: min(300px, 100%)"
          />

          <q-btn color="primary" type="submit" label="Pinguj" />
        </q-form>
      </q-card-section>
    </q-card>

    <q-card bordered flat class="q-mt-md" v-if="pingAttempted">
      <q-card-section>
        <p v-if="pingSuccess" class="text-positive text-bold">
          ✅ Komenda wykonana pomyślnie!
          <code> {{ data }} </code>
        </p>

        <p v-else class="text-negative text-bold">
          ❌ Błąd w wykonaniu komendy.
        </p>
      </q-card-section>

      <q-card-section v-if="commandError">
        <p class="text-warning text-bold">💥 Błąd komendy:</p>
        {{ commandError }}
      </q-card-section>
    </q-card>

    <q-list bordered class="rounded-borders q-mt-lg">
      <q-expansion-item expand-separator icon="question_mark" label="Pokaż podpowiedź">
        <q-card style="max-width: 600px">
          <q-card-section>
            <p>Spróbuj w polu host użyć payloadu generującego błąd:</p>
            <ul>
              <li>
                <code >localhost&&dir</code>
                <p>➡️ Zwróci listę plików w katalogu, jeśli serwer pozwala na komendy shellowe.</p>
              </li>
              <li>
                <pre><code>localhost&&type database.db</code></pre>
                <p>Zwroc zawartosc database.db</p>
              </li>
            </ul>
          </q-card-section>
        </q-card>
      </q-expansion-item>

      <q-expansion-item expand-separator icon="warning" label="Dlaczego jest to niebezpieczne?">
        <q-card style="max-width: 600px">
          <q-card-section>
            <p><strong>Command Injection</strong> pozwala atakującym na wykonanie nieautoryzowanych komend na serwerze, co może prowadzić do uzyskania dostępu do wrażliwych danych.</p>
            <p>Jeśli aplikacja wykonuje komendy shellowe z nieodpowiednio filtrowanymi danymi wejściowymi, napastnik może:</p>
            <ul>
              <li>Uzyskać dostęp do plików systemowych</li>
              <li>Wykonać polecenia systemowe, które mogą uszkodzić serwer</li>
              <li>Uzyskać dostęp do kont użytkowników serwera</li>
            </ul>
          </q-card-section>
        </q-card>
      </q-expansion-item>
    </q-list>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { api } from 'src/boot/axios'

const hostname = ref<string>('')

const pingAttempted = ref(false)
const pingSuccess = ref(false)
const commandError = ref<string | null>(null)
const data = ref<string>('')

const handlePing = async () => {
  pingAttempted.value = true
  commandError.value = null

  try {
    const response = await api.get(
      '/ping',
      {
        params: {
          name: hostname.value,
        },
        withCredentials: true,
      }
    )
    data.value = response.data
    pingSuccess.value = response.status === 200
  } catch (error: any) {
    pingSuccess.value = false
    commandError.value = error?.response?.data?.error || 'Nieznany błąd'
  }
}
</script>
