# Lowcode Admin (Fantastic-admin-like)

- JSON 驱动的运行时渲染（SearchForm、DataTable、FormDialog、CrudMixin）
- 权限码驱动的按钮/字段显隐与禁用
- 主题/布局/Logo/菜单顺序等系统设置，实时热更新（Pinia 持久化）
- 自定义组件插件机制：`src/lowcode/plugins/*` 自动注册，JSON 里 `"widget": "MyUploader"`
- 代码生成器（雏形）：从表结构生成 JSON 配置 + 基础 CRUD API + 前端路由

## 目录结构

- `apps/frontend`：Vue 3 + Vite + TS + Element Plus + Pinia
- `apps/backend`：Express + TS（示例 CRUD 与权限、上传接口）
- `packages/generator`：代码生成器（雏形）
- `packages/schemas`：共享 JSON schema（也可由代码生成器输出到 `apps/frontend/public/schemas`）

## 快速开始

1. 安装依赖
   - 前端：`cd apps/frontend && npm i`
   - 后端：`cd ../../apps/backend && npm i`
2. 启动
   - 后端：`npm run dev`
   - 前端：`cd ../frontend && npm run dev`
3. 访问
   - 前端：`http://localhost:5173/#/lowcode/users`

## 权限系统
- 登录后后端返回权限码数组（示例：`sys:user:add`），存入 `Pinia`。
- JSON 字段/按钮可带 `perm`。若无对应权限则隐藏或禁用（按 `authMode` 生效）。

## JSON Schema 约定（简化示例）
```json
{
  "title": "用户管理",
  "route": "/lowcode/users",
  "api": {
    "list": "/api/users/list",
    "create": "/api/users",
    "update": "/api/users/:id",
    "delete": "/api/users/:id"
  },
  "search": [
    { "field": "keyword", "label": "关键词", "widget": "Input", "props": {"placeholder": "用户名/邮箱"} }
  ],
  "table": {
    "columns": [
      { "field": "id", "label": "ID" },
      { "field": "username", "label": "用户名" },
      { "field": "email", "label": "邮箱" }
    ],
    "rowActions": [
      { "type": "edit", "label": "编辑", "perm": "sys:user:edit" },
      { "type": "delete", "label": "删除", "perm": "sys:user:delete" }
    ]
  },
  "form": {
    "fields": [
      { "field": "username", "label": "用户名", "widget": "Input", "rules": [{"required": true, "message": "必填"}] },
      { "field": "email", "label": "邮箱", "widget": "Input", "rules": [{"type": "email", "message": "邮箱格式不正确"}] },
      { "field": "status", "label": "状态", "widget": "Select", "options": [{"label":"启用","value":1},{"label":"禁用","value":0}] }
    ],
    "submitPerm": "sys:user:add"
  }
}
```

## 插件组件
- 放在 `apps/frontend/src/lowcode/plugins/`，导出默认 Vue 组件。
- JSON 用 `"widget": "MyUploader"` 即可被自动解析渲染。

## 上传存储切换
- 后端 `UPLOAD_TARGET` 环境变量：`local` | `oss`（示例中 `oss` 为占位接口，可接入阿里云 SDK）。

## 生成器（雏形）
- 命令：`node packages/generator/index.js --from sqlite.db --table users`
- 输出：`apps/frontend/public/schemas/users.json` + 后端 CRUD 模块骨架 + 前端路由追加。