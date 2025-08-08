import { defineStore } from 'pinia'

export interface UserState {
  id: string
  username: string
  deptId?: string
  permissions: string[]
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    id: 'u_1',
    username: 'admin',
    deptId: 'd_100',
    permissions: ['sys:user:list','sys:user:add','sys:user:edit','sys:user:delete','workflow:leave:submit','workflow:leave:approve','workflow:leave:reject']
  })
})