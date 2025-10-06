<template>
  <div class="items-center justify-evenly full-height full-width q-pa-md" style="display: inline-grid">
    <h1 style="font-size: 30px; line-height: normal">Command Injection</h1>

    <q-card bordered flat>
      <q-card-section>
        <p class="text-bold">
          W tym przykładzie zobaczysz, jak atak Command Injection pozwala na wykonanie nieautoryzowanych komend na
          serwerze.
        </p>

        <q-form @submit.prevent="handlePing">
          <q-input v-model.trim="hostname" label="Host (payload Command Injection)" outlined class="q-my-md"
            style="width: 40%; min-width: min(300px, 100%)" />

          <q-btn color="primary" type="submit" label="Pinguj" />
        </q-form>
      </q-card-section>
    </q-card>

    <q-card bordered flat class="q-mt-md" v-if="pingAttempted">
      <q-card-section>
        <p v-if="pingSuccess" class="text-positive text-bold">
          ✅ Komenda wykonana pomyślnie!
        <pre>{{ data }}</pre>
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
            <p>Spróbuj w polu host użyć payloadu generującego błąd lub wykonującego komendy systemowe:</p>
            <ul>
              <li>
                <code>localhost&&dir</code>
                <p>➡️ Zwróci listę plików w katalogu, jeśli serwer pozwala na wykonanie komend shellowych.</p>
              </li>
              <li>
                <pre><code>localhost&&type database.db</code></pre>
                <p>➡️ Zwróci zawartość pliku <code>database.db</code>.</p>
              </li>
              <li>
                <code>localhost&&ping 127.0.0.1 -n 3</code>
                <p>➡️ Wykonuje ping do lokalnego hosta 3 razy, co może opóźnić odpowiedź serwera (test opóźnienia).</p>
              </li>
              <li>
                <code>localhost&&ipconfig</code>
                <p>➡️ Wyświetla konfigurację sieciową maszyny, na której działa serwer.</p>
              </li>
              <li>
                <code>localhost&&tasklist</code>
                <p>➡️ Pokazuje listę uruchomionych procesów systemu Windows.</p>
              </li>
              <li>
                <code>localhost&&set</code>
                <p>➡️ Wyświetla wszystkie zmienne środowiskowe serwera.</p>
              </li>
              <li>
                <code>localhost&&echo test > test.txt</code>
                <p>➡️ Tworzy plik <code>test.txt</code> z zawartością <code>test</code> w katalogu, z którego działa
                  serwer.</p>
              </li>
              <li>
                <code>localhost&&del test.txt</code>
                <p>➡️ Usuwa plik <code>test.txt</code> (jeśli istnieje).</p>
              </li>
              <li>
                <code>localhost&&dir %TEMP%</code>
                <p>➡️ Wyświetla zawartość katalogu tymczasowego użytkownika serwera.</p>
              </li>
              <li>
                <code>localhost&&cd</code>
                <p>➡️ Pokazuje aktualny katalog roboczy serwera.</p>
              </li>
              <li>
                <code>localhost&&ping 127.0.0.1 -n 6 > nul</code>
                <p>➡️ Opóźnia odpowiedź serwera o około 5 sekund (ping 6 razy, ignorując wyjście).</p>
              </li>
              <li>
                <code>localhost&&dir | findstr .txt</code>
                <p>➡️ Wyświetla tylko pliki z rozszerzeniem <code>.txt</code> w katalogu (przez filtr
                  <code>findstr</code>).
                </p>
              </li>
              <li>
                <code>localhost&&start calc.exe</code>
                <p>➡️ Próba uruchomienia kalkulatora Windows (jeśli serwer ma GUI i pozwala na to).</p>
              </li>
              <li>
                <code>localhost&&whoami</code>
                <p>➡️ Pokazuje nazwę użytkownika, pod którym działa serwer.</p>
              </li>
              <li>
                <code>localhost&&reg query HKLM\Software</code>
                <p>➡️ Wyświetla klucze rejestru Windows (potrzebne odpowiednie uprawnienia).</p>
              </li>
              <li>
                <code>localhost&&powershell Get-Process</code>
                <p>➡️ Uruchamia polecenie PowerShell i wyświetla listę procesów.</p>
              </li>
            </ul>

          </q-card-section>
        </q-card>
      </q-expansion-item>

      <q-expansion-item expand-separator icon="bug_report" label="Kiedy pojawia się podatność na Command Injection?">
        <q-card style="max-width: 600px">
          <q-card-section>
            <p>Podatność na <strong>Command Injection</strong> pojawia się, gdy aplikacja wykonuje polecenia systemowe z
              niewystarczająco zabezpieczonych danych wejściowych użytkownika. Przykłady:</p>
            <ul>
              <li>
                <strong>Przyjmowanie nazwy hosta lub adresu IP do pingowania:</strong>
                <br>np. pole <code>host</code> w formularzu, które jest bezpośrednio przekazywane do komendy shellowej
                typu <code>ping {host}</code>.
              </li>
              <li>
                <strong>Przesyłanie nazwy pliku do wyświetlenia zawartości:</strong>
                <br>np. <code>type {filename}</code> lub <code>cat {filename}</code> bez filtrowania, co pozwala na
                dołączenie dodatkowych komend.
              </li>
              <li>
                <strong>Generowanie raportów lub backupów z parametrami użytkownika:</strong>
                <br>np. wykonywanie <code>tar -czf backup.tar.gz {directory}</code> gdzie <code>{directory}</code>
                pochodzi od użytkownika i można dodać operator `;` lub `&&` do wykonania kolejnych poleceń.
              </li>
              <li>
                <strong>Uruchamianie poleceń systemowych na podstawie danych z API lub URL:</strong>
                <br>np. endpoint, który przyjmuje parametr i bezpośrednio przekazuje go do shell'a, np.
                <code>system("ls " + param)</code>.
              </li>
              <li>
                <strong>Brak sanitacji i escapowania znaków specjalnych takich jak ; & | ` $ ( )</strong>, które
                umożliwiają dołączenie dodatkowych poleceń.
              </li>
            </ul>
            <p>Wszystkie te przypadki mogą skutkować wykonaniem nieautoryzowanych komend, np. pobraniem plików,
              modyfikacją danych lub nawet przejęciem serwera.</p>
          </q-card-section>
        </q-card>
      </q-expansion-item>


      <q-expansion-item expand-separator icon="warning" label="Dlaczego jest to niebezpieczne?">
        <q-card style="max-width: 600px">
          <q-card-section>
            <p><strong>Command Injection</strong> pozwala atakującym na wykonanie nieautoryzowanych komend na serwerze,
              co może prowadzić do uzyskania dostępu do wrażliwych danych.</p>
            <p>Jeśli aplikacja wykonuje komendy shellowe z nieodpowiednio filtrowanymi danymi wejściowymi, napastnik
              może:</p>
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
