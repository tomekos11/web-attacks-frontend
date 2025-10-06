<template>
  <div>
    <h3>Kontroluj zabezpieczenia backendu aplikacji</h3>

    <div v-for="option in options" :key="option.id">
      <q-toggle v-model="option.isActive" :true-value="1" :false-value="0" :label="option.name" :disable="loading" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useDebounceFn } from '@vueuse/core';
import { Notify } from 'quasar';
import { api } from 'src/boot/axios';
import axios from 'axios';
import { computed, nextTick, onMounted, ref, watch } from 'vue';

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

const saveSecurityOptions = useDebounceFn(async (oldOptions: Options[]) => {
  try {
    loading.value = true

    // 1. Wysłanie głównego żądania
    const { data } = await api.post<Options[]>('/security', {
      securityOptions: options.value
    })

    // 2. Aktualizacja poszczególnych ustawień
    const securitySettings = [
      { name: 'clickjacking', endpoint: '/api/set-clickjacking' },
      { name: 'xss', endpoint: '/api/set-xss' }
    ]

    for (const { name, endpoint } of securitySettings) {
      const newSetting = options.value.find(el => el.name === name)
      const oldSetting = oldOptions.find(el => el.name === name)

      if (newSetting?.isActive !== oldSetting?.isActive) {
        await axios.post(endpoint, {
          isActive: newSetting?.isActive
        })
      }
    }

    // 3. Aktualizacja stanu tylko jeśli są zmiany
    if (JSON.stringify(options.value) !== JSON.stringify(data)) {
      options.value = data
    }

    Notify.create({
      message: 'Zaktualizowano ustawienia bezpieczeństwa',
      type: 'positive'
    })
  } catch (error) {
    console.error('Błąd aktualizacji:', error)
    Notify.create({
      message: 'Błąd podczas zapisywania ustawień',
      type: 'negative'
    })
  } finally {
    loading.value = false
  }
}, 700)

const optionToWatch = computed(() => JSON.parse(JSON.stringify(options.value)));

watch(optionToWatch, async (newVal, oldVal) => {
  if (!isFetched.value) return;

  await saveSecurityOptions(oldVal);

})



</script>