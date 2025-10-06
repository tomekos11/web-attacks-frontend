import { defineStore, acceptHMRUpdate } from 'pinia'
import { api } from 'src/boot/axios'
import { computed, ref } from 'vue'

interface User {
  username: string
  userNumber: number
  isAdmin: boolean
}

export const useUserStore = defineStore('user', () => {
  const username = ref<string | null>(null)
  const userNumber = ref<number | null>(null)
  const isAdmin = ref<boolean | null>(null)

  const isLogged = computed(() => !!isAdmin.value)

  const fetchUserData = async () => {
    try {
      const { data: user } = await api.get<User>('/user-data')

      username.value = user.username
      userNumber.value = user.userNumber
      isAdmin.value = user.isAdmin
    } catch (error) {
      if (error.response && error.response.status === 403) {
        isAdmin.value = false
      } else {
        console.error('Błąd przy sprawdzaniu uprawnień:', error)
      }
    }
  }

  return {
    username,
    userNumber,
    isAdmin,
    isLogged,
    fetchUserData,
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useUserStore, import.meta.hot))
}
