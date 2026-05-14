import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import router from './routes/index.js'
import type { ErrorResponse } from './types/response.js'

const app = new Hono()

app.use('*', logger())
app.use(
  '*',
  cors({
    origin: process.env.CLIENT_URL ?? 'http://localhost:5173',
    credentials: true,
  })
)

app.route('/api', router)

app.get('/health', (c) => c.json({ status: 'ok' }))

app.notFound((c) =>
  c.json<ErrorResponse>({ error: 'Not Found', message: 'Route not found', statusCode: 404 }, 404)
)

app.onError((err, c) => {
  console.error(err)
  return c.json<ErrorResponse>(
    { error: 'Internal Server Error', message: err.message, statusCode: 500 },
    500
  )
})

const port = Number(process.env.PORT) || 3000

serve({ fetch: app.fetch, port }, () => {
  console.log(`Server running on port ${port}`)
})

export default app
