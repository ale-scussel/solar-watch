import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
import App from './App.vue'
import router from './router'
import { useMainStore } from './stores/main'

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)
app.use(router)
app.mount('#app')

// Espone lo store su window in sviluppo per i test Cypress
if (import.meta.env.DEV) {
  window.__solarStore = useMainStore()
}
