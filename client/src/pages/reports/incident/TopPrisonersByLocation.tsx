import type { FormEvent } from 'react'
import { useState } from 'react'
import { getTopPrisonerIncidentsByLocation } from '../../../api/incident-report.api'
import type { Column } from '../../../components/ui'
import { Button, Card, FormGroup, Input, Table } from '../../../components/ui'
import type { TopPrisonerIncident } from '../../../types/dto/incident-report.dto'

type Row = TopPrisonerIncident & { _idx: number }

const COLUMNS: Column<Row>[] = [
  { key: 'locationName', label: 'Location' },
  {
    key: 'prisonerCode',
    label: 'Prisoner Code',
    width: '140px',
    render: (val) => String(val ?? '—'),
  },
  { key: 'prisonerFirstName', label: 'First Name', render: (val) => String(val ?? '—') },
  { key: 'prisonerLastName', label: 'Last Name', render: (val) => String(val ?? '—') },
  {
    key: 'totalActionsTaken',
    label: 'Total Incidents',
    width: '130px',
    render: (val) => <strong>{String(val)}</strong>,
  },
]

export default function TopPrisonersByLocation() {
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searched, setSearched] = useState(false)
  const [dateError, setDateError] = useState<string | undefined>(undefined)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!startDate || !endDate) {
      setDateError('Both start date and end date are required')
      return
    }
    if (startDate > endDate) {
      setDateError('Start date must be on or before end date')
      return
    }
    setDateError(undefined)
    setLoading(true)
    setError(null)
    setSearched(true)
    try {
      const data = await getTopPrisonerIncidentsByLocation(startDate, endDate)
      setRows(data.map((item, i) => ({ ...item, _idx: i })))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const totalIncidents = rows.reduce((sum, r) => sum + r.totalActionsTaken, 0)

  return (
    <>
      <div className="page-header">
        <h1 className="page-header__title">Top Prisoner Incidents by Location</h1>
        <p className="page-header__subtitle">
          The prisoner with the most incidents at each location within a date range.
        </p>
      </div>

      <Card title="Filter">
        <form onSubmit={handleSubmit} className="report-filter">
          <div className="report-filter__input">
            <FormGroup label="Start Date" htmlFor="startDate" required error={dateError}>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                error={!!dateError}
              />
            </FormGroup>
            <FormGroup label="End Date" htmlFor="endDate" required>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
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
              <p className="stat-card__label">Locations</p>
              <p className="stat-card__value">{rows.length}</p>
            </div>
          </Card>
          <Card>
            <div className="stat-card">
              <p className="stat-card__label">Total Incidents</p>
              <p className="stat-card__value stat-card__value--highlight">{totalIncidents}</p>
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
              emptyMessage="No incidents found in the selected date range"
            />
          </Card>
        </div>
      )}
    </>
  )
}
