import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router'
import LowcodePage from '@/lowcode/LowcodePage.vue'
import FormDesigner from '@/pages/FormDesigner.vue'

const routes: RouteRecordRaw[] = [
  { path: '/', redirect: '/lowcode/users' },
  { path: '/lowcode/:page', name: 'LowcodePage', component: LowcodePage, props: true },
  { path: '/form-designer', name: 'FormDesigner', component: FormDesigner }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router