<template>
  <q-page class="row justify-center items-center q-pa-md">
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
.tile-card {
  width: 45%;
  min-height: 150px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #ff8a00, #e52e71);
  color: white;
  border-radius: 12px;
  box-shadow: 3px 3px 10px rgba(0, 0, 0, 0.2);
  cursor: pointer;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.tile-card:hover {
  transform: scale(1.05);
  box-shadow: 5px 5px 15px rgba(0, 0, 0, 0.3);
}
</style>
