<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated>
      <q-toolbar>
        <q-toolbar-title class="flex justify-between">
          <div>Posty</div>
          <div class="flex column">
            <div>
              <q-avatar>
                <q-img :src="`https://cdn.quasar.dev/img/avatar${userNumber}.jpg`" />
              </q-avatar>
              {{ userName}}
              <q-icon v-if="isAdmin" name="star" color="orange-7" />

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
        <div style="height: 50px; display: flex; align-items: center; justify-content: end;">
          <q-checkbox v-model="onlyHtml"  label="Pokaż jedynie czysty HTML"/>

          <q-toggle
            v-model="isSafe"
            label="Bezpieczny Tryb"
            color="green"
            :false-value="false"
            :true-value="true"
            :disable="false"
            class="q-mr-sm"
          />
        </div>
        <!-- Wyświetlanie postów -->
        <q-scroll-area style="height: min(700px, 80vh); width: 100%;">
          <q-list bordered>
            <q-item-label header>Posty:</q-item-label>
            <q-item v-for="(post, index) in posts" :key="post.id" :class="index % 2 === 0 ? 'bg-white' : 'bg-grey-3'" style="overflow-wrap: anywhere;">
              <q-item-section>
                <div class="flex" style="gap:20px">
                  <div class="flex column q-py-sm">
                    <q-avatar>
                      <q-img :src="`https://cdn.quasar.dev/img/avatar${post.userNumber}.jpg`" />
                    </q-avatar>
                    {{ post.userName }}
                  </div>
                  <div style="flex-grow: 1;">
                    <div class="text-bold q-mb-sm flex justify-between">
                      <div>
                        {{ post.title }}
                      </div>
                      <div class="flex column">
                        {{ new Date(post.createdAt).toLocaleString("pl-PL", {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                            timeZoneName: "short"
                          })
                        }}
                        <!-- <q-badge class="self-end" v-if="index === 0">Najnowszy</q-badge> -->
                        <q-btn v-if="isAdmin" class="self-end q-mt-sm" color="red-7" icon="delete" size="sm" label="Usuń" @click="removePost(post.id)" />
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
          <q-btn label="Dodaj post" color="primary" @click="showAddPostModal = true"/>
        </div>
        

        <add-post-modal v-model="showAddPostModal"/>
        <login-modal v-model="showLoginModal" @update-navbar="updateNavbar"/>
      </q-page>
  </q-page-container>
</q-layout>

</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import axios from 'axios';
import DOMPurify from 'dompurify';
import { Cookies, Notify } from 'quasar';
import AddPostModal from './components/AddPostModal.vue';
import { useStorage } from '@vueuse/core';
import LoginModal from './components/LoginModal.vue';

interface Post {
  id: number;
  title: string;
  content: string;
  userName: string;
  userNumber: string;
  createdAt: string;
}

const isSafe = useStorage('is-safe', true)

const onlyHtml = ref(false);

const userNumber = ref('')
const userName = ref('')
const isAdmin = ref(false)

const showAddPostModal = ref(false);
const showLoginModal = ref(false);

const posts = ref<Post[]>([]);

// Funkcja do pobierania postów
const getPosts = async () => {
  try {
    const response = await axios.get('http://localhost:5000/posts', {
      withCredentials: true
    });
    posts.value = response.data;
  } catch (error) {
    console.error('Błąd podczas pobierania postów:', error);
  }
};

const checkIfAdmin = async() => {
  try {
    const response = await axios.get('http://localhost:5000/check-admin', {
      withCredentials: true
    });
    // Jeśli odpowiedź jest pozytywna, ustawiamy flagę isAdmin na true
    isAdmin.value = response.data.message

  } catch (error) {
    // Jeśli wystąpił błąd, np. brak uprawnień, ustawiamy flagę na false
    if (error.response && error.response.status === 403) {
      isAdmin.value = false;
    } else {
      console.error('Błąd przy sprawdzaniu uprawnień:', error);
    }
  }
}

const removePost = async (id: number) => {
  try {
    await axios.delete(`http://localhost:5000/posts/${id}`, {
      withCredentials: true
    })
    const index = posts.value.findIndex(el => el.id === id)

    if(index !== -1) {
      posts.value.splice(index, 1);
    }

    Notify.create({
      message: 'Poprawnie usunięto post',
      type: 'positive'
    })
  } catch (e) {
    console.log("problem z usuwaniem postu")
  }
  

}

const updateNavbar = async () => {
  userNumber.value = Cookies.get('userNumber')
  userName.value = Cookies.get('userName')
  await checkIfAdmin()
}

onMounted(async () => {
  await getPosts();
  await updateNavbar();

});


const socket = new WebSocket('ws://localhost:5000');

// Po nawiązaniu połączenia, nasłuchuj wiadomości
socket.onmessage = (event) => {
  const data = JSON.parse(event.data);

  if(data.type ==='post_added') {
    const post: Post = {
      content: data.content,
      title: data.title,
      createdAt: data.createdAt,
      userName: data.userName,
      userNumber: data.userNumber,
      id: data.id
    }

    posts.value.unshift(post)
  }
};

// Możesz również obsługiwać inne zdarzenia, np. błąd lub zamknięcie połączenia:
socket.onerror = (error) => {
  console.log("Błąd WebSocket:", error);
};

socket.onclose = () => {
  console.log("Połączenie WebSocket zostało zamknięte");
};
</script>

<style scoped>
/* Stylizacja */
</style>