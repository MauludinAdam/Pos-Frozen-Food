import { computed, ref } from 'vue'
import { getMe } from '@/services/userApi'

const user = ref(null)

const fetchUser = async () => {
  try {
    const response = await getMe()

    user.value = response.data.data

    console.log(user.data)
  } catch (error) {
    console.log(error)
  }
}

const isSuperAdmin = computed(() => {
  return user.value?.role?.name === 'Super Admin'
})

const isAdmin = computed(() => {
  return user.value?.role?.name === 'Admin'
})

const isKasir = computed(() => {
  return user.value?.role?.name === 'Kasir'
})

export const useAuth = () => {
  return {
    user,
    fetchUser,
    isSuperAdmin,
    isAdmin,
    isKasir,
  }
}
