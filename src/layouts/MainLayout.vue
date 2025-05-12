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
                  <q-item clickable to="/classic-sql-injection"> Classic SQL Injection </q-item>
                  <q-item clickable to="/union-based-sql-injection"> Union Based SQL Injection </q-item>
                  <q-item clickable to="/error-based-sql-injection"> Error Based SQL Injection </q-item>
                  <q-item clickable to="/command-injection"> Command Injection </q-item>
                  <q-item clickable to="/path-traversal"> Path Traversal </q-item>
                </q-list>
              </q-popup-proxy>
            </q-badge>
          </div>

          <div class="q-ml-auto q-mr-xl self-center">
            <router-link to="/security" class="text-white" style="text-decoration: none;">
              Security
            </router-link>
          </div>

          <div class="flex column">
            <div>
              <q-avatar>
                <q-img :src="`https://cdn.quasar.dev/img/avatar${userStore.userNumber}.jpg`" />
              </q-avatar>
              {{ userStore.username }}
              <q-icon v-if="userStore.isAdmin" name="star" color="orange-7" />
            </div>
            <div class="text-caption text-right text-bold cursor-pointer" @click="showLoginModal = true">
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

    <login-modal v-model="showLoginModal" @update-navbar="userStore.fetchUserData" />
  </q-layout>
</template>

<script setup lang="ts">
import { useUserStore } from 'src/stores/user'
import { defineAsyncComponent, ref } from 'vue'

const LoginModal = defineAsyncComponent(() => import('components/LoginModal.vue'))
const Tiles = defineAsyncComponent(() => import('components/Tiles.vue'))

const showLoginModal = ref(false)

const userStore = useUserStore()
</script>
