<template>
  <el-form :inline="true" :model="model" @submit.prevent>
    <template v-for="item in items" :key="item.field">
      <el-form-item v-if="can(item.perm)" :label="item.label">
        <template v-if="item.widget === 'Select'">
          <el-select v-model="model[item.field]" v-bind="item.props">
            <el-option v-for="opt in (item.options || [])" :key="opt.value" :label="opt.label" :value="opt.value" />
          </el-select>
        </template>
        <component v-else :is="resolveWidget(item.widget)" v-model="model[item.field]" v-bind="item.props" />
      </el-form-item>
    </template>
    <el-form-item>
      <el-button type="primary" @click="$emit('search', model)">查询</el-button>
      <el-button @click="reset">重置</el-button>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import type { SearchFieldSchema } from '@/types/schema'
import { ref } from 'vue'
import { useUserStore } from '@/stores/user'

const props = defineProps<{ items: SearchFieldSchema[] }>()
const emit = defineEmits<{ (e: 'search', model: any): void }>()
const model = ref<Record<string, any>>({})
const user = useUserStore()

function resolveWidget(name: string) {
  switch (name) {
    case 'Input': return 'el-input'
    case 'DatePicker': return 'el-date-picker'
    case 'Switch': return 'el-switch'
    default: return name
  }
}
function can(perm?: string) {
  if (!perm) return true
  return user.permissions.includes(perm)
}
function reset() {
  model.value = {}
  emit('search', {})
}
</script>