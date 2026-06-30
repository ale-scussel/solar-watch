<template>
  <div class="space-y-6">
    <h2 class="text-3xl font-bold text-slate-800">Storico Dati Impianti</h2>
    
    <div class="bg-white p-6 rounded-xl shadow-md border border-slate-100 flex flex-wrap gap-4 items-end">
      <div class="flex-grow">
        <label class="block text-sm font-medium text-slate-700 mb-1">Seleziona Impianto</label>
        <select v-model="selectedPlant" class="w-full border-slate-300 rounded-md shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 p-2 border" data-cy="history-plant-select">
          <option value="">-- Seleziona --</option>
          <option v-for="plant in store.plants" :key="plant.id" :value="plant.id">{{ plant.name }}</option>
        </select>
      </div>
      <div>
        <label class="block text-sm font-medium text-slate-700 mb-1">Mesi indietro</label>
        <input type="number" v-model="monthsBack" class="w-32 border-slate-300 rounded-md shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 p-2 border" min="1" max="36" data-cy="history-months-input" />
      </div>
    </div>

    <div v-if="selectedPlant" class="bg-white rounded-xl shadow-md border border-slate-100 overflow-hidden">
      <table class="min-w-full divide-y divide-slate-200">
        <thead class="bg-slate-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Data</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Produzione (kW)</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Efficienza (%)</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Stato</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-slate-200">
          <tr v-for="record in filteredHistory" :key="record.date" data-cy="history-row">
            <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-700">{{ new Date(record.date).toLocaleDateString() }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-700">{{ record.production.toFixed(2) }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-700">{{ record.efficiency.toFixed(1) }}%</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-700">{{ record.status }}</td>
          </tr>
          <tr v-if="filteredHistory.length === 0">
            <td colspan="4" class="px-6 py-4 text-center text-sm text-slate-500">Nessun dato trovato per il periodo selezionato.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useMainStore } from '../stores/main'

const store = useMainStore()
const selectedPlant = ref('')
const monthsBack = ref(6)

const filteredHistory = computed(() => {
  if (!selectedPlant.value) return []
  
  const cutoffDate = new Date()
  cutoffDate.setMonth(cutoffDate.getMonth() - monthsBack.value)

  // Filter history
  return store.historicalData.filter(d => {
    return d.plantId === selectedPlant.value && new Date(d.date) >= cutoffDate
  }).sort((a, b) => new Date(b.date) - new Date(a.date))
})
</script>
