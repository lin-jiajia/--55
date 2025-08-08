<template>
  <div>
    <h2>系统设置</h2>
    <el-form label-width="120px" :model="settings.theme" style="max-width: 680px">
      <el-form-item label="Logo URL">
        <el-input v-model="settings.logo" placeholder="https://..." />
      </el-form-item>
      <el-form-item label="主题色">
        <el-color-picker v-model="settings.theme.primaryColor" />
      </el-form-item>
      <el-form-item label="深色模式">
        <el-switch v-model="isDark" />
      </el-form-item>
      <el-form-item label="布局">
        <el-select v-model="settings.layout">
          <el-option label="侧边导航" value="side" />
          <el-option label="顶部导航" value="top" />
          <el-option label="混合导航" value="mix" />
        </el-select>
      </el-form-item>
      <el-form-item label="多租户">
        <el-switch v-model="settings.tenantMode" />
      </el-form-item>
      <el-form-item label="接口 Mock">
        <el-switch v-model="settings.mockEnabled" />
      </el-form-item>
    </el-form>

    <h3 style="margin-top:16px">菜单顺序</h3>
    <el-table :data="settings.menus" row-key="path">
      <el-table-column prop="title" label="标题" />
      <el-table-column prop="path" label="路径" />
      <el-table-column label="操作" width="200">
        <template #default="{ $index }">
          <el-button size="small" @click="move($index, -1)">上移</el-button>
          <el-button size="small" @click="move($index, 1)">下移</el-button>
          <el-button size="small" type="danger" @click="remove($index)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div style="display:flex; gap:8px; margin-top:8px">
      <el-input v-model="draft.title" placeholder="标题" style="width:200px" />
      <el-input v-model="draft.path" placeholder="/path" style="width:240px" />
      <el-button type="primary" @click="add">新增菜单</el-button>
      <el-button @click="save">保存到后端</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue'
import { useSettingsStore } from '@/stores/settings'

const settings = useSettingsStore()
const isDark = computed({ get: () => settings.theme.mode === 'dark', set: (v) => settings.theme.mode = v ? 'dark' : 'light' })
const draft = reactive({ title: '', path: '' })

function move(index: number, delta: number) {
  const arr = settings.menus
  const ni = index + delta
  if (ni < 0 || ni >= arr.length) return
  const [item] = arr.splice(index, 1)
  arr.splice(ni, 0, item)
}
function remove(index: number) {
  settings.menus.splice(index, 1)
}
function add() {
  if (!draft.title || !draft.path) return
  settings.menus.push({ title: draft.title, path: draft.path })
  Object.assign(draft, { title: '', path: '' })
}
async function save() {
  await fetch('/api/settings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(settings.$state) })
  ElMessage.success('已保存到后端')
}
</script>