<template>
  <div class="app-wrapper">
    <el-container>
      <el-header class="app-header">
        <div class="brand" @click="$router.push('/')">Lowcode Admin</div>
        <div class="spacer" />
        <el-switch v-model="settings.tenantMode" active-text="多租户" />
        <el-select v-model="settings.tenantId" placeholder="租户" style="width: 140px; margin-left: 12px">
          <el-option v-for="t in tenants" :key="t.value" :label="t.label" :value="t.value" />
        </el-select>
        <el-button link type="primary" @click="$router.push('/form-designer')">表单设计器</el-button>
        <el-dropdown>
          <span class="el-dropdown-link">
            主题<i class="el-icon--right el-icon-arrow-down" />
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="toggleDark(false)">浅色</el-dropdown-item>
              <el-dropdown-item @click="toggleDark(true)">深色</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </el-header>
      <el-container>
        <el-aside width="200px" class="app-aside">
          <el-menu :router="true" :default-active="$route.path">
            <el-menu-item v-for="m in settings.menus" :key="m.path" :index="m.path">{{ m.title }}</el-menu-item>
          </el-menu>
        </el-aside>
        <el-main>
          <router-view />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { useSettingsStore } from './stores/settings'
import { ref } from 'vue'

const settings = useSettingsStore()
const tenants = ref([
  { label: '默认租户', value: 'tenant_default' },
  { label: '演示租户A', value: 'tenant_a' }
])

function toggleDark(dark: boolean) {
  settings.theme = {
    ...settings.theme,
    mode: dark ? 'dark' : 'light'
  }
}
</script>

<style scoped>
.app-header { display: flex; align-items: center; gap: 12px; }
.brand { font-weight: 700; cursor: pointer; }
.spacer { flex: 1; }
.app-aside { border-right: 1px solid var(--el-border-color); }
</style>