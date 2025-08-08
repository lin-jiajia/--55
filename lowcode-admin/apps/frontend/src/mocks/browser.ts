import { setupWorker, rest } from 'msw'

export const handlers = [
  rest.get('/api/users/list', async (req, res, ctx) => {
    const data = [
      { id: 1, username: 'alice', email: 'alice@example.com', phone: '13312345678', dept_id: 'd_100' },
      { id: 2, username: 'bob', email: 'bob@example.com', phone: '15587654321', dept_id: 'd_200' }
    ]
    return res(ctx.status(200), ctx.json({ data }))
  }),
  rest.post('/api/users', (req, res, ctx) => res(ctx.json({ success: true }))),
  rest.put('/api/users/:id', (req, res, ctx) => res(ctx.json({ success: true }))),
  rest.delete('/api/users/:id', (req, res, ctx) => res(ctx.json({ success: true }))),
  rest.post('/api/workflow/:name/:action', (req, res, ctx) => res(ctx.json({ success: true })))
]

export const worker = setupWorker(...handlers)