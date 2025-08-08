# Lowcode Admin (Fantastic-admin-like)

- JSON 驱动的运行时渲染（SearchForm、DataTable、FormDialog、CrudMixin）
- 权限码驱动的按钮/字段显隐与禁用
- 主题/布局/Logo/菜单顺序等系统设置，实时热更新（Pinia 持久化）
- 自定义组件插件机制：`src/lowcode/plugins/*` 自动注册，JSON 里 `"widget": "MyUploader"`
- 代码生成器：从表结构生成 JSON 配置 + 基础 CRUD API + 前端菜单
- MSW/内置 Mock 双通道：可视化开关、schema 开关两种方式
- 多租户：全局开关，自动携带 `tenant_id`

## 目录结构（前后端分离）

- `apps/frontend`（Vue 3 + Vite + TS + Element Plus + Pinia）
  - 运行：`npm i && npm run dev`
  - 端口：5173（默认）
  - JSON：`public/schemas/*.json`
  - 低代码：`src/lowcode/*`
  - 系统设置页：`/#/settings`
  - 表单设计器：`/#/form-designer`
- `apps/backend`（Express + TS）
  - 运行：`npm i && npm run dev`
  - 端口：3000
  - 环境变量：复制 `.env.example` 为 `.env`
  - 生成的 CRUD：`src/generated/*.ts` 自动加载
- `packages/generator`：代码生成器
  - 用法：`node packages/generator/index.js --from demo.db --table users`

## 快速开始

1. 启动后端
   ```bash
   cd apps/backend
   cp .env.example .env
   npm i
   npm run dev
   ```
2. 启动前端
   ```bash
   cd ../frontend
   npm i
   npm run dev
   ```
3. 访问
   - `http://localhost:5173/#/lowcode/users`
   - `http://localhost:5173/#/settings`

## JSON Schema 约定（简化）
```json
{
  "title": "用户管理",
  "route": "/lowcode/users",
  "api": { "list": "/api/users/list", "create": "/api/users", "update": "/api/users/:id", "delete": "/api/users/:id" },
  "search": [ { "field": "keyword", "label": "关键词", "widget": "Input" } ],
  "table": {
    "columns": [ { "field": "id", "label": "ID" } ],
    "import": true,
    "export": true
  },
  "form": { "fields": [ { "field": "username", "label": "用户名", "widget": "Input" } ], "submitPerm": "sys:user:add" },
  "rowFilter": "dept_id = ${user.deptId}",
  "workflow": "leave",
  "mock": true,
  "cache": 300
}
```

## MSW 与 Mock
- 前端可在“系统设置”打开“接口 Mock”，开发模式下自动启动 MSW。
- 也可在页面 schema 写 `"mock": true`，由前端 request 兜底返回演示数据。

## 上传存储切换（本地/OSS）
- 后端 `.env` 设置 `UPLOAD_TARGET=local|oss`。为 `oss` 时需配置 `OSS_REGION/OSS_AK/OSS_SK/OSS_BUCKET`。

## 代码生成器
- 需求：已安装 `sqlite3` CLI。
- 示例：
  ```bash
  sqlite3 demo.db 'create table books(id integer primary key, name text not null, price real);'
  node packages/generator/index.js --from demo.db --table books
  ```
- 输出：
  - 前端 `public/schemas/books.json`
  - 后端 `src/generated/books.ts`（自动被加载）
  - 菜单自动追加 `/lowcode/books`