import { createApp, watch } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import 'element-plus/dist/index.css'
import { useSettingsStore } from './stores/settings'

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)
app.use(router)

// Apply theme from settings store via CSS variables
const settings = useSettingsStore()
function applyTheme() {
  const root = document.documentElement
  const theme = settings.theme
  Object.entries(theme).forEach(([key, value]) => {
    root.style.setProperty(`--app-${key}`, String(value))
  })
}
applyTheme()
watch(() => settings.theme, applyTheme, { deep: true })

app.mount('#app')