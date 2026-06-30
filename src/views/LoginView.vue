<template>
  <div class="max-w-md mx-auto mt-12 bg-white p-8 rounded-xl shadow-lg border border-slate-100">
    <div class="text-center mb-8">
      <h2 class="text-3xl font-bold text-slate-800">Benvenuto in SolarWatch</h2>
      <p class="text-slate-500 mt-2">Seleziona un utente per continuare</p>
    </div>
    
    <div class="space-y-3">
      <button 
        v-for="user in store.users" 
        :key="user.id"
        @click="handleLogin(user.id)"
        class="w-full text-left px-6 py-4 rounded-lg border-2 hover:border-primary hover:bg-slate-50 transition flex justify-between items-center group"
        :data-cy="`login-user-${user.id}`"
      >
        <div>
          <div class="font-bold text-slate-700 group-hover:text-primary">{{ user.name }}</div>
          <div class="text-sm text-slate-400 capitalize">{{ user.role || 'Nessun ruolo' }}</div>
        </div>
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-slate-300 group-hover:text-primary" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
        </svg>
      </button>
    </div>
    
    <div v-if="error" class="mt-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm text-center" data-cy="login-error">
      {{ error }}
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useMainStore } from '../stores/main'
import { useRouter } from 'vue-router'

const store = useMainStore()
const router = useRouter()
const error = ref('')

const handleLogin = (id) => {
  store.login(id)
  if (!store.activeUser.role) {
    error.value = 'Accesso negato: utente senza ruolo assegnato.'
    store.logout()
  } else {
    router.push('/dashboard')
  }
}
</script>
