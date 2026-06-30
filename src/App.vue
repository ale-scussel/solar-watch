<template>
  <div class="min-h-screen flex flex-col bg-slate-50 text-slate-800">
    <header class="bg-white text-slate-800 shadow-sm border-b border-slate-200 p-4">
      <div class="container mx-auto flex justify-between items-center">
        <h1 class="text-2xl font-bold text-primary flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clip-rule="evenodd" />
          </svg>
          SolarWatch
        </h1>
        <nav v-if="store.activeUser" class="hidden md:flex gap-6 font-medium text-slate-600">
          <router-link to="/dashboard" class="hover:text-primary transition py-1" active-class="text-primary border-b-2 border-primary">Dashboard</router-link>
          <router-link v-if="store.activeUser.role === 'responsabile'" to="/history" class="hover:text-primary transition py-1" active-class="text-primary border-b-2 border-primary">Storico</router-link>
          <router-link v-if="store.activeUser.role === 'responsabile'" to="/reports" class="hover:text-primary transition py-1" active-class="text-primary border-b-2 border-primary">Report</router-link>
          <router-link v-if="store.activeUser.role === 'responsabile'" to="/admin" class="hover:text-primary transition py-1" active-class="text-primary border-b-2 border-primary">Admin</router-link>
        </nav>
        <div v-if="store.activeUser" class="flex items-center gap-4">
          <span class="font-medium bg-slate-100 text-slate-600 border border-slate-200 px-3 py-1 rounded-full text-sm">
            {{ store.activeUser.name }} ({{ store.activeUser.role || 'Nessun Ruolo' }})
          </span>
          <button @click="handleLogout" class="bg-red-500 hover:bg-red-600 text-white px-4 py-1.5 rounded-lg text-sm transition" data-cy="logout-btn">Esci</button>
        </div>
      </div>
    </header>

    <main class="flex-grow container mx-auto p-4 md:p-6 lg:p-8">
      <router-view />
    </main>
    
    <!-- Dev Tools for QA testing -->
    <div v-if="store.activeUser" class="fixed bottom-4 right-4 bg-white shadow-xl rounded-xl border p-4 z-50 text-xs">
      <h3 class="font-bold mb-2">QA Simulation Tools</h3>
      <button @click="store.simulateTick()" class="bg-slate-800 text-white px-3 py-1 rounded hover:bg-slate-700" data-cy="sim-tick-btn">+5 Minuti (Tick)</button>
    </div>
  </div>
</template>

<script setup>
import { useMainStore } from './stores/main'
import { useRouter } from 'vue-router'

const store = useMainStore()
const router = useRouter()

const handleLogout = () => {
  store.logout()
  router.push('/')
}
</script>
