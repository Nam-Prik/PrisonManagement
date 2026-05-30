import type { FormEvent } from 'react'
import { useState } from 'react'
import { getOfficerRoutines } from '../../../api/officer-report.api'
import type { Column } from '../../../components/ui'
import { Badge, Button, Card, FormGroup, Input, Table } from '../../../components/ui'
import type { OfficerRoutineItem } from '../../../types/dto/officer-report.dto'

type Row = OfficerRoutineItem & { _idx: number }

const COLUMNS: Column<Row>[] = [
  { key: 'officerCode', label: 'Code', width: '100px' },
  { key: 'officerName', label: 'Officer Name' },
  {
    key: 'scheduleDate',
    label: 'Date',
    width: '130px',
    render: (val) =>
      new Date(val as string).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
  },
  { key: 'routineName', label: 'Routine' },
  {
    key: 'routineType',
    label: 'Type',
    width: '150px',
    render: (val) => <Badge variant="neutral">{String(val)}</Badge>,
  },
  { key: 'locationName', label: 'Location' },
]

export default function OfficerRoutines() {
  const [officerCode, setOfficerCode] = useState('')
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searched, setSearched] = useState(false)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSearched(true)
    try {
      const data = await getOfficerRoutines(officerCode || undefined)
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
        <h1 className="page-header__title">Officer Routines</h1>
        <p className="page-header__subtitle">Deployment schedule and locations for officers.</p>
      </div>

      <Card title="Filter">
        <form onSubmit={handleSubmit} className="report-filter">
          <div className="report-filter__input">
            <FormGroup label="Officer Code" htmlFor="officerCode">
              <Input
                id="officerCode"
                placeholder="e.g. 20 (optional)"
                value={officerCode}
                onChange={(e) => setOfficerCode(e.target.value)}
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
            title={rows.length > 0 ? `Results — ${rows.length} assignment(s)` : 'Results'}
            padding="flush"
          >
            <Table
              columns={COLUMNS}
              data={rows}
              rowKey="_idx"
              loading={loading}
              emptyMessage="No routines found."
            />
          </Card>
        </div>
      )}
    </>
  )
}
