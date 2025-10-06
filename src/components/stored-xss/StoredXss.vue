<template>
  <div>
    <div style="height: 50px; display: flex; align-items: center; justify-content: end">
      <q-checkbox v-model="onlyHtml" label="Pokaż jedynie czysty HTML" />

      <q-toggle v-model="isSafe" label="Bezpieczny Tryb" color="green" :false-value="false" :true-value="true"
        :disable="false" class="q-mr-sm" />
    </div>

    <q-scroll-area style="height: min(700px, 80vh); width: 100%">
      <q-list bordered>
        <q-item-label header>Posty:</q-item-label>
        <q-item v-for="(post, index) in posts" :key="post.id" :class="index % 2 === 0 ? 'bg-white' : 'bg-grey-3'"
          style="overflow-wrap: anywhere">
          <q-item-section>
            <div class="flex" style="gap: 20px">
              <div class="flex column q-py-sm">
                <q-avatar>
                  <q-img :src="`https://cdn.quasar.dev/img/avatar${post.userNumber}.jpg`" />
                </q-avatar>
                {{ post.userName }}
              </div>
              <div style="flex-grow: 1">
                <div class="text-bold q-mb-sm flex justify-between">
                  <div>
                    {{ post.title }}
                  </div>
                  <div class="flex column">
                    {{
                      new Date(post.createdAt).toLocaleString('pl-PL', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                        timeZoneName: 'short',
                      })
                    }}
                    <q-btn v-if="userStore.isAdmin" class="self-end q-mt-sm" color="red-7" icon="delete" size="sm"
                      label="Usuń" @click="removePost(post.id)" />
                  </div>
                </div>

                <pre v-if="onlyHtml">
                      {{ isSafe ? DOMPurify.sanitize(post.content) : post.content }}
                    </pre>

                <div v-else v-html="isSafe ? DOMPurify.sanitize(post.content) : post.content" />
              </div>
            </div>
          </q-item-section>
        </q-item>
      </q-list>
    </q-scroll-area>

    <div class="text-center q-my-sm">
      <q-btn label="Dodaj post" color="primary" @click="showAddPostModal = true" />
    </div>

    <add-post-modal v-model="showAddPostModal" />
  </div>
</template>

<script setup lang="ts">
  import { defineAsyncComponent, onBeforeUnmount, onMounted, ref } from 'vue'
  import DOMPurify from 'dompurify'
  import { useStorage } from '@vueuse/core'
  import { api } from 'src/boot/axios'
  import { Notify } from 'quasar'
  import { useUserStore } from 'src/stores/user'

  const AddPostModal = defineAsyncComponent(() => import('components/AddPostModal.vue'))

  interface Post {
    id: number
    title: string
    content: string
    userName: string
    userNumber: string
    createdAt: string
  }

  const onlyHtml = ref(false)
  const showAddPostModal = ref(false)

  const isSafe = useStorage('is-safe', true)

  const posts = ref<Post[]>([])
  const userStore = useUserStore()

  const getPosts = async () => {
    try {
      const response = await api.get('/posts', {
        withCredentials: true,
      })
      posts.value = response.data
    } catch (error) {
      console.error('Błąd podczas pobierania postów:', error)
    }
  }

  const removePost = async (id: number) => {
    try {
      await api.delete(`/posts/${id}`, {
        withCredentials: true,
      })
      const index = posts.value.findIndex((el) => el.id === id)

      if (index !== -1) {
        posts.value.splice(index, 1)
      }

      Notify.create({
        message: 'Poprawnie usunięto post',
        type: 'positive',
      })
    } catch (e) {
      console.log('problem z usuwaniem postu')
    }
  }

  onMounted(async () => {
    await getPosts()
  })

  const socket = ref<WebSocket | null>(null)

  // const socket = new WebSocket('ws://localhost:5000')

  interface WebSocketMessage {
    message: string
    post: Post
    type: 'post_added'
  }

  // // Po nawiązaniu połączenia, nasłuchuj wiadomości
  // socket.onmessage = (event) => {
  //   const data = JSON.parse(event.data) as WebSocketMessage

  //   if (data.type === 'post_added') {
  //     posts.value.unshift(data.post)
  //   }
  // }

  // // Możesz również obsługiwać inne zdarzenia, np. błąd lub zamknięcie połączenia:
  // socket.onerror = (error) => {
  //   console.log('Błąd WebSocket:', error)
  // }

  // socket.onclose = () => {
  //   console.log('Połączenie WebSocket zostało zamknięte')
  // }


  onMounted(async () => {
    // Uruchamiaj tylko po stronie klienta
    if (process.env.CLIENT) {
      await getPosts()

      // Inicjalizacja WebSocket
      socket.value = new WebSocket('ws://backend.wa.local')

      socket.value.addEventListener('message', (event) => {
        const data = JSON.parse(event.data) as WebSocketMessage
        if (data.type === 'post_added') {
          posts.value.unshift(data.post)
        }
      })

      socket.value.addEventListener('error', (error) => {
        console.log('Błąd WebSocket:', error)
      })

      socket.value.addEventListener('close', () => {
        console.log('Połączenie WebSocket zostało zamknięte')
      })
    }
  })

  onBeforeUnmount(() => {
    // Zamknij połączenie przy usuwaniu komponentu
    if (process.env.CLIENT && socket.value) {
      socket.value.close()
    }
  })
</script>
