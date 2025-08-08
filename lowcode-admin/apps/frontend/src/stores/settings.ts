import { defineStore } from 'pinia'

export interface ThemeSettings {
  primaryColor: string
  mode: 'light' | 'dark'
  logoUrl: string
}

export interface MenuItemSetting {
  path: string
  title: string
}

export interface SettingsState {
  theme: ThemeSettings
  tenantMode: boolean
  tenantId: string
  logo: string
  layout: 'side' | 'top' | 'mix'
  menus: MenuItemSetting[]
  mockEnabled: boolean
}

export const useSettingsStore = defineStore('settings', {
  state: (): SettingsState => ({
    theme: {
      primaryColor: '#409EFF',
      mode: 'light',
      logoUrl: ''
    },
    tenantMode: false,
    tenantId: 'tenant_default',
    logo: '',
    layout: 'side',
    menus: [
      { path: '/lowcode/users', title: '用户管理' },
      { path: '/form-designer', title: '表单设计器' },
      { path: '/settings', title: '系统设置' }
    ],
    mockEnabled: true
  }),
  persist: true
})