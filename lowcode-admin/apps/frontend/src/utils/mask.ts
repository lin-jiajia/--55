export function maskPhone(v: string) {
  const s = String(v)
  if (s.length < 7) return s
  return s.slice(0,3) + '****' + s.slice(-4)
}
export function maskEmail(v: string) {
  const s = String(v)
  const [name, domain] = s.split('@')
  if (!domain) return s
  const n = name.length
  const head = n <= 2 ? name[0] : name.slice(0,2)
  return head + '***@' + domain
}
export function maskId(v: string) {
  const s = String(v)
  if (s.length < 8) return s
  return s.slice(0,4) + '********' + s.slice(-4)
}

export function applyMask(v: any, type: string) {
  if (v == null) return v
  switch (type) {
    case 'phone': return maskPhone(String(v))
    case 'email': return maskEmail(String(v))
    case 'id': return maskId(String(v))
    default: return v
  }
}