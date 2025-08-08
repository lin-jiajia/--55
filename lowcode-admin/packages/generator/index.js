#!/usr/bin/env node
const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

function parseArgs() {
  const args = process.argv.slice(2)
  const out = {}
  for (let i=0; i<args.length; i+=2) {
    const k = args[i]
    const v = args[i+1]
    if (!k) continue
    if (k.startsWith('--')) out[k.slice(2)] = v
  }
  return out
}

function generateFromSqlite(dbPath, table) {
  // Use sqlite3 CLI to read pragma
  const pragma = execSync(`sqlite3 ${dbPath} "PRAGMA table_info(${table});"`).toString().trim()
  const lines = pragma.split(/\r?\n/)
  const columns = lines.map(l => {
    const parts = l.split('|') // cid|name|type|notnull|dflt_value|pk
    return { name: parts[1], type: parts[2], notnull: parts[3] === '1' }
  }).filter(c => !!c.name)

  const page = table
  const schema = {
    title: `${table} 管理`,
    route: `/lowcode/${page}`,
    api: {
      list: `/api/${page}/list`,
      create: `/api/${page}`,
      update: `/api/${page}/:id`,
      delete: `/api/${page}/:id`
    },
    search: [ { field: 'keyword', label: '关键词', widget: 'Input' } ],
    table: {
      columns: columns.map(c => ({ field: c.name, label: c.name }))
    },
    form: {
      fields: columns.filter(c => c.name !== 'id').map(c => ({ field: c.name, label: c.name, widget: 'Input', rules: c.notnull ? [{ required: true, message: '必填' }] : [] }))
    }
  }

  const schemaFile = path.resolve(process.cwd(), 'apps/frontend/public/schemas', `${page}.json`)
  fs.writeFileSync(schemaFile, JSON.stringify(schema, null, 2))
  console.log('Wrote schema:', schemaFile)

  const backendModule = `// Auto-generated CRUD for ${table}\nexport default (app) => {\n  let data = []\n  app.get('/api/${page}/list', (req,res)=>res.json({ data }))\n  app.post('/api/${page}', (req,res)=>{ const id = data.length+1; data.push({ id, ...req.body }); res.json({ success:true, id }) })\n  app.put('/api/${page}/:id', (req,res)=>{ const id=+req.params.id; data = data.map(x=>x.id===id?{...x,...req.body}:x); res.json({ success:true }) })\n  app.delete('/api/${page}/:id', (req,res)=>{ const id=+req.params.id; data = data.filter(x=>x.id!==id); res.json({ success:true }) })\n}\n`
  const backendDir = path.resolve(process.cwd(), 'apps/backend/src/generated')
  fs.mkdirSync(backendDir, { recursive: true })
  const modFile = path.join(backendDir, `${page}.ts`)
  fs.writeFileSync(modFile, backendModule)
  console.log('Wrote backend module:', modFile)

  // Append route to frontend menu
  const settingsFile = path.resolve(process.cwd(), 'apps/frontend/src/stores/settings.ts')
  let settingsContent = fs.readFileSync(settingsFile, 'utf-8')
  if (!settingsContent.includes(`/lowcode/${page}`)) {
    settingsContent = settingsContent.replace('menus: [', `menus: [\n      { path: '/lowcode/${page}', title: '${table} 管理' },`)
    fs.writeFileSync(settingsFile, settingsContent)
    console.log('Updated menus in settings store')
  }
}

function main() {
  const args = parseArgs()
  if (!args.from || !args.table) {
    console.log('Usage: node packages/generator/index.js --from sqlite.db --table users')
    process.exit(1)
  }
  generateFromSqlite(args.from, args.table)
}

main()