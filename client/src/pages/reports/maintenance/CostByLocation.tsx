import { useState } from 'react'
import { getCostByLocation } from '../../../api/labor-report.api'
import type { Column } from '../../../components/ui'
import { Badge, Button, Card, FormGroup, Select, Table } from '../../../components/ui'
import type { CostByLocation as CostByLocationRow } from '../../../types/dto/labor-report.dto'
import type { MaintStatus } from '../../../types/dto/maintainance.dto'
import { MAINT_STATUSES } from '../../../types/dto/maintainance.dto'

type Row = CostByLocationRow & { _idx: number }

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
    render: (val) => <strong>{String(val)}</strong>,
  },
  {
    key: 'totalCost',
    label: 'Total Cost',
    width: '160px',
    render: (val) => <strong className="cell-primary">฿{Number(val).toLocaleString()}</strong>,
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
      setRows(data.map((item, i) => ({ ...item, _idx: i })))
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
          Total maintenance spend and task count per prison location.
        </p>
      </div>

      <Card title="Filter">
        <form onSubmit={handleSubmit} className="report-filter">
          <div className="report-filter__input">
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

      {error && <p className="page-error">{error}</p>}

      {searched && !loading && rows.length > 0 && (
        <div className="stat-grid">
          <Card>
            <div className="stat-card">
              <p className="stat-card__label">Total Spend</p>
              <p className="stat-card__value stat-card__value--highlight">
                ฿{totalSpend.toLocaleString()}
              </p>
            </div>
          </Card>
          <Card>
            <div className="stat-card">
              <p className="stat-card__label">Total Tasks</p>
              <p className="stat-card__value">{totalTasks}</p>
            </div>
          </Card>
          <Card>
            <div className="stat-card">
              <p className="stat-card__label">Locations</p>
              <p className="stat-card__value">{rows.length}</p>
            </div>
          </Card>
        </div>
      )}

      {searched && (
        <div className="report-results">
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
