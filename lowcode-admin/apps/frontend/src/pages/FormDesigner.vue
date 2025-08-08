<template>
  <div>
    <h2>在线表单设计器</h2>
    <el-form label-width="100px">
      <el-form-item label="页面标识">
        <el-input v-model="pageName" placeholder="如 users" style="width:280px" />
      </el-form-item>
    </el-form>

    <el-table :data="formFields" style="width:100%; margin-bottom: 8px">
      <el-table-column label="#" type="index" width="50" />
      <el-table-column label="字段" prop="field" />
      <el-table-column label="标签" prop="label" />
      <el-table-column label="控件" prop="widget" />
      <el-table-column label="必填" width="80">
        <template #default="{ row }">
          <el-switch v-model="row.required" />
        </template>
      </el-table-column>
      <el-table-column label="操作" width="180">
        <template #default="{ $index }">
          <el-button size="small" @click="removeField($index)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div style="display:flex; gap:8px; margin-bottom: 12px">
      <el-input v-model="draft.field" placeholder="字段名" style="width: 160px" />
      <el-input v-model="draft.label" placeholder="标签" style="width: 160px" />
      <el-select v-model="draft.widget" placeholder="控件" style="width: 160px">
        <el-option label="输入框" value="Input" />
        <el-option label="选择器" value="Select" />
        <el-option label="日期" value="DatePicker" />
        <el-option label="开关" value="Switch" />
      </el-select>
      <el-button type="primary" @click="addField">添加字段</el-button>
      <el-button @click="saveSchema">保存</el-button>
    </div>

    <el-alert title="保存后无需重启，Lowcode 页面会在下次进入时加载最新 JSON" type="success" show-icon />
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'

const pageName = ref('users')
const formFields = ref<any[]>([])
const draft = reactive<any>({ field: '', label: '', widget: 'Input', required: false })

function addField() {
  if (!draft.field) return
  formFields.value.push({ ...draft, rules: draft.required ? [{ required: true, message: '必填' }] : [] })
  Object.assign(draft, { field: '', label: '', widget: 'Input', required: false })
}
function removeField(idx: number) {
  formFields.value.splice(idx, 1)
}

async function saveSchema() {
  const schema = {
    title: '表单-' + pageName.value,
    route: `/lowcode/${pageName.value}`,
    api: { list: `/api/${pageName.value}/list`, create: `/api/${pageName.value}`, update: `/api/${pageName.value}/:id`, delete: `/api/${pageName.value}/:id` },
    search: [ { field: 'keyword', label: '关键词', widget: 'Input' } ],
    table: { columns: formFields.value.map(f => ({ field: f.field, label: f.label })) },
    form: { fields: formFields.value }
  }
  await fetch(`/api/schemas/${pageName.value}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(schema) })
  ElMessage.success('已保存')
}
</script>