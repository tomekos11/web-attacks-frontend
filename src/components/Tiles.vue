<template>
  <q-page class="q-pa-md">
    <h1 style="font-size: 30px; line-height: normal" class="text-center">
      Wybierz rodzaj ataku, który chcesz przetestować
    </h1>
    <div class="tiles-parent justify-center items-center">
      <router-link
        v-for="attack in attacks"
        :key="attack.name"
        :to="{
          name: attack.link,
        }"
        class="q-ma-md tile-card"
      >
        <div class="text-h6 text-center">{{ attack.name }}</div>
      </router-link>
    </div>
  </q-page>
</template>

<script setup lang="ts">
const attacks = [
  { name: 'Stored XSS', description: 'XD', link: 'stored-xss' },
  { name: 'Reflected XSS', description: 'XD', link: 'reflected-xss' },
  { name: 'DOM-Based XSS', description: 'XD', link: 'dom-based-xss' },
  { name: 'Blind XSS', description: 'XD', link: 'blind-xss' },
]
</script>

<style scoped>
.tiles-parent {
  display: flex;
  flex-wrap: wrap;
  flex-direction: row;
  align-content: center;
}

.tile-card {
  width: 45%;
  max-height: 350px; /* Maksymalna wysokość karty */
  height: 20vh; /* Wysokość zależna od wysokości ekranu */
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #027be3, #009688); /* Użycie kolorów z Quasara */
  color: white;
  border-radius: 12px;
  box-shadow: 3px 3px 10px rgba(0, 0, 0, 0.2);
  cursor: pointer;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
  padding: 20px; /* Padding dla lepszego wyrównania */
}

.tile-card:hover {
  transform: scale(1.05);
  box-shadow: 5px 5px 15px rgba(0, 0, 0, 0.3);
}
</style>
