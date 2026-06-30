<template>
  <div class="space-y-6">
    <h2 class="text-3xl font-bold text-slate-800">Amministrazione Sistema</h2>
    
    <div class="bg-white rounded-xl shadow-md border border-slate-100 overflow-hidden">
      <div class="p-6 border-b border-slate-50 bg-slate-50">
        <h3 class="font-bold text-lg text-slate-800">Gestione Ruoli Utenti</h3>
      </div>
      
      <table class="min-w-full divide-y divide-slate-200">
        <thead class="bg-white">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">ID</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Nome Utente</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Ruolo Attuale</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Azione</th>
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
            <td class="px-6 py-4 whitespace-nowrap text-sm">
              <button @click="saveRole(user)" class="bg-primary hover:bg-sky-600 text-white px-3 py-1.5 rounded text-xs font-medium transition" :data-cy="`admin-save-btn-${user.id}`">Salva</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { useMainStore } from '../stores/main'

const store = useMainStore()

const saveRole = (user) => {
  alert(`Ruolo per ${user.name} salvato! (Note: changes might require a reload to apply)`)
}
</script>
