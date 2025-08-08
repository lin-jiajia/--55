import express from 'express'
import cors from 'cors'
import multer from 'multer'
import dotenv from 'dotenv'
import OSS from 'ali-oss'

dotenv.config()
const app = express()
app.use(cors())
app.use(express.json())
import { resolve as pathResolve } from 'node:path'
const schemasDir = pathResolve(process.cwd(), 'apps/frontend/public/schemas')
app.use('/schemas', express.static(schemasDir))

// Settings (persisted in memory for demo; can switch to file/db)
let settings: any = {
  uploadTarget: process.env.UPLOAD_TARGET || 'local',
  tenantMode: false
}

// Auto-load generated modules
import { readdirSync } from 'node:fs'
const generatedDir = pathResolve(process.cwd(), 'apps/backend/src/generated')
try {
  for (const f of readdirSync(generatedDir)) {
    if (!f.endsWith('.ts') && !f.endsWith('.js')) continue
    const mod = await import(pathResolve(generatedDir, f))
    typeof mod.default === 'function' && mod.default(app)
  }
} catch {}

// OSS client (lazy)
let oss: OSS | null = null
function getOss() {
  if (!oss) {
    oss = new OSS({
      region: process.env.OSS_REGION || '',
      accessKeyId: process.env.OSS_AK || '',
      accessKeySecret: process.env.OSS_SK || '',
      bucket: process.env.OSS_BUCKET || ''
    })
  }
  return oss
}

// In-memory users
let users = [
  { id: 1, username: 'alice', email: 'alice@example.com', phone: '13312345678', dept_id: 'd_100', tenant_id: 'tenant_default' },
  { id: 2, username: 'bob', email: 'bob@example.com', phone: '15587654321', dept_id: 'd_200', tenant_id: 'tenant_default' }
]

app.get('/api/users/list', (req, res) => {
  const { keyword, rowFilter, tenant_id } = req.query as any
  let data = users
  if (keyword) data = data.filter(u => (u.username + u.email).includes(keyword))
  if (tenant_id) data = data.filter(u => u.tenant_id === tenant_id)
  if (rowFilter && typeof rowFilter === 'string') {
    const m = rowFilter.match(/dept_id\s*=\s*([^\s]+)/)
    if (m) {
      const val = m[1].replace(/['"]/g,'')
      data = data.filter(u => String(u.dept_id) === val)
    }
  }
  res.json({ data })
})

app.post('/api/users', (req, res) => {
  const id = users.length ? Math.max(...users.map(u => u.id)) + 1 : 1
  const record = { ...req.body, id }
  users.push(record)
  res.json({ success: true, id })
})
app.put('/api/users/:id', (req, res) => {
  const id = Number(req.params.id)
  users = users.map(u => u.id === id ? { ...u, ...req.body } : u)
  res.json({ success: true })
})
app.delete('/api/users/:id', (req, res) => {
  const id = Number(req.params.id)
  users = users.filter(u => u.id !== id)
  res.json({ success: true })
})

// Import/Export
const upload = multer({ dest: 'uploads/' })
app.post('/api/users/import', upload.single('file'), async (req, res) => {
  if (settings.uploadTarget === 'oss') {
    const client = getOss()
    if (!req.file) return res.status(400).json({ error: 'no file' })
    const key = `imports/${Date.now()}_${req.file.originalname}`
    await client.put(key, req.file.path)
    return res.json({ success: true, url: `oss://${key}` })
  }
  res.json({ success: true, file: req.file?.originalname })
})
app.get('/api/users/export', (req, res) => {
  res.json({ data: users })
})
app.get('/api/users/template', (req, res) => {
  res.json({ url: '/templates/users.xlsx' })
})

// Workflow endpoints
app.post('/api/workflow/:name/submit', (req, res) => res.json({ success: true }))
app.post('/api/workflow/:name/approve', (req, res) => res.json({ success: true }))
app.post('/api/workflow/:name/reject', (req, res) => res.json({ success: true }))

// Schema save/load
import { writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
const __dirname = dirname(fileURLToPath(import.meta.url))

app.post('/api/schemas/:name', async (req, res) => {
  const file = resolve(__dirname, '../../frontend/public/schemas', `${req.params.name}.json`)
  await writeFile(file, JSON.stringify(req.body, null, 2), 'utf-8')
  res.json({ success: true })
})

// Settings endpoints
app.get('/api/settings', (req, res) => res.json(settings))
app.post('/api/settings', (req, res) => { settings = { ...settings, ...req.body }; res.json({ success: true }) })

const port = 3000
app.listen(port, () => {
  console.log('Backend listening on http://localhost:' + port)
})