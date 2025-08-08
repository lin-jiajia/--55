type CacheEntry = { expireAt: number; data: any }
const cacheMap = new Map<string, CacheEntry>()

export function getCache(key: string): any | undefined {
  const e = cacheMap.get(key)
  if (!e) return undefined
  if (Date.now() > e.expireAt) {
    cacheMap.delete(key)
    return undefined
  }
  return e.data
}

export function setCache(key: string, data: any, ttlSeconds: number) {
  if (!ttlSeconds) return
  cacheMap.set(key, { data, expireAt: Date.now() + ttlSeconds * 1000 })
}

export function buildKey(url: string, params?: any) {
  const p = params ? JSON.stringify(params) : ''
  return `${url}?${p}`
}