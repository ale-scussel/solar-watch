import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useMainStore = defineStore('main', () => {
  // Users
  const users = ref([
    { id: 1, name: 'Admin', role: 'responsabile' },
    { id: 2, name: 'Mario Rossi', role: 'tecnico' },
    { id: 3, name: 'Cliente A', role: 'cliente' },
    { id: 4, name: 'Cliente B', role: 'cliente' },
    { id: 5, name: 'Sconosciuto', role: '' }
  ])

  const activeUser = ref(null)

  // Plants
  const plants = ref([
    { id: 101, name: 'Impianto Roma', clientId: 3, connected: true, currentProduction: 100, expectedProduction: 100, underperformanceMinutes: 0, lastUpdate: Date.now() - Math.floor(Math.random() * 60 * 1000), installDate: Date.now() - 365*24*60*60*1000 },
    { id: 102, name: 'Impianto Milano', clientId: 4, connected: true, currentProduction: 50, expectedProduction: 100, underperformanceMinutes: 20, lastUpdate: Date.now() - Math.floor(Math.random() * 60 * 1000), installDate: Date.now() - 100*24*60*60*1000 },
    { id: 103, name: 'Impianto Napoli', clientId: 3, connected: true, currentProduction: 70, expectedProduction: 100, underperformanceMinutes: 35, lastUpdate: Date.now() - Math.floor(Math.random() * 60 * 1000), installDate: Date.now() - 5*24*60*60*1000 }, // New plant
    { id: 104, name: 'Impianto Torino', clientId: 4, connected: false, currentProduction: 0, expectedProduction: 50, underperformanceMinutes: 50, lastUpdate: Date.now() - Math.floor(Math.random() * 60 * 1000), installDate: Date.now() - 500*24*60*60*1000 },
    { id: 105, name: 'Serra Firenze', clientId: 3, connected: true, currentProduction: 90, expectedProduction: 90, underperformanceMinutes: 0, lastUpdate: Date.now() - Math.floor(Math.random() * 60 * 1000), installDate: Date.now() - 10*24*60*60*1000 },
  ])

  // Historical Data (mock)
  const historicalData = ref([])

  // Alerts
  const alerts = ref([])
  // Traccia gli impianti per cui è già attivo un alert di soglia
  const activeThresholdAlerts = new Set()

  function generateHistoricalData() {
    plants.value.forEach(p => {
      // Generate some fake data up to 24 months ago
      for(let m = 0; m < 24; m++) {
        const hasAlarm = Math.random() > 0.85
        const d = new Date()
        d.setMonth(d.getMonth() - m)
        d.setDate(1)
        historicalData.value.push({
          plantId: p.id,
          date: d.toISOString(),
          production: Math.random() * 100,
          power: 2 + Math.random() * 8,
          efficiency: 80 + Math.random() * 20,
          status: hasAlarm ? 'WARN' : 'OK',
          alarms: hasAlarm ? 'Sottoproduzione rilevata' : ''
        })
      }
    })
  }
  generateHistoricalData()

  // Actions
  function login(userId) {
    const user = users.value.find(u => u.id === userId)
    activeUser.value = user ? { ...user } : null
  }

  function logout() {
    activeUser.value = null
  }

  function simulateTick() {
    plants.value.filter(p => !p.pendingDeletion).forEach(plant => {
      // Update timestamp
      plant.lastUpdate = plant.lastUpdate += 5 * 60 * 1000;

      // Simulate connection randomly drops
      if (Math.random() > 0.95) plant.connected = !plant.connected

      if (plant.currentProduction <= plant.expectedProduction * 0.8) {
        plant.underperformanceMinutes += 5

        if (plant.underperformanceMinutes > 30 && !activeThresholdAlerts.has(plant.id)) {
          activeThresholdAlerts.add(plant.id)
          alerts.value.push({
            id: Date.now() + Math.random(),
            type: 'threshold',
            message: `Impianto ${plant.name} sotto soglia! Produzione: ${plant.currentProduction}, Attesa: ${plant.expectedProduction}`,
            plantId: plant.id,
            timestamp: new Date().toISOString()
          })
        }
      } else {
        plant.underperformanceMinutes = 0
        activeThresholdAlerts.delete(plant.id)
      }

      // Predictive Anomaly (US7)
      if (Math.random() > 0.9) {
        const isNew = (Date.now() - plant.installDate) < 30 * 24 * 60 * 60 * 1000
        const message = isNew
          ? `Anomalia predittiva su ${plant.name}: Dati storici insufficienti!`
          : `Degrado progressivo rilevato su ${plant.name}`
        const alreadyActive = alerts.value.some(
          a => a.type === 'predictive' && a.plantId === plant.id && a.message === message
        )
        if (!alreadyActive) {
          alerts.value.push({
            id: Date.now() + Math.random(),
            type: 'predictive',
            message,
            plantId: plant.id,
            timestamp: new Date().toISOString()
          })
        }
      }
    })
  }

  function addPlant({ name, clientId, expectedProduction }) {
    const newId = Math.max(...plants.value.map(p => p.id)) + 1
    plants.value.push({
      id: newId,
      name,
      clientId: Number(clientId),
      connected: true,
      currentProduction: 0,
      expectedProduction: Number(expectedProduction),
      underperformanceMinutes: 0,
      lastUpdate: Date.now(),
      installDate: Date.now(),
      pendingDeletion: false
    })
  }

  function removePlant(plantId) {
    const plant = plants.value.find(p => p.id === plantId)
    if (plant) {
      plant.pendingDeletion = true
      plant.deletedAt = new Date().toISOString()
    }
  }

  function restorePlant(plantId) {
    const plant = plants.value.find(p => p.id === plantId)
    if (plant) {
      plant.pendingDeletion = false
      plant.deletedAt = null
    }
  }

  const deletedPlants = computed(() => plants.value.filter(p => p.pendingDeletion))

  // QA-only: inietta un alert threshold deterministico sul primo impianto visibile,
  // senza dipendere da valori casuali. Usato esclusivamente dai test Cypress.
  function forceAlert() {
    const plant = plants.value[0]
    if (!plant) return
    plant.underperformanceMinutes = 35
    activeThresholdAlerts.delete(plant.id)
    alerts.value.push({
      id: Date.now() + Math.random(),
      type: 'threshold',
      message: `[QA] Impianto ${plant.name} sotto soglia! Produzione: ${plant.currentProduction}, Attesa: ${plant.expectedProduction}`,
      plantId: plant.id,
      timestamp: new Date().toISOString()
    })
    activeThresholdAlerts.add(plant.id)
  }

  return { users, activeUser, plants, deletedPlants, historicalData, alerts, login, logout, simulateTick, forceAlert, addPlant, removePlant, restorePlant }
})
