<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated>
      <q-toolbar>
        <q-toolbar-title class="flex justify-between">
          <div class="flex flex-center column">
            {{ $route.name?.toString().replace('-', ' ').toUpperCase() }}
            <q-badge color="blue-11" class="cursor-pointer">
              <a> Zmień rodzaj ataku </a>
              <q-popup-proxy>
                <q-list dense class="bg-white">
                  <q-item clickable to="/stored-xss"> Stored XSS </q-item>
                  <q-item clickable to="/reflected-xss"> Reflected XSS </q-item>
                  <q-item clickable to="/dom-based-xss"> Dom Based XSS </q-item>
                  <q-item clickable to="/blind-xss"> Blind XSS </q-item>
                </q-list>
              </q-popup-proxy>
            </q-badge>
          </div>
          <div class="flex column">
            <div>
              <q-avatar>
                <q-img :src="`https://cdn.quasar.dev/img/avatar${userNumber}.jpg`" />
              </q-avatar>
              {{ userName }}
              <q-icon v-if="isAdmin" name="star" color="orange-7" />
            </div>
            <div
              class="text-caption text-right text-bold cursor-pointer"
              @click="showLoginModal = true"
            >
              Masz już konto?
            </div>
          </div>
        </q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <q-page>
        <Tiles v-if="$route.path === '/'" />
        <router-view v-else />
      </q-page>
    </q-page-container>

    <login-modal v-model="showLoginModal" @update-navbar="updateNavbar" />
  </q-layout>
</template>

<script setup lang="ts">
import { Cookies } from 'quasar'
import { api } from 'src/boot/axios'
import { defineAsyncComponent, onMounted, ref } from 'vue'

const LoginModal = defineAsyncComponent(() => import('components/LoginModal.vue'))
const Tiles = defineAsyncComponent(() => import('components/Tiles.vue'))

const userNumber = ref('')
const userName = ref('')
const isAdmin = ref(false)

const showLoginModal = ref(false)

const updateNavbar = async () => {
  console.log(Cookies.get('userNumber'))
  console.log(Cookies.get('userName'))

  userNumber.value = Cookies.get('userNumber')
  userName.value = Cookies.get('userName')
  await checkIfAdmin()
}

onMounted(async () => {
  await updateNavbar()
})

const checkIfAdmin = async () => {
  try {
    const response = await api.get('/check-admin', {
      withCredentials: true,
    })
    isAdmin.value = response.data.message
  } catch (error) {
    if (error.response && error.response.status === 403) {
      isAdmin.value = false
    } else {
      console.error('Błąd przy sprawdzaniu uprawnień:', error)
    }
  }
}
</script>
