import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { migrate } from './db/migrate.js'
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
app.get('/', (c) => c.json({ status: 'Hello World!' }))
app.get('/health', (c) => c.json({ status: 'healthy!!' }))

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

migrate()
  .then(() => {
    serve({ fetch: app.fetch, port }, () => {
      console.log(`Server running on port ${port}`)
    })
  })
  .catch((err) => {
    console.error('Migration failed:', err)
    process.exit(1)
  })
