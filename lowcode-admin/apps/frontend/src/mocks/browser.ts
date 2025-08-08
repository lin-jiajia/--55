import { setupWorker } from 'msw/browser'
import { http, HttpResponse } from 'msw'

export const handlers = [
  http.get('/api/users/list', async () => {
    const data = [
      { id: 1, username: 'alice', email: 'alice@example.com', phone: '13312345678', dept_id: 'd_100' },
      { id: 2, username: 'bob', email: 'bob@example.com', phone: '15587654321', dept_id: 'd_200' }
    ]
    return HttpResponse.json({ data })
  }),
  http.post('/api/users', () => HttpResponse.json({ success: true })),
  http.put('/api/users/:id', () => HttpResponse.json({ success: true })),
  http.delete('/api/users/:id', () => HttpResponse.json({ success: true })),
  http.post('/api/workflow/:name/:action', () => HttpResponse.json({ success: true }))
]

export const worker = setupWorker(...handlers)