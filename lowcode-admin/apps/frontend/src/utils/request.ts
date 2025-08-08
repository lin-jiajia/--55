import { getCache, setCache, buildKey } from './cache'

export type RequestConfig = {
  url: string
  method?: 'GET'|'POST'|'PUT'|'DELETE'
  params?: Record<string, any>
  data?: any
  cacheSeconds?: number
}

export async function request(cfg: RequestConfig, ctx?: { mock?: boolean; page?: string }) {
  const method = cfg.method || 'GET'
  const url = cfg.url
  const qs = cfg.params ? '?' + new URLSearchParams(Object.entries(cfg.params).filter(([,v]) => v != null) as any).toString() : ''
  const key = buildKey(url, cfg.params)

  if (method === 'GET' && cfg.cacheSeconds) {
    const cached = getCache(key)
    if (cached) return cached
  }

  if (ctx?.mock) {
    const data = await mockHandler({ ...cfg, method })
    if (method === 'GET' && cfg.cacheSeconds) setCache(key, data, cfg.cacheSeconds)
    return data
  }

  const resp = await fetch(url + qs, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: method === 'GET' ? undefined : JSON.stringify(cfg.data || {})
  })
  const json = await resp.json().catch(() => ({}))
  if (method === 'GET' && cfg.cacheSeconds) setCache(key, json, cfg.cacheSeconds)
  return json
}

async function mockHandler(cfg: Required<Pick<RequestConfig, 'url'|'method'>> & RequestConfig) {
  // naive mock by URL convention
  if (cfg.url.includes('/users/list') && cfg.method === 'GET') {
    return { data: [
      { id: 1, username: 'alice', email: 'alice@example.com', phone: '13312345678', dept_id: 'd_100' },
      { id: 2, username: 'bob', email: 'bob@example.com', phone: '15587654321', dept_id: 'd_200' }
    ] }
  }
  if (cfg.url.includes('/users') && cfg.method !== 'GET') {
    return { success: true }
  }
  if (cfg.url.startsWith('/api/workflow/')) {
    return { success: true }
  }
  return { data: [] }
}