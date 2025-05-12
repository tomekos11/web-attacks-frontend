<template>
  <div class="items-center justify-evenly full-height full-width q-pa-md" style="display: inline-grid">
    <h1 style="font-size: 30px; line-height: normal">Error-Based SQL Injection</h1>

    <q-card bordered flat>
      <q-card-section>
        <p class="text-bold">
          W tym przykładzie zobaczysz, jak błędy SQL mogą ujawnić wewnętrzne szczegóły bazy danych.
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

      <q-card-section v-if="sqlError">
        <p class="text-warning text-bold">💥 Błąd SQL:</p>
        <pre>{{ sqlError }}</pre>
      </q-card-section>
    </q-card>

    <q-list bordered class="rounded-borders q-mt-lg">
      <q-expansion-item expand-separator icon="question_mark" label="Pokaż podpowiedź">
        <q-card style="max-width: 600px">
          <q-card-section>
            <p>Spróbuj w polu login użyć payloadu generującego błąd:</p>
            <ul>
              <li>
                <pre><code>' AND not_a_function() --</code></pre>
                <p>➡️ Błąd: <code>no such function: not_a_function</code></p>
              </li>
              <li>
                <pre><code>' AND (SELECT * FROM (SELECT 1, 2) AS sub) --</code></pre>
                <p>➡️ Błąd: <code>sub-select returns 2 columns - expected 1</code></p>
              </li>
              <li>
                <pre><code>' AND (SELECT *) --</code></pre>
                <p>➡️ Błąd: <code>no tables specified</code></p>
              </li>
              <li>
                <pre><code>' AND (SELECT 1) = (SELECT 2) FROM (SELECT 1) --</code></pre>
                <p>➡️ Błąd: <code>near "FROM": syntax error</code></p>
              </li>
            </ul>
          </q-card-section>
        </q-card>
      </q-expansion-item>

      <q-expansion-item expand-separator icon="warning" label="Dlaczego jest to niebezpieczne?">
        <q-card style="max-width: 600px">
          <q-card-section>
            <p><strong>Error-Based SQL Injection</strong> wykorzystuje komunikaty o błędach do wyciągania informacji z
              bazy danych.</p>
            <p>Jeśli serwer nie filtruje błędów SQL, napastnik może:</p>
            <ul>
              <li>Poznać strukturę bazy (liczbę kolumn, nazwy tabel)</li>
              <li>Wydobywać wartości z SELECT-ów (poprzez błędy)</li>
              <li>Eksploitować backend przez manipulację zapytaniami</li>
            </ul>
          </q-card-section>
        </q-card>
      </q-expansion-item>
      <q-expansion-item expand-separator icon="code" label="Przykład podatnego kodu (backend)">
        <q-card style="max-width: 700px">
          <q-card-section>
            <p>Oto przykład uproszczonego kodu backendowego w Node.js z użyciem SQLite:</p>
            <pre><code>
// NIEBEZPIECZNE! Wstrzykiwanie bez walidacji:
const query = `SELECT * FROM users WHERE username = '${req.body.username}' AND password = '${req.body.password}'`

db.get(query, (err, row) => {
  if (err) {
    res.status(500).json({ error: err.message })  // Tu ujawniany jest błąd SQL
  } else if (row) {
    res.json({ success: true, user: row })
  } else {
    res.status(401).json({ success: false })
  }
})
      </code></pre>

            <p><strong>Dlaczego to jest złe?</strong></p>
            <ul>
              <li>Parametry od użytkownika są wstrzykiwane bez walidacji.</li>
              <li>Komunikaty o błędach są zwracane w odpowiedzi – to umożliwia atakującemu analizę błędów SQL.</li>
              <li>Brak użycia przygotowanych zapytań (prepared statements).</li>
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

const username = ref<string>('')
const password = ref<string>('')

const loginAttempted = ref(false)
const loginSuccess = ref(false)
const sqlError = ref<string | null>(null)

const handleLogin = async () => {
  loginAttempted.value = true
  sqlError.value = null

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
  } catch (error) {
    loginSuccess.value = false
    sqlError.value = error?.response?.data?.error || 'Nieznany błąd'
  }
}
</script>
