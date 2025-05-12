<template>
  <h3>Kontroluj zabezpieczenia backendu aplikacji</h3>

  <div v-for="option in options" :key="option.id">
    <q-toggle v-model="option.isActive" :true-value="1" :false-value="0" :label="option.name" :disable="loading" />
  </div>
</template>

<script setup lang="ts">
import { useDebounceFn } from '@vueuse/core';
import { Notify } from 'quasar';
import { api } from 'src/boot/axios';
import { nextTick, onMounted, ref, watch } from 'vue';

interface Options {
  id: number;
  name: string;
  isActive: 0 | 1;
}

const options = ref<Options[]>([]);
const isFetched = ref(false);
const loading = ref(false);

onMounted(async () => {
  try {
    const { data } = await api.get<Options[]>('/security');

    options.value = data;

    await nextTick();

    isFetched.value = true;
  } catch (err) {
    console.error(err)
  }
})

const saveSecurityOptions = useDebounceFn(async () => {

  try {
    loading.value = true;
    const { data } = await api.post<Options[]>('/security', {
      securityOptions: options.value
    });

    if (JSON.stringify(options.value) !== JSON.stringify(data)) {
      options.value = data;
    }

  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }

  Notify.create({
    message: 'Zaktualizowano ustawienia bezpieczeństwa'
  })
}, 700)

watch(options, async (newVal) => {
  if (!isFetched.value) return;

  saveSecurityOptions();

}, { deep: true })

</script>