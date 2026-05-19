import type { SubmitEvent } from 'react'
import { useState } from 'react'
import { getTotalItemsPerIntake } from '../../../api/prisonerintake-report.api'
import type { Column } from '../../../components/ui'
import { Button, Card, FormGroup, Input, Table } from '../../../components/ui'
import type { TotalItemsPerIntake } from '../../../types/dto/prisonerintake.dto'

type Row = TotalItemsPerIntake & { _idx: number }

const COLUMNS: Column<Row>[] = [
  { key: 'intakeId', label: 'Intake ID', width: '100px' },
  { key: 'prisonerCode', label: 'Prisoner Code', width: '130px' },
  {
    key: 'intakeDate',
    label: 'Intake Date',
    width: '130px',
    render: (val) =>
      new Date(val as string).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
  },
  {
    key: 'totalItems',
    label: 'Total Items',
    width: '120px',
    render: (val) => <strong>{String(val)}</strong>,
  },
]

export default function TotalItemsAnalysis() {
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [topN, setTopN] = useState('10')
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searched, setSearched] = useState(false)
  const [dateError, setDateError] = useState<string | undefined>(undefined)
  const [topNError, setTopNError] = useState<string | undefined>(undefined)

  const handleSubmit = async (e: SubmitEvent) => {
    e.preventDefault()

    let valid = true
    if (!fromDate || !toDate) {
      setDateError('Both from and to dates are required')
      valid = false
    } else if (fromDate > toDate) {
      setDateError('"From" date must be on or before "To" date')
      valid = false
    } else {
      setDateError(undefined)
    }

    const parsedN = Number(topN)
    if (!topN || Number.isNaN(parsedN) || parsedN <= 0 || !Number.isInteger(parsedN)) {
      setTopNError('Top N must be a positive integer')
      valid = false
    } else {
      setTopNError(undefined)
    }

    if (!valid) return

    setLoading(true)
    setError(null)
    setSearched(true)
    try {
      const data = await getTotalItemsPerIntake(fromDate, toDate, parsedN)
      setRows(data.map((item, i) => ({ ...item, _idx: i })))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const totalItems = rows.reduce((sum, r) => sum + r.totalItems, 0)

  return (
    <>
      <div className="page-header">
        <h1 className="page-header__title">Total Items Analysis</h1>
        <p className="page-header__subtitle">
          Top intakes by total confiscated item quantity within a date range.
        </p>
      </div>

      <Card title="Filter">
        <form onSubmit={handleSubmit} className="report-filter">
          <div className="report-filter__input">
            <FormGroup label="From Date" htmlFor="fromDate" required error={dateError}>
              <Input
                id="fromDate"
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                error={!!dateError}
              />
            </FormGroup>
            <FormGroup label="To Date" htmlFor="toDate" required>
              <Input
                id="toDate"
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                error={!!dateError}
              />
            </FormGroup>
            <FormGroup label="Top N" htmlFor="topN" required error={topNError}>
              <Input
                id="topN"
                type="number"
                min="1"
                step="1"
                placeholder="e.g. 10"
                value={topN}
                onChange={(e) => setTopN(e.target.value)}
                error={!!topNError}
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
              <p className="stat-card__label">Total Items</p>
              <p className="stat-card__value stat-card__value--highlight">{totalItems}</p>
            </div>
          </Card>
          <Card>
            <div className="stat-card">
              <p className="stat-card__label">Intakes Shown</p>
              <p className="stat-card__value">{rows.length}</p>
            </div>
          </Card>
        </div>
      )}

      {searched && (
        <div className="report-results">
          <Card
            title={rows.length > 0 ? `Results — Top ${rows.length} intake(s)` : 'Results'}
            padding="flush"
          >
            <Table
              columns={COLUMNS}
              data={rows}
              rowKey="_idx"
              loading={loading}
              emptyMessage="No intakes with confiscated items found for the selected date range."
            />
          </Card>
        </div>
      )}
    </>
  )
}
