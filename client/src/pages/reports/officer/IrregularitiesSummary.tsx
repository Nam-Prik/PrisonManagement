import type { FormEvent } from 'react'
import { useState } from 'react'
import { getIrregularitiesSummary } from '../../../api/officer-report.api'
import type { Column } from '../../../components/ui'
import { Badge, Button, Card, FormGroup, Input, Table } from '../../../components/ui'
import type { IrregularitySummaryItem } from '../../../types/dto/officer-report.dto'

type Row = IrregularitySummaryItem & { _idx: number }

const COLUMNS: Column<Row>[] = [
  { key: 'inspectionYear', label: 'Year', width: '100px' },
  { key: 'inspectionMonth', label: 'Month', width: '100px' },
  {
    key: 'irregularityType',
    label: 'Irregularity Type',
    render: (val) => <Badge variant="neutral">{String(val)}</Badge>,
  },
  {
    key: 'totalIncidents',
    label: 'Total Incidents',
    width: '150px',
    render: (val) => <strong className="cell-primary">{String(val)}</strong>,
  },
]

export default function IrregularitiesSummary() {
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
      setDateError('Both start and end dates are required')
      return
    }
    if (startDate > endDate) {
      setDateError('"Start Date" must be on or before "End Date"')
      return
    }
    setDateError(undefined)
    setLoading(true)
    setError(null)
    setSearched(true)
    try {
      const data = await getIrregularitiesSummary(startDate, endDate)
      setRows(data.map((item, i) => ({ ...item, _idx: i })))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  // Calculate total incidents across all rows for the Stat Grid
  const totalIncidentsOverall = rows.reduce((sum, r) => sum + r.totalIncidents, 0)

  return (
    <>
      <div className="page-header">
        <h1 className="page-header__title">Irregularities Summary</h1>
        <p className="page-header__subtitle">
          Monthly analysis of irregularities to identify seasonal trends and spikes.
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
                error={!!dateError}
              />
            </FormGroup>
          </div>
          <Button type="submit" loading={loading}>
            Analyze
          </Button>
        </form>
      </Card>

      {error && <p className="page-error">{error}</p>}

      {searched && !loading && rows.length > 0 && (
        <div className="stat-grid">
          <Card>
            <div className="stat-card">
              <p className="stat-card__label">Total Recorded Irregularities</p>
              <p className="stat-card__value stat-card__value--highlight">
                {totalIncidentsOverall}
              </p>
            </div>
          </Card>
          <Card>
            <div className="stat-card">
              <p className="stat-card__label">Unique Categories Found</p>
              <p className="stat-card__value">
                {new Set(rows.map((r) => r.irregularityType)).size}
              </p>
            </div>
          </Card>
        </div>
      )}

      {searched && (
        <div className="report-results">
          <Card
            title={rows.length > 0 ? `Results — ${rows.length} group(s)` : 'Results'}
            padding="flush"
          >
            <Table
              columns={COLUMNS}
              data={rows}
              rowKey="_idx"
              loading={loading}
              emptyMessage="No data found for the selected date range."
            />
          </Card>
        </div>
      )}
    </>
  )
}
