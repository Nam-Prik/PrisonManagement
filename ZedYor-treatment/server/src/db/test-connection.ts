import pg from 'pg'

const { Pool } = pg

const url = process.env.DATABASE_URL

console.log('DATABASE_URL:', url ? `${url.slice(0, 30)}...` : 'UNDEFINED ← env not loaded!')

if (!url) {
  console.error('Fix: run with --env-file=.env or set DATABASE_URL')
  process.exit(1)
}

const pool = new Pool({ connectionString: url })

try {
  const result = await pool.query<{ now: string }>('SELECT NOW() as now')
  console.log('Connected! DB time:', result.rows[0].now)
} catch (err) {
  console.error('Connection failed:', err)
} finally {
  await pool.end()
}
