<template>
  <el-dialog v-model="visibleInner" :title="initial?.id ? '编辑' : '新建'" width="600">
    <el-form ref="formRef" :model="model" :rules="rules" label-width="100px">
      <template v-for="f in schema.fields" :key="f.field">
        <el-form-item v-if="can(f.perm)" :label="f.label" :prop="f.field">
          <component :is="resolveWidget(f.widget)" v-model="model[f.field]" v-bind="resolveProps(f)" />
        </el-form-item>
      </template>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="visibleInner=false">取消</el-button>
        <el-button type="primary" :disabled="!can(schema.submitPerm)" @click="submit">提交</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import type { FormSchema } from '@/types/schema'
import { useUserStore } from '@/stores/user'

const props = defineProps<{ schema: FormSchema; initial: any | null; visible: boolean }>()
const emit = defineEmits<{ (e: 'update:visible', v: boolean): void; (e:'submit', payload:any): void }>()

const user = useUserStore()

const visibleInner = computed({
  get: () => props.visible,
  set: (v: boolean) => emit('update:visible', v)
})
const model = reactive<Record<string, any>>({})
const rules = computed(() => {
  const r: Record<string, any> = {}
  for (const f of props.schema.fields) {
    if (f.rules) r[f.field] = f.rules
  }
  return r
})

watch(() => props.initial, (val) => {
  Object.keys(model).forEach(k => delete model[k])
  if (val) Object.assign(model, val)
})

function resolveWidget(name: string) {
  switch (name) {
    case 'Input': return 'el-input'
    case 'Select': return 'el-select'
    case 'DatePicker': return 'el-date-picker'
    case 'Switch': return 'el-switch'
    default: return name
  }
}

function resolveProps(f: any) {
  if (f.options && (!f.props || !f.props.options)) {
    return { ...f.props, options: f.options }
  }
  return f.props
}

function can(perm?: string) {
  if (!perm) return true
  return user.permissions.includes(perm)
}

function submit() {
  emit('submit', { ...model })
}
</script>