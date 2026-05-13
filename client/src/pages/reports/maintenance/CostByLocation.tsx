import { useState } from 'react'
import { getCostByLocation } from '../../../api/labor-report.api'
import type { Column } from '../../../components/ui'
import { Badge, Button, Card, FormGroup, Select, Table } from '../../../components/ui'
import type { CostByLocation as CostByLocationRow } from '../../../types/dto/labor-report.dto'
import type { MaintStatus } from '../../../types/dto/maintainance.dto'
import { MAINT_STATUSES } from '../../../types/dto/maintainance.dto'

type Row = CostByLocationRow & { _idx: number } & Record<string, unknown>

const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  ...MAINT_STATUSES.map((s) => ({ value: s, label: s })),
]

const COLUMNS: Column<Row>[] = [
  {
    key: 'locationCode',
    label: 'Code',
    width: '100px',
    render: (val) => <Badge variant="neutral">{String(val)}</Badge>,
  },
  { key: 'locationName', label: 'Location' },
  {
    key: 'totalTasks',
    label: 'Total Tasks',
    width: '120px',
    render: (val) => (
      <span style={{ fontWeight: 'var(--font-weight-medium)' as string }}>{String(val)}</span>
    ),
  },
  {
    key: 'totalCost',
    label: 'Total Cost',
    width: '160px',
    render: (val) => (
      <span
        style={{
          fontWeight: 'var(--font-weight-semibold)' as string,
          color: 'var(--color-primary)',
        }}
      >
        ฿{Number(val).toLocaleString()}
      </span>
    ),
  },
]

export default function CostByLocation() {
  const [status, setStatus] = useState<MaintStatus | ''>('')
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searched, setSearched] = useState(false)

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSearched(true)
    try {
      const data = await getCostByLocation(status)
      setRows(data.map((item, i) => ({ ...item, _idx: i }) as Row))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const totalSpend = rows.reduce((sum, r) => sum + r.totalCost, 0)
  const totalTasks = rows.reduce((sum, r) => sum + r.totalTasks, 0)

  return (
    <>
      <div className="page-header">
        <h1 className="page-header__title">Cost by Location</h1>
        <p className="page-header__subtitle">
          Total maintenance spend and task count per prison location, grouped by status.
        </p>
      </div>

      <Card title="Filter">
        <form
          onSubmit={handleSubmit}
          style={{ display: 'flex', alignItems: 'flex-end', gap: 'var(--space-4)' }}
        >
          <div style={{ flex: 1, maxWidth: 320 }}>
            <FormGroup label="Task Status" htmlFor="status" required>
              <Select
                id="status"
                options={STATUS_OPTIONS}
                value={status}
                onChange={(e) => setStatus(e.target.value as MaintStatus | '')}
              />
            </FormGroup>
          </div>
          <Button type="submit" loading={loading}>
            Search
          </Button>
        </form>
      </Card>

      {error && (
        <p
          style={{
            color: 'var(--color-danger)',
            margin: 'var(--space-4) 0',
            fontSize: 'var(--font-size-sm)',
          }}
        >
          {error}
        </p>
      )}

      {searched && !loading && rows.length > 0 && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 'var(--space-4)',
            margin: 'var(--space-6) 0',
          }}
        >
          {[
            { label: 'Total Spend', value: `฿${totalSpend.toLocaleString()}`, highlight: true },
            { label: 'Total Tasks', value: String(totalTasks), highlight: false },
            { label: 'Locations', value: String(rows.length), highlight: false },
          ].map(({ label, value, highlight }) => (
            <Card key={label}>
              <div style={{ textAlign: 'center' }}>
                <p
                  style={{
                    fontSize: 'var(--font-size-xs)',
                    color: 'var(--color-text-secondary)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    fontWeight: 'var(--font-weight-semibold)' as string,
                    marginBottom: 'var(--space-1)',
                  }}
                >
                  {label}
                </p>
                <p
                  style={{
                    fontSize: 'var(--font-size-2xl)',
                    fontWeight: 'var(--font-weight-bold)' as string,
                    color: highlight ? 'var(--color-primary)' : 'var(--color-text-primary)',
                  }}
                >
                  {value}
                </p>
              </div>
            </Card>
          ))}
        </div>
      )}

      {searched && (
        <div style={{ marginTop: 'var(--space-6)' }}>
          <Card
            title={rows.length > 0 ? `Results — ${rows.length} location(s)` : 'Results'}
            padding="flush"
          >
            <Table
              columns={COLUMNS}
              data={rows}
              rowKey="_idx"
              loading={loading}
              emptyMessage={
                status ? `No records found with status "${status}"` : 'No maintenance records found'
              }
            />
          </Card>
        </div>
      )}
    </>
  )
}
