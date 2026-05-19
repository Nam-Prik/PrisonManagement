import type { FormEvent } from 'react'
import { useState } from 'react'
import { getConfiscatedItems } from '../../../api/prisonerintake-report.api'
import type { Column } from '../../../components/ui'
import { Button, Card, FormGroup, Input, Table } from '../../../components/ui'
import type { ConfiscatedItemReport } from '../../../types/dto/prisonerintake.dto'

type Row = ConfiscatedItemReport & { _idx: number }

const COLUMNS: Column<Row>[] = [
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
  { key: 'itemName', label: 'Item' },
  { key: 'quantity', label: 'Qty', width: '70px' },
  {
    key: 'remarks',
    label: 'Remarks',
    render: (val) => <span className="cell-muted">{(val as string | null) ?? '—'}</span>,
  },
]

export default function ConfiscatedItems() {
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [itemFilter, setItemFilter] = useState('')
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
      const data = await getConfiscatedItems(fromDate, toDate, itemFilter || undefined)
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
        <h1 className="page-header__title">Confiscated Items</h1>
        <p className="page-header__subtitle">
          List confiscated items from prisoner intakes filtered by date range and optional item
          name.
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
            <FormGroup label="Item Name" htmlFor="itemFilter">
              <Input
                id="itemFilter"
                placeholder="e.g. Knife (optional, exact match)"
                value={itemFilter}
                onChange={(e) => setItemFilter(e.target.value)}
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
            title={rows.length > 0 ? `Results — ${rows.length} item(s)` : 'Results'}
            padding="flush"
          >
            <Table
              columns={COLUMNS}
              data={rows}
              rowKey="_idx"
              loading={loading}
              emptyMessage="No confiscated items found for the selected filters."
            />
          </Card>
        </div>
      )}
    </>
  )
}
