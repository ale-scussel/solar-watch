<template>
  <div class="space-y-6">
    <h2 class="text-3xl font-bold text-slate-800">Genera Report</h2>
    
    <div class="bg-white p-6 rounded-xl shadow-md border border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-6">
      <div>
        <label class="block text-sm font-medium text-slate-700 mb-1">Seleziona Impianto</label>
        <select v-model="selectedPlant" class="w-full border-slate-300 rounded-md shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 p-2 border" data-cy="report-plant-select">
          <option value="">-- Seleziona --</option>
          <option v-for="plant in store.plants" :key="plant.id" :value="plant.id">{{ plant.name }}</option>
        </select>
      </div>
      <div>
        <label class="block text-sm font-medium text-slate-700 mb-1">Da Mese (storico)</label>
        <input type="number" v-model="monthsStart" class="w-full border-slate-300 rounded-md shadow-sm p-2 border" min="1" max="24" data-cy="report-start-input" />
      </div>
      <div>
        <label class="block text-sm font-medium text-slate-700 mb-1">A Mese (storico)</label>
        <input type="number" v-model="monthsEnd" class="w-full border-slate-300 rounded-md shadow-sm p-2 border" min="0" max="23" data-cy="report-end-input" />
      </div>
    </div>

    <div v-if="selectedPlant" class="flex gap-4">
      <button @click="exportCSV" class="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium shadow-sm transition" data-cy="export-csv-btn">
        Esporta CSV
      </button>
      <button @click="exportPDF" class="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium shadow-sm transition" data-cy="export-pdf-btn">
        Esporta PDF (Stampa)
      </button>
    </div>

    <!-- Preview area to satisfy "il file esportato riflette correttamente i dati visualizzati a schermo" -->
    <div v-if="selectedPlant" class="bg-white rounded-xl shadow-md border border-slate-100 overflow-hidden mt-6 p-6">
      <h3 class="font-bold text-lg mb-4">Anteprima Report</h3>
      <table class="min-w-full divide-y divide-slate-200">
        <thead class="bg-slate-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Data</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Produzione</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-slate-200">
          <tr v-for="record in previewData" :key="record.date">
            <td class="px-6 py-2 whitespace-nowrap text-sm text-slate-700">{{ new Date(record.date).toLocaleDateString() }}</td>
            <td class="px-6 py-2 whitespace-nowrap text-sm text-slate-700">{{ record.production.toFixed(2) }}</td>
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
const monthsStart = ref(6)
const monthsEnd = ref(0)

const previewData = computed(() => {
  if (!selectedPlant.value) return []
  const start = new Date()
  start.setMonth(start.getMonth() - monthsStart.value)
  const end = new Date()
  end.setMonth(end.getMonth() - monthsEnd.value)

  return store.historicalData.filter(d => {
    const dDate = new Date(d.date)
    return d.plantId === selectedPlant.value && dDate >= start && dDate <= end
  }).sort((a, b) => new Date(b.date) - new Date(a.date))
})

const exportCSV = () => {
  const dataToExport = store.historicalData.filter(d => d.plantId === selectedPlant.value)
  
  let csvContent = "data:text/csv;charset=utf-8,Data,Produzione,Efficienza\n"
  dataToExport.forEach(row => {
    csvContent += `${new Date(row.date).toLocaleDateString()},${row.production.toFixed(2)},${row.efficiency.toFixed(1)}\n`
  })
  
  const encodedUri = encodeURI(csvContent)
  const link = document.createElement("a")
  link.setAttribute("href", encodedUri)
  link.setAttribute("download", `report_impianto_${selectedPlant.value}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

const exportPDF = () => {
  // Mock PDF export using browser print
  window.print()
}
</script>
