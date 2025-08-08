import { defineStore } from 'pinia'

export interface ThemeSettings {
  primaryColor: string
  mode: 'light' | 'dark'
  logoUrl: string
}

export interface SettingsState {
  theme: ThemeSettings
  tenantMode: boolean
  tenantId: string
}

export const useSettingsStore = defineStore('settings', {
  state: (): SettingsState => ({
    theme: {
      primaryColor: '#409EFF',
      mode: 'light',
      logoUrl: ''
    },
    tenantMode: false,
    tenantId: 'tenant_default'
  }),
  persist: false
})