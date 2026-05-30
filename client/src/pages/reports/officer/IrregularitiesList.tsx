import type { FormEvent } from 'react'
import { useState } from 'react'
import { listIrregularities } from '../../../api/officer-report.api'
import type { Column } from '../../../components/ui'
import { Badge, Button, Card, FormGroup, Input, Table } from '../../../components/ui'
import type { IrregularityListItem } from '../../../types/dto/officer-report.dto'

type Row = IrregularityListItem & { _idx: number }

const COLUMNS: Column<Row>[] = [
  {
    key: 'inspectionDate',
    label: 'Date',
    width: '120px',
    render: (val) =>
      new Date(val as string).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
  },
  { key: 'locationName', label: 'Location' },
  {
    key: 'irregularityType',
    label: 'Type',
    width: '150px',
    render: (val) => <Badge variant="neutral">{String(val)}</Badge>,
  },
  { key: 'irregularityDescription', label: 'Description' },
  { key: 'specificFindings', label: 'Findings' },
  { key: 'inspectionReasons', label: 'Inspection Reason' },
]

export default function IrregularitiesList() {
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searched, setSearched] = useState(false)
  const [dateError, setDateError] = useState<string | undefined>(undefined)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (startDate && endDate && startDate > endDate) {
      setDateError('"Start Date" must be on or before "End Date"')
      return
    }

    setDateError(undefined)
    setLoading(true)
    setError(null)
    setSearched(true)

    try {
      const data = await listIrregularities(startDate || undefined, endDate || undefined)
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
        <h1 className="page-header__title">Irregularities List</h1>
        <p className="page-header__subtitle">
          Detailed list of all irregularities found during routines within a specific timeframe.
        </p>
      </div>

      <Card title="Filter">
        <form onSubmit={handleSubmit} className="report-filter">
          <div className="report-filter__input">
            <FormGroup label="Start Date" htmlFor="startDate" error={dateError}>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                error={!!dateError}
              />
            </FormGroup>
            <FormGroup label="End Date" htmlFor="endDate">
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
              emptyMessage="No irregularities found for the selected date range."
            />
          </Card>
        </div>
      )}
    </>
  )
}
