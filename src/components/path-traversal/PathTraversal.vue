<template>
  <div class="items-center justify-evenly full-height full-width q-pa-md" style="display: inline-grid">
    <h1 style="font-size: 30px; line-height: normal">Directory Traversal</h1>

    <q-card bordered flat>
      <q-card-section>
        <p class="text-bold">
          W tym przykładzie zobaczysz, jak Directory Traversal umożliwia odczyt plików spoza dozwolonego katalogu.
        </p>

        <q-form @submit.prevent="handleReadFile">
          <q-input v-model.trim="filename" label="Nazwa pliku (payload)" outlined class="q-my-md"
            style="width: 40%; min-width: min(300px, 100%)" />

          <q-btn color="primary" type="submit" label="Pobierz plik" />
        </q-form>
      </q-card-section>
    </q-card>

    <q-card bordered flat class="q-mt-md" v-if="fileAttempted">
      <q-card-section>
        <p v-if="fileSuccess" class="text-positive text-bold">
          ✅ Plik odczytany pomyślnie:
        </p>

        <p v-else class="text-negative text-bold">
          ❌ Nie udało się odczytać pliku.
        </p>
      </q-card-section>

      <q-card-section v-if="fileContent">
        <pre style="max-width: 800px; white-space: pre-wrap; word-wrap: break-word">{{ fileContent }}</pre>
      </q-card-section>
    </q-card>

    <!-- 🔁 ZAMIANA / NADPISANIE PLIKU -->
    <q-card bordered flat class="q-mt-xl">
      <q-card-section>
        <p class="text-bold">🔁 Zamiana pliku (Write + Path Traversal)</p>
        <q-form @submit.prevent="handleWriteFile">
          <q-input v-model="writeFilename" label="Nazwa pliku (np. ../.env)" outlined class="q-my-md"
            style="width: 40%; min-width: min(300px, 100%)" />
          <q-input v-model="writeContent" type="textarea" label="Zawartość pliku" autogrow outlined class="q-mb-md"
            style="max-width: 600px" />
          <q-btn color="negative" type="submit" label="Zapisz plik" />
        </q-form>
        <p v-if="writeResult" class="q-mt-sm">
          {{ writeResult }}
        </p>
      </q-card-section>
    </q-card>


    <q-list bordered class="rounded-borders q-mt-lg">
      <q-expansion-item expand-separator icon="question_mark" label="Pokaż podpowiedź">
        <q-card style="max-width: 600px">
          <q-card-section>
            <p>Spróbuj użyć payloadów takich jak:</p>
            <ul>
              <li><code>sekret.txt</code></li>
              <li><code>../package.json</code></li>
              <li><code>../server.ts</code></li>
              <li><code>../../.env</code></li>
            </ul>
            <p>➡️ Jeśli aplikacja nie filtruje ścieżek, możliwe jest odczytanie plików spoza katalogu
              <code>files/</code>.
            </p>
          </q-card-section>
        </q-card>
      </q-expansion-item>

      <q-expansion-item expand-separator icon="warning" label="Dlaczego jest to niebezpieczne?">
        <q-card style="max-width: 600px">
          <q-card-section>
            <p><strong>Directory Traversal</strong> pozwala atakującym na dostęp do plików systemowych lub poufnych
              danych.</p>
            <p>Możliwe konsekwencje:</p>
            <ul>
              <li>Odczyt konfiguracji serwera lub aplikacji</li>
              <li>Dostęp do danych użytkowników</li>
              <li>Ekspozycja kluczy API, haseł, itp.</li>
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

const filename = ref<string>('')
const fileContent = ref<string | null>(null)
const fileAttempted = ref(false)
const fileSuccess = ref(false)

const handleReadFile = async () => {
  fileAttempted.value = true
  fileSuccess.value = false
  fileContent.value = null

  try {
    const response = await api.get('/file', {
      params: { file: filename.value },
      withCredentials: true,
    })
    fileContent.value = response.data
    fileSuccess.value = response.status === 200
  } catch (error: any) {
    fileContent.value = error?.response?.data || 'Nieznany błąd'
  }
}

const writeFilename = ref('')
const writeContent = ref('')
const writeResult = ref('')

const handleWriteFile = async () => {
  try {
    const res = await api.post('/write-file', {
      filename: writeFilename.value,
      content: writeContent.value,
    }, { withCredentials: true })

    writeResult.value = res.data
  } catch (err: any) {
    writeResult.value = err?.response?.data || 'Błąd przy zapisie.'
  }
}

</script>
