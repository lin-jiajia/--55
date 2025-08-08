<template>
  <div>
    <h2 style="margin-bottom: 12px">{{ schema?.title }}</h2>

    <SearchForm v-if="schema?.search" :items="schema!.search" @search="onSearch" />

    <div style="margin-bottom: 8px; display:flex; gap:8px; align-items:center">
      <el-button v-if="can(schema?.form?.submitPerm)" type="primary" @click="openCreate">新建</el-button>
      <el-upload
        v-if="schema?.table?.import"
        :action="schema?.api.import || (schema?.api.list.replace('/list','') + '/import')"
        :show-file-list="false"
        :headers="uploadHeaders"
        :data="commonParams"
        style="display:inline-block"
      >
        <el-button>导入</el-button>
      </el-upload>
      <el-button v-if="schema?.table?.export" @click="exportData">导出</el-button>

      <template v-if="schema?.workflow">
        <el-button v-if="can(`workflow:${schema?.workflow}:submit`)" @click="onWorkflow('submit')">提交</el-button>
        <el-button v-if="can(`workflow:${schema?.workflow}:approve`)" @click="onWorkflow('approve')">审批</el-button>
        <el-button v-if="can(`workflow:${schema?.workflow}:reject`)" @click="onWorkflow('reject')">驳回</el-button>
      </template>
    </div>

    <DataTable
      :columns="schema?.table.columns || []"
      :rows="rows"
      :loading="loading"
      :row-actions="schema?.table.rowActions || []"
      @edit="openEdit"
      @delete="onDelete"
    />

    <FormDialog
      v-if="schema?.form"
      v-model:visible="formVisible"
      :schema="schema!.form!"
      :initial="current"
      @submit="onSubmit"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import SearchForm from './components/SearchForm.vue'
import DataTable from './components/DataTable.vue'
import FormDialog from './components/FormDialog.vue'
import type { PageSchema } from '@/types/schema'
import { request } from '@/utils/request'
import { useUserStore } from '@/stores/user'
import { useSettingsStore } from '@/stores/settings'
import { applyMask } from '@/utils/mask'

const route = useRoute()
const page = computed(() => (route.params.page as string) || 'users')
const schema = ref<PageSchema | null>(null)
const loading = ref(false)
const rows = ref<any[]>([])
const formVisible = ref(false)
const current = ref<any | null>(null)
const user = useUserStore()
const settings = useSettingsStore()

const uploadHeaders = { }

const commonParams = computed(() => ({
  tenant_id: settings.tenantMode ? settings.tenantId : undefined
}))

function can(perm?: string) {
  if (!perm) return true
  return user.permissions.includes(perm)
}

async function loadSchema() {
  const res = await fetch(`/schemas/${page.value}.json?ts=${Date.now()}`)
  schema.value = await res.json()
}

function interpolateFilter(filter: string): string {
  return filter
    .replaceAll('${user.deptId}', String(user.deptId || ''))
    .replaceAll('${user.id}', String(user.id || ''))
}

async function fetchList(params: any = {}) {
  if (!schema.value) return
  loading.value = true
  try {
    const s = schema.value
    const filterStr = s.rowFilter ? interpolateFilter(s.rowFilter) : undefined
    const reqParams: any = {
      ...params,
      ...(filterStr ? { rowFilter: filterStr } : {}),
      ...(settings.tenantMode ? { tenant_id: settings.tenantId } : {})
    }
    const resp = await request({
      url: s.api.list,
      method: 'GET',
      params: reqParams,
      cacheSeconds: s.cache
    }, { mock: !!s.mock, page: page.value })
    const data = resp?.data || []
    // apply column-level masking
    rows.value = data.map((row: any) => {
      const copy = { ...row }
      for (const col of s.table.columns) {
        if (col.mask && copy[col.field] != null) {
          copy[col.field] = applyMask(copy[col.field], col.mask)
        }
      }
      return copy
    })
  } finally {
    loading.value = false
  }
}

function onSearch(model: any) {
  fetchList(model)
}

function openCreate() {
  current.value = null
  formVisible.value = true
}
function openEdit(row: any) {
  current.value = row
  formVisible.value = true
}

async function onSubmit(payload: any) {
  const s = schema.value!
  const isEdit = !!current.value?.id
  const url = isEdit ? s.api.update!.replace(':id', current.value.id) : s.api.create!
  await request({ url, method: isEdit ? 'PUT' : 'POST', data: payload }, { mock: !!s.mock, page: page.value })
  formVisible.value = false
  fetchList()
}

async function onDelete(row: any) {
  const s = schema.value!
  await request({ url: s.api.delete!.replace(':id', row.id), method: 'DELETE' }, { mock: !!s.mock, page: page.value })
  fetchList()
}

async function exportData() {
  const s = schema.value!
  const resp = await request({ url: s.api.list, method: 'GET' }, { mock: !!s.mock, page: page.value })
  const data = resp?.data || []
  const headers = s.table.columns.map(c => c.label)
  const fields = s.table.columns.map(c => c.field)
  const rowsData = data.map((r: any) => fields.map(f => r[f] ?? ''))
  const csv = [headers.join(','), ...rowsData.map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(','))].join('\n')
  const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `${page.value}.csv`
  a.click()
  URL.revokeObjectURL(a.href)
}

async function onWorkflow(action: 'submit'|'approve'|'reject') {
  const s = schema.value!
  await request({ url: `/api/workflow/${s.workflow}/${action}`, method: 'POST' }, { mock: !!s.mock, page: page.value })
}

onMounted(async () => {
  await loadSchema()
  await fetchList()
})
</script>