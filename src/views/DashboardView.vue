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
      <PlantCard v-for="plant in visiblePlants" :key="plant.id" :plant="plant" />
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useMainStore } from '../stores/main'
import PlantCard from '../components/PlantCard.vue'

const store = useMainStore()

// Snapshot degli ID impianti visibili al cliente al momento del mount.
// Garantisce che una rimozione effettuata mentre il cliente è sulla pagina
// non aggiorni la vista in tempo reale: il cliente vede la scomparsa
// solo al prossimo accesso alla dashboard (lazy removal).
const clientPlantIdsSnapshot = ref(null)

const visiblePlants = computed(() => {
  if (store.activeUser?.role === 'cliente') {
    const snapshot = clientPlantIdsSnapshot.value
    if (!snapshot) {
      // Pre-mount fallback: mostra impianti non in rimozione
      return store.plants.filter(p => p.clientId === store.activeUser.id && !p.pendingDeletion)
    }
    return store.plants.filter(p => snapshot.has(p.id))
  }
  return store.plants.filter(p => !p.pendingDeletion)
})

// Auto-refresh every 5 minutes (300_000 ms)
let autoRefreshInterval = null

onMounted(() => {
  if (store.activeUser?.role === 'cliente') {
    clientPlantIdsSnapshot.value = new Set(
      store.plants
        .filter(p => p.clientId === store.activeUser.id && !p.pendingDeletion)
        .map(p => p.id)
    )
  }
  autoRefreshInterval = setInterval(() => {
    store.simulateTick()
  }, 5 * 60 * 1000)
})

onUnmounted(() => {
  clearInterval(autoRefreshInterval)
})
</script>
