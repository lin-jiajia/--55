<template>
  <el-table :data="rows" v-loading="loading" style="width: 100%">
    <el-table-column v-for="col in columns" :key="col.field" :prop="col.field" :label="col.label" :width="col.width" />
    <el-table-column v-if="rowActions.length" label="操作" width="180">
      <template #default="{ row }">
        <el-button v-for="ra in rowActions" :key="ra.label" v-if="can(ra.perm)" size="small" @click="$emit(ra.type as any, row)">{{ ra.label }}</el-button>
      </template>
    </el-table-column>
  </el-table>
</template>

<script setup lang="ts">
import type { TableColumnSchema } from '@/types/schema'
import { useUserStore } from '@/stores/user'

const props = defineProps<{ columns: TableColumnSchema[]; rows: any[]; loading: boolean; rowActions: Array<{ type: string; label: string; perm?: string }> }>()
const emits = defineEmits(['edit','delete'])
const user = useUserStore()

function can(perm?: string) {
  if (!perm) return true
  return user.permissions.includes(perm)
}
</script>