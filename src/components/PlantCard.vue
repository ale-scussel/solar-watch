<template>
  <div
    class="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition flex flex-col"
    :class="plant.connected ? 'border-2 border-green-400' : 'border-2 border-red-400'"
    :data-cy="`plant-card-${plant.id}`"
  >
    <!-- Header: nome impianto + badge stato connessione -->
    <div
      class="p-5 border-b flex justify-between items-center"
      :class="plant.connected ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'"
    >
      <h3 class="font-bold text-lg text-slate-800" data-cy="plant-name">{{ plant.name }}</h3>
      <span
        class="px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 text-white"
        :class="plant.connected ? 'bg-green-500' : 'bg-red-500'"
        data-cy="plant-status"
      >
        <svg v-if="plant.connected" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
        </svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
        </svg>
        {{ plant.connected ? 'CONNESSO' : 'DISCONNESSO' }}
      </span>
    </div>

    <!-- Body: produzione e stato prestazioni -->
    <div class="p-5 flex-grow space-y-4">
      <div class="flex justify-between items-end">
        <div>
          <div class="text-sm text-slate-500 mb-1">Produzione Corrente</div>
          <div class="text-3xl font-black text-slate-800" data-cy="plant-production">
            {{ plant.currentProduction }} <span class="text-base font-normal text-slate-400">kW</span>
          </div>
        </div>
        <div class="text-right">
          <div class="text-sm text-slate-500 mb-1">Valore Atteso</div>
          <div class="text-xl font-bold text-slate-600" data-cy="plant-expected">
            {{ plant.expectedProduction }} <span class="text-sm font-normal text-slate-400">kW</span>
          </div>
        </div>
      </div>

      <!-- QA Info -->
      <div class="bg-slate-50 p-3 rounded-lg text-sm border border-slate-100">
        <div class="flex justify-between mb-1">
          <span class="text-slate-500">Stato Prestazioni:</span>
          <span
            v-if="plant.underperformanceMinutes > 0"
            class="text-warning font-bold"
            data-cy="underperformance-time"
          >Sotto soglia da {{ plant.underperformanceMinutes }} min</span>
          <span
            v-else
            class="text-success font-bold"
            data-cy="underperformance-time"
          >Ottimale (0 min)</span>
        </div>
        <div class="flex justify-between">
          <span class="text-slate-500">Ultimo aggiornamento:</span>
          <span class="text-slate-700 font-mono text-xs" data-cy="plant-last-update">{{ formatLastUpdate(plant.lastUpdate) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  plant: {
    type: Object,
    required: true
  }
})

const formatLastUpdate = (ts) => new Date(ts).toLocaleString()
</script>
