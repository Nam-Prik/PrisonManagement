import type { FormEvent } from 'react'
import { useState } from 'react'
import { getIntakesByDateRange } from '../../../api/prisonerintake-report.api'
import type { Column } from '../../../components/ui'
import { Badge, Button, Card, FormGroup, Input, Table } from '../../../components/ui'
import type { IntakeByDateRange as IntakeRow } from '../../../types/dto/prisonerintake.dto'

type Row = IntakeRow & { _idx: number }

const COLUMNS: Column<Row>[] = [
  { key: 'prisonerCode', label: 'Code', width: '110px' },
  { key: 'prisonerName', label: 'Prisoner Name' },
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
    key: 'initialHealthStatus',
    label: 'Health Status',
    width: '170px',
    render: (val) => <Badge variant="neutral">{val as string}</Badge>,
  },
]

export default function IntakeByDateRange() {
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [prisonerCode, setPrisonerCode] = useState('')
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searched, setSearched] = useState(false)
  const [dateError, setDateError] = useState<string | undefined>(undefined)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!fromDate || !toDate) {
      setDateError('Both from and to dates are required')
      return
    }
    if (fromDate > toDate) {
      setDateError('"From" date must be on or before "To" date')
      return
    }
    setDateError(undefined)
    setLoading(true)
    setError(null)
    setSearched(true)
    try {
      const data = await getIntakesByDateRange(fromDate, toDate, prisonerCode || undefined)
      setRows(data.map((item, i) => ({ ...item, _idx: i })))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="page-header">
        <h1 className="page-header__title">Intake by Date Range</h1>
        <p className="page-header__subtitle">
          List prisoner intake records filtered by date range and optional prisoner code.
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
            <FormGroup label="Prisoner Code" htmlFor="prisonerCode">
              <Input
                id="prisonerCode"
                placeholder="e.g. P-0001 (optional)"
                value={prisonerCode}
                onChange={(e) => setPrisonerCode(e.target.value)}
              />
            </FormGroup>
          </div>
          <Button type="submit" loading={loading}>
            Search
          </Button>
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
              emptyMessage="No intake records found for the selected filters."
            />
          </Card>
        </div>
      )}
    </>
  )
}
