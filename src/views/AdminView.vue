<template>
  <div class="space-y-6">
    <h2 class="text-3xl font-bold text-slate-800">Amministrazione Sistema</h2>

    <!-- Gestione Impianti — responsabile e tecnico -->
    <div class="bg-white rounded-xl shadow-md border border-slate-100 overflow-hidden">
      <div class="p-6 border-b border-slate-50 bg-slate-50">
        <h3 class="font-bold text-lg text-slate-800">Gestione Impianti</h3>
      </div>

      <!-- Form aggiunta impianto -->
      <div class="p-6 border-b border-slate-100">
        <h4 class="font-semibold text-slate-700 mb-4">Aggiungi Impianto</h4>
        <form @submit.prevent="submitAddPlant" class="flex flex-wrap gap-4 items-end" data-cy="add-plant-form">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Nome Impianto *</label>
            <input v-model="newPlant.name" type="text" required placeholder="es. Impianto Bologna"
              class="border-slate-300 rounded-md shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 p-2 border"
              data-cy="add-plant-name" />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Cliente *</label>
            <select v-model="newPlant.clientId"
              class="border-slate-300 rounded-md shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 p-2 border"
              data-cy="add-plant-client">
              <option value="">-- Seleziona cliente --</option>
              <option v-for="c in clients" :key="c.id" :value="c.id">{{ c.name }}</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Produzione Attesa (kW) *</label>
            <input v-model.number="newPlant.expectedProduction" type="number" min="1" required
              class="w-36 border-slate-300 rounded-md shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 p-2 border"
              data-cy="add-plant-expected" />
          </div>
          <button type="submit"
            class="bg-primary hover:bg-sky-600 text-white px-4 py-2 rounded-md text-sm font-medium transition"
            data-cy="add-plant-submit">Salva Impianto</button>
        </form>
        <p v-if="addError" class="mt-2 text-red-600 text-sm" data-cy="add-plant-error">{{ addError }}</p>
        <p v-if="addSuccess" class="mt-2 text-green-600 text-sm" data-cy="add-plant-success">{{ addSuccess }}</p>
      </div>

      <!-- Lista impianti esistenti -->
      <table class="min-w-full divide-y divide-slate-200">
        <thead class="bg-white">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">ID</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Nome</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Cliente</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Stato</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Azione</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-slate-100">
          <tr v-for="plant in store.plants" :key="plant.id"
            :class="plant.pendingDeletion ? 'opacity-50 bg-red-50' : ''"
            :data-cy="`admin-plant-row-${plant.id}`">
            <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{{ plant.id }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-800">{{ plant.name }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-700">{{ clientName(plant.clientId) }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm">
              <span v-if="plant.pendingDeletion"
                class="px-2 py-0.5 rounded bg-red-100 text-red-700 text-xs font-medium">In rimozione</span>
              <span v-else
                class="px-2 py-0.5 rounded bg-green-100 text-green-700 text-xs font-medium">Attivo</span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm">
              <button v-if="!plant.pendingDeletion" @click="confirmRemove(plant)"
                class="text-red-600 hover:text-red-800 text-xs font-medium"
                :data-cy="`admin-remove-plant-${plant.id}`">Rimuovi</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Gestione Ruoli Utenti — solo responsabile -->
    <div v-if="store.activeUser?.role === 'responsabile'" class="bg-white rounded-xl shadow-md border border-slate-100 overflow-hidden">
      <div class="p-6 border-b border-slate-50 bg-slate-50">
        <h3 class="font-bold text-lg text-slate-800">Gestione Ruoli Utenti</h3>
      </div>

      <table class="min-w-full divide-y divide-slate-200">
        <thead class="bg-white">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">ID</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Nome Utente</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Ruolo Attuale</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-slate-100">
          <tr v-for="user in store.users" :key="user.id" :data-cy="`admin-user-row-${user.id}`">
            <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{{ user.id }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-800">{{ user.name }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
              <select v-model="user.role" class="border-slate-300 rounded-md shadow-sm p-1 text-sm border" :data-cy="`admin-role-select-${user.id}`">
                <option value="">Nessun ruolo</option>
                <option value="tecnico">Tecnico di monitoraggio</option>
                <option value="responsabile">Responsabile assistenza</option>
                <option value="cliente">Cliente</option>
              </select>
            </td>
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

const clients = computed(() => store.users.filter(u => u.role === 'cliente'))
const clientName = (id) => store.users.find(u => u.id === id)?.name ?? `Cliente #${id}`

// Aggiungi impianto
const newPlant = ref({ name: '', clientId: '', expectedProduction: 100 })
const addError = ref('')
const addSuccess = ref('')

const submitAddPlant = () => {
  addError.value = ''
  addSuccess.value = ''
  if (!newPlant.value.clientId) {
    addError.value = 'Il cliente è obbligatorio.'
    return
  }
  store.addPlant({
    name: newPlant.value.name,
    clientId: Number(newPlant.value.clientId),
    expectedProduction: newPlant.value.expectedProduction
  })
  addSuccess.value = `Impianto "${newPlant.value.name}" aggiunto con successo.`
  newPlant.value = { name: '', clientId: '', expectedProduction: 100 }
}

const confirmRemove = (plant) => {
  store.removePlant(plant.id)
}
</script>
