<template>
  <div class="space-y-6">
    <h2 class="text-3xl font-bold text-slate-800">Storico Dati Impianti</h2>

    <!-- Filter panel -->
    <div class="bg-white p-6 rounded-xl shadow-md border border-slate-100 flex flex-wrap gap-4 items-end">
      <div class="flex-grow min-w-[180px]">
        <label class="block text-sm font-medium text-slate-700 mb-1">Seleziona Impianto</label>
        <select v-model="selectedPlant" class="w-full border-slate-300 rounded-md shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 p-2 border" data-cy="history-plant-select">
          <option value="">-- Seleziona --</option>
          <option v-for="plant in availablePlants" :key="plant.id" :value="plant.id">{{ plant.name }}</option>
        </select>
      </div>

      <div>
        <label class="block text-sm font-medium text-slate-700 mb-1">Da</label>
        <input type="date" v-model="dateFrom" :min="minDate" :max="dateTo" class="border-slate-300 rounded-md shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 p-2 border" data-cy="history-date-from" />
      </div>

      <div>
        <label class="block text-sm font-medium text-slate-700 mb-1">A</label>
        <input type="date" v-model="dateTo" :min="dateFrom" :max="today" class="border-slate-300 rounded-md shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 p-2 border" data-cy="history-date-to" />
      </div>

      <!-- Quick presets -->
      <div class="flex gap-2 items-end pb-0.5">
        <button v-for="m in [3, 6, 12, 24]" :key="m" @click="setPreset(m)"
          class="px-3 py-2 text-sm font-medium rounded-md border border-slate-300 hover:bg-slate-100 transition"
          :class="activePreset === m ? 'bg-primary text-white border-primary hover:bg-primary' : 'bg-white text-slate-600'"
          :data-cy="`history-preset-${m}m`">
          {{ m }}M
        </button>
      </div>
    </div>

    <!-- Chart panel -->
    <div v-if="selectedPlant && filteredHistory.length > 0" class="bg-white rounded-xl shadow-md border border-slate-100 overflow-hidden">
      <div class="flex justify-between items-center px-6 py-3 border-b border-slate-100">
        <span class="text-sm font-semibold text-slate-700">Grafico Produzione</span>
        <div class="flex gap-1" data-cy="chart-type-selector">
          <button v-for="opt in chartTypes" :key="opt.value"
            @click="chartType = opt.value"
            class="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border transition"
            :class="chartType === opt.value
              ? 'bg-primary text-white border-primary'
              : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'"
            :data-cy="`chart-type-${opt.value}`">
            <span>{{ opt.icon }}</span> {{ opt.label }}
          </button>
        </div>
      </div>
      <div class="p-4" style="height:300px;">
        <div data-cy="history-chart" style="position:relative;height:100%;width:100%;">
          <HistoryChart :records="chartHistory" :type="chartType" />
        </div>
      </div>
    </div>

    <!-- Results summary + table -->
    <div v-if="selectedPlant">
      <div class="flex justify-between items-center mb-2 text-sm text-slate-500">
        <span>
          <span data-cy="history-total-count" class="font-semibold text-slate-700">{{ filteredHistory.length }}</span>
          record trovati — dati disponibili fino a 24 mesi indietro
        </span>
        <span v-if="totalPages > 1">Pagina {{ currentPage }} / {{ totalPages }}</span>
      </div>

      <div class="bg-white rounded-xl shadow-md border border-slate-100 overflow-hidden">
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
            <tr v-for="record in paginatedHistory" :key="record.date" data-cy="history-row">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-700">{{ new Date(record.date).toLocaleDateString('it-IT') }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-700">{{ record.production.toFixed(2) }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-700">{{ record.efficiency.toFixed(1) }}%</td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 py-1 text-xs font-semibold rounded-full" :class="record.status === 'OK' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'">
                  {{ record.status }}
                </span>
              </td>
            </tr>
            <tr v-if="filteredHistory.length === 0">
              <td colspan="4" class="px-6 py-4 text-center text-sm text-slate-500">Nessun dato trovato per il periodo selezionato.</td>
            </tr>
          </tbody>
        </table>

        <!-- Pagination controls -->
        <div v-if="totalPages > 1" class="flex justify-between items-center px-6 py-3 border-t border-slate-100 bg-slate-50">
          <button @click="currentPage--" :disabled="currentPage === 1"
            class="px-4 py-1.5 text-sm rounded-md border border-slate-300 disabled:opacity-40 hover:bg-white transition"
            data-cy="history-prev-page">
            ← Precedente
          </button>
          <span class="text-sm text-slate-600">{{ currentPage }} / {{ totalPages }}</span>
          <button @click="currentPage++" :disabled="currentPage === totalPages"
            class="px-4 py-1.5 text-sm rounded-md border border-slate-300 disabled:opacity-40 hover:bg-white transition"
            data-cy="history-next-page">
            Successivo →
          </button>
        </div>
      </div>
    </div>

    <div v-else class="bg-white rounded-xl shadow-md border border-slate-100 p-8 text-center text-slate-400">
      Seleziona un impianto per visualizzare lo storico.
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useMainStore } from '../stores/main'
import HistoryChart from '../components/HistoryChart.vue'

const store = useMainStore()

const MAX_MONTHS = 24
const PAGE_SIZE = 20

// ── Date helpers ──────────────────────────────────────────────────────────────
function toDateString(date) {
  return date.toISOString().split('T')[0]
}

const today = toDateString(new Date())

const minDate = computed(() => {
  const d = new Date()
  d.setMonth(d.getMonth() - MAX_MONTHS)
  return toDateString(d)
})

// Default view: last 6 months
const defaultFrom = () => {
  const d = new Date()
  d.setMonth(d.getMonth() - 6)
  return toDateString(d)
}

// ── Reactive state ────────────────────────────────────────────────────────────
const selectedPlant = ref('')
const dateFrom = ref(defaultFrom())
const dateTo = ref(today)
const currentPage = ref(1)
const activePreset = ref(6)
const chartType = ref('line')

const chartTypes = [
  { value: 'line', label: 'Linea',  icon: '📈' },
  { value: 'bar',  label: 'Barre',  icon: '📊' },
  { value: 'pie',  label: 'Torta',  icon: '🥧' }
]

// ── Plants available to the current user ──────────────────────────────────────
const availablePlants = computed(() => {
  const all = store.plants.filter(p => !p.pendingDeletion)
  if (store.activeUser?.role === 'cliente') {
    return all.filter(p => p.clientId === store.activeUser.id)
  }
  return all
})

// ── Filtered + sorted history (enforces 24-month ceiling) ────────────────────
const filteredHistory = computed(() => {
  if (!selectedPlant.value) return []

  const from = new Date(dateFrom.value)
  const to = new Date(dateTo.value)
  to.setHours(23, 59, 59, 999)

  // Never expose data older than MAX_MONTHS
  const ceiling = new Date(minDate.value)
  const effectiveFrom = from < ceiling ? ceiling : from

  return store.historicalData
    .filter(d => {
      const date = new Date(d.date)
      return d.plantId === selectedPlant.value && date >= effectiveFrom && date <= to
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date))
})

// ── Pagination ────────────────────────────────────────────────────────────────
const totalPages = computed(() => Math.max(1, Math.ceil(filteredHistory.value.length / PAGE_SIZE)))

const paginatedHistory = computed(() => {
  const start = (currentPage.value - 1) * PAGE_SIZE
  return filteredHistory.value.slice(start, start + PAGE_SIZE)
})

// Reset page when filters change
watch([selectedPlant, dateFrom, dateTo], () => { currentPage.value = 1 })

// ── Chart data (chronological order for X axis) ─────────────────────────────
const chartHistory = computed(() => [...filteredHistory.value].reverse())

// ── Quick presets ─────────────────────────────────────────────────────────────
function setPreset(months) {
  const d = new Date()
  dateTo.value = toDateString(d)
  d.setMonth(d.getMonth() - months)
  dateFrom.value = toDateString(d)
  activePreset.value = months
}
</script>
