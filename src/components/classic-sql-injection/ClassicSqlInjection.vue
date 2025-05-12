<template>
  <div class="items-center justify-evenly full-height full-width q-pa-md" style="display: inline-grid">
    <h1 style="font-size: 30px; line-height: normal">Witaj na prezentacji Classic SQL Injection</h1>

    <q-card bordered flat>
      <q-card-section>
        <p class="text-bold">
          Spróbuj zalogować się bez znajomości hasła. Jeśli Ci się nie uda, skorzystaj z sekcji
          "Pokaż podpowiedź".
        </p>

        <q-form @submit.prevent="handleLogin">
          <q-input v-model.trim="username" label="Login" outlined class="q-my-md"
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

      <q-card-section v-if="loginSuccess">
        <p class="text-bold">Dane użytkownika:</p>
        <ul>
          <li><strong>ID:</strong> {{ userStore.userNumber }}</li>
          <li><strong>Login:</strong> {{ userStore.username }}</li>
        </ul>
      </q-card-section>
    </q-card>


    <q-list bordered class="rounded-borders q-mt-lg">
      <q-expansion-item expand-separator icon="question_mark" label="Pokaż podpowiedź">
        <q-card style="max-width: 600px">
          <q-card-section>
            Możesz spróbować zalogować się, wpisując w pole login jedną z poniższych wartości:
            <ul>
              <li><code>' OR 1=1 --</code></li>
              <li><code>' OR username = 'admin' --</code></li>
              <li><code>' OR id = 1 --</code></li>
            </ul>
          </q-card-section>
          <q-card-section>
            <q-select v-model="selectedCondition" :options="conditionOptions" label="Wybierz warunek SQL" outlined
              dense />
            <q-btn label="Użyj wybranego warunku" @click="applyCondition" color="primary" class="q-my-md" />
          </q-card-section>
        </q-card>
      </q-expansion-item>
      <q-expansion-item expand-separator icon="warning" label="Dlaczego jest to niebezpieczne?">
        <q-card style="max-width: 600px">
          <q-card-section>
            <ol>
              <li>
                <strong>Atakujący może ominąć logikę logowania bez znajomości hasła – wystarczy odpowiedni ciąg znaków w
                  polu login.</strong>
                <p>Funkcja <code>loginUnsafe</code> jest podatna, ponieważ bezpośrednio wstawia dane wejściowe do
                  zapytania SQL. Gdy atakujący wprowadzi <code>' OR 1=1 --</code> jako login, zapytanie zmienia się w:
                </p>
                <pre><code>SELECT * FROM users WHERE username = '' OR 1=1 --' AND password = '...'</code></pre>
                <p>Warunek <code>1=1</code> zawsze jest prawdziwy, a część po <code>--</code> jest ignorowana (komentarz
                  SQL). System zwraca pierwszego użytkownika z bazy, zwykle administratora.</p>
                <p class="text-negative">W bezpiecznej wersji <code>login</code> to niemożliwe - najpierw weryfikuje
                  istnienie użytkownika, a potem porównuje zahashowane hasło.</p>
              </li>

              <li>
                <strong>Ujawnienie danych dowolnego użytkownika</strong>
                <p>Atakujący może wykonać:</p>
                <pre><code>SELECT * FROM users WHERE username = '' UNION SELECT * FROM users --'</code></pre>
                <p>To zapytanie łączy wyniki dwóch zapytań, ujawniając wszystkich użytkowników. W bezpiecznej wersji
                  <code>login</code>:
                </p>
                <ul>
                  <li>Zapytania są parametryzowane</li>
                  <li>Zwracany jest tylko jeden użytkownik</li>
                  <li>Hasła są przechowywane jako hashe</li>
                </ul>
              </li>

              <li>
                <strong>Zaawansowane operacje na bazie danych</strong>
                <p>Przykłady niebezpiecznych zapytań:</p>
                <pre><code>' OR 1=1; DROP TABLE users; --</code></pre>
                <pre><code>'; UPDATE users SET role = 'admin' WHERE username = 'atakujący'; --</code></pre>
                <p>Bezpieczna wersja <code>login</code> chroni przed tym poprzez:</p>
                <ul>
                  <li>Użycie ORM/prepared statements</li>
                  <li>Brak bezpośredniej interpolacji ciągów</li>
                  <li>Ograniczone uprawnienia konta DB</li>
                </ul>
              </li>

              <li>
                <strong>Pełne przejęcie systemu</strong>
                <p>W skrajnych przypadkach SQL Injection może pozwolić na:</p>
                <pre><code>'; EXEC xp_cmdshell('format C:'); --</code></pre>
                <p>Różnice w zabezpieczeniach:</p>
                <table class="q-table">
                  <tr>
                    <th><code>loginUnsafe</code></th>
                    <th><code>login</code></th>
                  </tr>
                  <tr>
                    <td>Bezpośrednia interpolacja SQL</td>
                    <td>Parametryzowane zapytania</td>
                  </tr>
                  <tr>
                    <td>Hasła w plaintext</td>
                    <td>BCrypt hashing</td>
                  </tr>
                  <tr>
                    <td>Pełne uprawnienia DB</td>
                    <td>Ograniczone uprawnienia</td>
                  </tr>
                </table>
              </li>
            </ol>
          </q-card-section>
        </q-card>
      </q-expansion-item>

      <q-expansion-item expand-separator icon="lock" label="Jak się bronić przed SQL Injection?">
        <q-card style="max-width: 600px">
          <q-card-section>
            <ul>
              <li>
                <strong>Używaj zapytań przygotowanych (prepared statements)</strong> – frameworki takie jak Laravel,
                Django, czy Spring domyślnie wspierają ten mechanizm.
              </li>
              <li>
                <strong>Waliduj dane wejściowe</strong> – sprawdzaj typ danych, długość, a także ograniczaj
                niebezpieczne znaki.
              </li>
              <li>
                <strong>Nie buduj zapytań SQL przez konkatenację</strong> zmiennych użytkownika:
                <br />
                ❌ <code>SELECT * FROM users WHERE name = '" + username + "'"</code>
              </li>
              <li>
                ✅ Zamiast tego użyj:
                <br />
                <code>SELECT * FROM users WHERE name = ?</code>
              </li>
              <li>
                <strong>Ogranicz uprawnienia użytkownika bazy danych</strong> – aplikacja nie powinna łączyć się jako
                root/admin.
              </li>
              <li>
                <strong>Monitoruj logi i używaj WAF</strong> (Web Application Firewall), aby wykrywać podejrzane
                zapytania.
              </li>
            </ul>
          </q-card-section>
        </q-card>
      </q-expansion-item>
      <q-expansion-item expand-separator icon="code" label="Przykłady błędnych zapytań i ich poprawy">
        <q-card style="max-width: 600px">
          <q-card-section>
            <p>Oto typowe przykłady błędnych zapytań SQL oraz sposoby ich poprawy:</p>
            <ul>
              <li>
                <p><strong>❌ Błędne:</strong></p>
                <code>const query = "SELECT * FROM users WHERE username = '" + username + "' AND password = '" + password + "'"</code>
                <p>🔴 Wrażliwe na SQL Injection – użytkownik może wstrzyknąć dowolny kod SQL.</p>
              </li>
              <li>
                <p><strong>✅ Poprawne:</strong></p>
                <code>const query = "SELECT * FROM users WHERE username = ? AND password = ?"</code>
                <code>db.execute(query, [username, password])</code>
                <p>🟢 Parametryzowane zapytanie chroni przed SQL Injection.</p>
              </li>

              <li>
                <p><strong>❌ Błędne (PHP):</strong></p>
                <pre><code>$sql = "DELETE FROM users WHERE id = $_GET['id']";</code></pre>
                <p>🔴 Atakujący może przekazać <code>?id=1 OR 1=1</code> i usunąć wszystkich użytkowników.</p>
              </li>
              <li>
                <p><strong>✅ Poprawne (PHP - PDO):</strong></p>
                <pre><code>$stmt = $pdo->prepare("DELETE FROM users WHERE id = :id");
$stmt->execute(['id' => $_GET['id']]);</code></pre>
                <p>🟢 Użycie prepared statements zabezpiecza przed wstrzyknięciem kodu SQL.</p>
              </li>

              <li>
                <p><strong>❌ Błędne (Laravel):</strong></p>
                <pre><code>$users = DB::select("SELECT * FROM users WHERE email = '$email'");</code></pre>
              </li>
              <li>
                <p><strong>✅ Poprawne (Laravel):</strong></p>
                <pre><code>$users = DB::select("SELECT * FROM users WHERE email = ?", [$email]);</code></pre>
              </li>
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

const username = ref<string>('') // Login użytkownika
const password = ref<string>('') // Hasło
const loginAttempted = ref<boolean>(false) // Czy próba logowania miała miejsce?
const loginSuccess = ref<boolean>(false) // Czy logowanie się udało?

const userStore = useUserStore()

const conditionOptions = ref([
  { label: "OR 1=1 --", value: "' OR 1=1 --" },
  { label: "OR username = 'admin' --", value: "' OR username = 'admin' --" },
  { label: "OR id = 1 --", value: "' OR id = 1 --" },
])

const selectedCondition = ref<string>('')

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

    await userStore.fetchUserData()
  } catch (error) {
    console.error(error.response || error)
    loginSuccess.value = false
  }
}

const applyCondition = () => {
  if (selectedCondition.value) {
    username.value = selectedCondition.value.value
    password.value = ''
  }
}
</script>
