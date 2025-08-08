import { worker } from './browser'

export async function startMsw() {
  if (import.meta.env.MODE === 'production') return
  if ((window as any).__msw_started) return
  await worker.start({ onUnhandledRequest: 'bypass' })
  ;(window as any).__msw_started = true
}