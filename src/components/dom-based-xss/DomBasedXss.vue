<template>
  <div
    class="items-center justify-evenly full-height full-width q-pa-md"
    style="display: inline-grid"
  >
    <h1 style="font-size: 30px; line-height: normal">Witaj na prezentacji DOM-Based XSS</h1>

    <q-card bordered flat>
      <q-card-section>
        <p class="text-bold">
          Spróbuj znaleźć podatność. Jeśli Ci się nie uda, możesz posiłkować się sekcją "Pokaż
          podpowiedź", w której jest napisane jak zrealizować atak.
        </p>

        <q-form @submit="submitFeedback">
          <q-input
            v-model.trim="email"
            type="email"
            label="Email"
            outlined
            class="q-my-md"
            style="width: 40%; min-width: min(300px, 100%)"
          />

          <q-input
            v-model="feedback"
            label="Podziel się swoją opinią na temat strony"
            outlined
            class="q-my-md"
            style="width: 40%; min-width: min(300px, 100%)"
          />
          <q-btn color="primary" type="submit" label="Wyślij opinię" />
        </q-form>
      </q-card-section>
    </q-card>

    <q-card bordered flat class="q-mt-md" v-if="submittedEmail">
      <q-card-section>
        <p>Odpowiedź wyślemy na podany przez Ciebie email:</p>
        <p v-html="submittedEmail"></p>

        <p v-html="submittedFeedback"></p>
      </q-card-section>
    </q-card>

    <q-list bordered class="rounded-borders q-mt-lg">
      <q-expansion-item expand-separator icon="question_mark" label="Pokaż podpowiedź">
        <q-card style="max-width: 600px">
          <q-card-section>
            Wpisz w pole opinii poniższy kod i wyślij: <br />
            <code>&lt;script&gt;alert('XSS')&lt;/script&gt;</code>
          </q-card-section>
        </q-card>
      </q-expansion-item>
    </q-list>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const email = ref('')
const feedback = ref('')
const submittedEmail = ref('')
const submittedFeedback = ref('')

const submitFeedback = () => {
  submittedEmail.value = email.value
  submittedFeedback.value = feedback.value
}
</script>

<style scoped>
li {
  margin-bottom: 10px;
}
</style>
