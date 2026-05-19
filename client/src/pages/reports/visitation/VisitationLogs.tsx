import type { FormEvent } from 'react'
import { useState } from 'react'
import { getVisitationLogs } from '../../../api/visitation-report.api'
import type { Column } from '../../../components/ui'
import { Button, Card, FormGroup, Input, Select, Table } from '../../../components/ui'
import type {
  VisitationLogFilters,
  VisitationLogRow,
} from '../../../types/dto/visitation-report.dto'

type Row = VisitationLogRow & { _idx: number }

const STATUS_OPTIONS = [
  { value: 'All', label: 'All Statuses' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
]

const COLUMNS: Column<Row>[] = [
  { key: 'prisoner_code', label: 'Prisoner Code', width: '140px' },
  {
    key: 'visitment_date',
    label: 'Date',
    width: '140px',
    render: (val) => new Date(String(val)).toLocaleDateString(),
  },
  { key: 'duration', label: 'Duration (min)', width: '120px' },
  { key: 'description', label: 'Description' },
  { key: 'visitor_first_name', label: 'Visitor First' },
  { key: 'visitor_last_name', label: 'Visitor Last' },
]

export default function VisitationLogs() {
  const [filters, setFilters] = useState<VisitationLogFilters>({
    prisonerCode: '',
    visitorFirstName: '',
    visitorLastName: '',
    status: 'All',
    dateFrom: '',
    dateTo: '',
  })
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searched, setSearched] = useState(false)

  const handleChange = (key: keyof VisitationLogFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSearched(true)
    try {
      const data = await getVisitationLogs(filters)
      setRows(data.map((item, i) => ({ ...item, _idx: i })))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setFilters({
      prisonerCode: '',
      visitorFirstName: '',
      visitorLastName: '',
      status: 'All',
      dateFrom: '',
      dateTo: '',
    })
    setRows([])
    setSearched(false)
  }

  return (
    <>
      <div className="page-header">
        <h1 className="page-header__title">Prisoner Visitation Logs</h1>
        <p className="page-header__subtitle">
          Detailed log of all visitation sessions per prisoner.
        </p>
      </div>

      <Card title="Filter">
        <form onSubmit={handleSubmit}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: 'var(--space-4)',
              marginBottom: 'var(--space-6)',
            }}
          >
            <FormGroup label="Prisoner Code">
              <Input
                placeholder="e.g. P-0001"
                value={filters.prisonerCode}
                onChange={(e) => handleChange('prisonerCode', e.target.value)}
              />
            </FormGroup>
            <FormGroup label="Visitor First Name">
              <Input
                placeholder="Search visitor first name..."
                value={filters.visitorFirstName}
                onChange={(e) => handleChange('visitorFirstName', e.target.value)}
              />
            </FormGroup>
            <FormGroup label="Visitor Last Name">
              <Input
                placeholder="Search visitor last name..."
                value={filters.visitorLastName}
                onChange={(e) => handleChange('visitorLastName', e.target.value)}
              />
            </FormGroup>
            <FormGroup label="Visit Status">
              <Select
                options={STATUS_OPTIONS}
                value={filters.status}
                onChange={(e) => handleChange('status', e.target.value)}
              />
            </FormGroup>
            <FormGroup label="Visitation Date From">
              <Input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => handleChange('dateFrom', e.target.value)}
              />
            </FormGroup>
            <FormGroup label="Visitation Date To">
              <Input
                type="date"
                value={filters.dateTo}
                onChange={(e) => handleChange('dateTo', e.target.value)}
              />
            </FormGroup>
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'flex-end' }}>
            <Button type="button" variant="secondary" onClick={handleReset}>
              Reset
            </Button>
            <Button type="submit" loading={loading}>
              Search
            </Button>
          </div>
        </form>
      </Card>

      {error && <p className="page-error">{error}</p>}

      {searched && (
        <div className="report-results">
          <Card
            title={rows.length > 0 ? `Results — ${rows.length} record(s)` : 'Results'}
            padding="flush"
          >
            <Table
              columns={COLUMNS}
              data={rows}
              rowKey="_idx"
              loading={loading}
              emptyMessage="No visitation logs found matching the criteria"
            />
          </Card>
        </div>
      )}
    </>
  )
}
