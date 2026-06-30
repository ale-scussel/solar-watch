<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h2 class="text-3xl font-bold text-slate-800">Dashboard Impianti</h2>
    </div>

    <!-- Pannello Notifiche per il Responsabile -->
    <div v-if="store.activeUser?.role === 'responsabile' && store.alerts.length > 0" class="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg shadow-sm mb-6" data-cy="alerts-panel">
      <div class="flex justify-between items-center mb-2">
        <h3 class="font-bold text-red-800">Alert Attivi ({{ store.alerts.length }})</h3>
        <button @click="store.alerts = []" class="text-sm text-red-600 hover:text-red-800" data-cy="clear-alerts">Pulisci tutti</button>
      </div>
      <div class="space-y-2 max-h-40 overflow-y-auto">
        <div v-for="alert in [...store.alerts].reverse()" :key="alert.id" class="bg-white p-2 rounded shadow-sm text-sm border border-red-100 flex items-center justify-between" data-cy="alert-item">
          <div>
            <span class="font-bold uppercase text-xs mr-2 px-2 py-0.5 rounded" :class="alert.type === 'predictive' ? 'bg-orange-100 text-orange-800' : 'bg-red-100 text-red-800'">{{ alert.type }}</span>
            <span>{{ alert.message }}</span>
          </div>
          <span class="text-slate-400 text-xs">{{ new Date(alert.timestamp).toLocaleTimeString() }}</span>
        </div>
      </div>
    </div>

    <!-- Lista Impianti -->
    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      <div v-for="plant in visiblePlants" :key="plant.id" class="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition flex flex-col" :class="plant.connected ? 'border-2 border-green-400' : 'border-2 border-red-400'" :data-cy="`plant-card-${plant.id}`">
        <div class="p-5 border-b flex justify-between items-center" :class="plant.connected ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'">
          <h3 class="font-bold text-lg text-slate-800">{{ plant.name }}</h3>
          <span class="px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 text-white" :class="plant.connected ? 'bg-green-500' : 'bg-red-500'" data-cy="plant-status">
            <svg v-if="plant.connected" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
            {{ plant.connected ? 'CONNESSO' : 'DISCONNESSO' }}
          </span>
        </div>
        <div class="p-5 flex-grow space-y-4">
          <div class="flex justify-between items-end">
            <div>
              <div class="text-sm text-slate-500 mb-1">Produzione Corrente</div>
              <div class="text-3xl font-black text-slate-800" data-cy="plant-production">{{ plant.currentProduction }} <span class="text-base font-normal text-slate-400">kW</span></div>
            </div>
            <div class="text-right">
              <div class="text-sm text-slate-500 mb-1">Valore Atteso</div>
              <div class="text-xl font-bold text-slate-600" data-cy="plant-expected">{{ plant.expectedProduction }} <span class="text-sm font-normal text-slate-400">kW</span></div>
            </div>
          </div>
          
          <!-- QA Info -->
          <div class="bg-slate-50 p-3 rounded-lg text-sm border border-slate-100">
            <div class="flex justify-between mb-1">
              <span class="text-slate-500">Stato Prestazioni:</span>
              <span v-if="plant.underperformanceMinutes > 0" class="text-warning font-bold" data-cy="underperformance-time">Sotto soglia da {{ plant.underperformanceMinutes }} min</span>
              <span v-else class="text-success font-bold" data-cy="underperformance-time">Ottimale (0 min)</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-500">Ultimo aggiornamento:</span>
              <span class="text-slate-700 font-mono text-xs" data-cy="plant-last-update">{{ formatLastUpdate(plant.lastUpdate) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted } from 'vue'
import { useMainStore } from '../stores/main'

const store = useMainStore()

const visiblePlants = computed(() => {
  if (store.activeUser?.role === 'cliente') {
    return store.plants.filter(p => p.clientId === store.activeUser.id)
  }
  return store.plants
})

// Last update timestamp per plant
const formatLastUpdate = (ts) => {
  return new Date(ts).toLocaleString()
}

// Auto-refresh every 5 minutes (300_000 ms)
let autoRefreshInterval = null

onMounted(() => {
  autoRefreshInterval = setInterval(() => {
    store.simulateTick()
  }, 5 * 60 * 1000)
})

onUnmounted(() => {
  clearInterval(autoRefreshInterval)
})
</script>
