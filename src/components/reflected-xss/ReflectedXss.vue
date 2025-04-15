<template>
  <div
    class="items-center justify-evenly full-height full-width q-pa-md"
    style="display: inline-grid"
  >
    <h1 style="font-size: 30px; line-height: normal">Witaj na prezentacji Reflected XSS</h1>

    <q-card bordered flat>
      <q-card-section>
        <p class="text-bold">
          Spróbuj znaleźć podatność. Jeśli Ci się nie uda, możesz posiłkować się sekcją "Pokaż
          podpowiedź", w której jest napisane jak zrealizować atak.
        </p>

        <template v-if="name">
          <p>Witaj, <span v-html="name"></span>!</p>
          <q-btn
            label="Zmień podane imie"
            style="width: fit-content"
            color="primary"
            @click="resetName"
          />
        </template>
        <div v-else>
          Podaj swoje imię, aby otrzymać powitanie.
          <q-input
            v-model="newName"
            label="Wpisz swoje imie"
            outlined
            class="q-my-md"
            style="width: 20%; min-width: min(200px, 100%)"
          />
          <q-btn label="Zatwierdź swoje imie" @click="confirmName" />
        </div>
      </q-card-section>
    </q-card>

    <q-list bordered class="rounded-borders q-mt-lg">
      <q-expansion-item expand-separator icon="question_mark" label="Pokaż podpowiedź">
        <q-card style="max-width: 600px">
          <q-card-section>
            Do linku swojej przeglądarki wklej te wartość: <br />
            {{ dangerousLink }}
            <q-btn icon="content_copy" size="sm" class="q-ml-sm" color="primary" @click="copyFile">
              <q-tooltip> Skopiuj link </q-tooltip>
            </q-btn>
          </q-card-section>
        </q-card>
      </q-expansion-item>

      <q-expansion-item
        expand-separator
        icon="question_mark"
        label="Dlaczego jest to ultra niebezpieczne"
      >
        <q-card style="max-width: 600px">
          <q-card-section>
            <ol>
              <li>
                Wyobraź sobie, że znajomy wysyła do Ciebie link do jakiejś zaufanej strony, na którą
                wchodzisz codziennie, np. facebook lub twitter.
              </li>
              <li>
                Link, który wysłał jest długi, ale niezbyt Cie to interesuje może to akurat fajny
                post o pieskach.
              </li>
              <li style="overflow-wrap: anywhere">
                Link wygląda mniej więcej tak: <br /><br />

                <q-card class="bg-grey-2">
                  <q-card-section>
                    https://facebook.com/posts?user_id=12345&post_id=67890&ref=homepage&session_token=abc123xyz456&redirect_url=https%3A%2F%2Fmalicious-website.com%2F&search_query=%3Cscript%3Ealert%28%27XSS%27%29%3C%2Fscript%3E&sort_by=date&lang=pl&filters=%7B%22type%22%3A%22image%22%2C%22privacy%22%3A%22public%22%7D&utm_source=email&utm_medium=referral&utm_campaign=security_test&device_type=mobile&app_version=1.2.3&location=USA%2C+California
                  </q-card-section>
                </q-card>
              </li>
              <li style="overflow-wrap: anywhere">
                Na pierwszy rzut oka wszystko wygląda dobrze, jednak jeśli przyjrzymy się dokładniej
                linkowi to możemy zauwazyć<br /><br />
                <q-card class="bg-grey-2">
                  <q-card-section>
                    https://facebook.com/posts?user_id=12345&post_id=67890&ref=homepage&session_token=abc123xyz456&redirect_url=https%3A%2F%2Fmalicious-website.com%2F&<b>search_query=%3Cscript%3Ealert%28%27XSS%27%29%3C%2Fscript%3E</b>&sort_by=date&lang=pl&filters=%7B%22type%22%3A%22image%22%2C%22privacy%22%3A%22public%22%7D&utm_source=email&utm_medium=referral&utm_campaign=security_test&device_type=mobile&app_version=1.2.3&location=USA%2C+California
                  </q-card-section>
                </q-card>
              </li>
              <li>
                Wchodząc na ten link w naszej przeglądarce dajemy hakerowi potencjalnie wszystkie
                dane o sobie, w tym token sesyjny, którego haker może użyć by zalogować się na nasze
                konto i wysyłać wiadomości np. do naszej rodziny z prośbami o pieniądze.
              </li>
            </ol>
          </q-card-section>
        </q-card>
      </q-expansion-item>

      <q-expansion-item expand-separator icon="lock" label="Jak się bronić przed Reflected XSS">
        <q-card style="max-width: 600px">
          <q-card-section>
            <ul>
              <li>
                Unikaj używania <code>innerHTML</code> i innych metod, które umożliwiają wstawianie
                niesanitowanego HTML lub JavaScript, np. <code>document.write()</code>,
                <code>eval()</code>.
              </li>
              <li>
                Upewnij się, że dane przekazywane w parametrach URL (query parameters) oraz inne
                elementy, takie jak <code>localStorage</code> i <code>cookies</code>, są odpowiednio
                walidowane i nie zawierają niebezpiecznych skryptów.
              </li>
              <li>
                Korzystaj z bezpiecznych metod wstawiania tekstu, np.
                <code>textContent</code> zamiast <code>innerHTML</code>, aby zapobiec interpretacji
                HTML i JavaScript.
              </li>
              <li>
                Implementuj <strong>Content Security Policy (CSP)</strong>, aby ograniczyć możliwość
                wykonania nieautoryzowanego kodu JavaScript.
              </li>
              <li>
                Waliduj i "escapuj" wszystkie dane wejściowe użytkownika przed ich wyświetleniem na
                stronie.
              </li>
              <li>
                Regularnie testuj aplikację pod kątem podatności na XSS, np. korzystając z narzędzi
                do analizy bezpieczeństwa.
              </li>
            </ul>
          </q-card-section>
        </q-card>
      </q-expansion-item>
    </q-list>
  </div>
</template>

<script setup lang="ts">
import { Notify } from 'quasar'
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const name = ref(route.query.name)

const newName = ref('')

const domain = window.location.origin

const dangerousLink = domain + '/reflected-xss?name=<img%20src=a%20onerror=alert(1)>'

const confirmName = () => {
  router.replace({
    query: {
      name: newName.value,
    },
  })

  name.value = newName.value
}

const resetName = () => {
  router.replace({
    query: {
      name: undefined,
    },
  })

  name.value = undefined
  newName.value = ''
}

const copyFile = async () => {
  try {
    await navigator.clipboard.writeText(dangerousLink)
    Notify.create({
      type: 'positive',
      message: 'Poprawnie skopiowano tekst',
    })
  } catch (err) {
    console.error(err)
    Notify.create({
      type: 'positive',
      message: 'Nie udało się skopiować tekstu',
    })
  }
}
</script>

<style scoped>
li {
  margin-bottom: 10px;
}
</style>
