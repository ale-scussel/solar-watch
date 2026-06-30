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
            <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Produzione (kWh)</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Potenza (kW)</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Stato</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Efficienza (%)</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Allarmi</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-slate-200">
          <tr v-for="record in previewData" :key="record.date">
            <td class="px-6 py-2 whitespace-nowrap text-sm text-slate-700">{{ new Date(record.date).toLocaleDateString() }}</td>
            <td class="px-6 py-2 whitespace-nowrap text-sm text-slate-700">{{ record.production.toFixed(2) }}</td>
            <td class="px-6 py-2 whitespace-nowrap text-sm text-slate-700">{{ record.power.toFixed(2) }}</td>
            <td class="px-6 py-2 whitespace-nowrap text-sm">
              <span :class="record.status === 'OK' ? 'text-green-600 font-medium' : 'text-amber-600 font-medium'">{{ record.status }}</span>
            </td>
            <td class="px-6 py-2 whitespace-nowrap text-sm text-slate-700">{{ record.efficiency.toFixed(1) }}</td>
            <td class="px-6 py-2 text-sm text-red-600">{{ record.alarms }}</td>
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
  
  let csvContent = "data:text/csv;charset=utf-8,Data,Produzione (kWh),Potenza (kW),Stato,Efficienza (%),Allarmi\n"
  dataToExport.forEach(row => {
    csvContent += `${new Date(row.date).toLocaleDateString()},${row.production.toFixed(2)},${row.power.toFixed(2)},${row.status},${row.efficiency.toFixed(1)},"${row.alarms}"\n`
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
  const plant = store.plants.find(p => p.id === selectedPlant.value)
  const plantName = plant ? plant.name : selectedPlant.value

  const rows = previewData.value.map(record => `
    <tr>
      <td>${new Date(record.date).toLocaleDateString()}</td>
      <td>${record.production.toFixed(2)}</td>
      <td>${record.power.toFixed(2)}</td>
      <td class="${record.status === 'OK' ? 'ok' : 'warn'}">${record.status}</td>
      <td>${record.efficiency.toFixed(1)}</td>
      <td class="alarm">${record.alarms}</td>
    </tr>`).join('')

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Report – ${plantName}</title>
  <style>
    @page { size: A4 landscape; margin: 10mm; }
    * { box-sizing: border-box; }
    body { font-family: Arial, sans-serif; font-size: 9pt; margin: 0; }
    h2 { font-size: 13pt; margin-bottom: 8px; }
    p.subtitle { font-size: 9pt; color: #555; margin-bottom: 12px; }
    table { width: 100%; border-collapse: collapse; }
    th, td { border: 1px solid #ccc; padding: 4px 7px; text-align: left; word-break: break-word; }
    th { background: #f1f5f9; font-size: 8pt; text-transform: uppercase; letter-spacing: .05em; }
    tr:nth-child(even) { background: #f9fafb; }
    .ok   { color: #16a34a; font-weight: 600; }
    .warn { color: #d97706; font-weight: 600; }
    .alarm { color: #dc2626; }
  </style>
</head>
<body>
  <h2>Report Impianto: ${plantName}</h2>
  <p class="subtitle">Generato il ${new Date().toLocaleDateString()}</p>
  <table>
    <thead>
      <tr>
        <th>Data</th>
        <th>Produzione (kWh)</th>
        <th>Potenza (kW)</th>
        <th>Stato</th>
        <th>Efficienza (%)</th>
        <th>Allarmi</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>
  <script>window.onload = () => { window.print(); window.onafterprint = () => window.close(); }<\/script>
</body>
</html>`

  const win = window.open('', '_blank', 'width=900,height=600')
  win.document.write(html)
  win.document.close()
}
</script>

<style>
@media print {
  @page {
    size: A4 landscape;
    margin: 10mm;
  }

  /* Nascondi tutto tranne il report */
  body > * {
    display: none !important;
  }

  /* Mostra solo il contenuto dell'app */
  #app {
    display: block !important;
  }

  /* Nascondi navbar, bottoni e controlli di filtro */
  nav,
  header,
  .flex.gap-4,
  .grid.grid-cols-1 {
    display: none !important;
  }

  /* Forza la tabella a occupare tutta la larghezza */
  table {
    width: 100% !important;
    font-size: 9pt !important;
    border-collapse: collapse !important;
  }

  th, td {
    padding: 4px 6px !important;
    white-space: normal !important;
    word-break: break-word !important;
    border: 1px solid #ccc !important;
  }

  th {
    background-color: #f1f5f9 !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  /* Evita interruzioni di pagina nel mezzo di una riga */
  tr {
    page-break-inside: avoid;
  }
}
</style>
