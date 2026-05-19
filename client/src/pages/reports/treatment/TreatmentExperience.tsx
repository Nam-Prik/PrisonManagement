import type { ChangeEvent, FormEvent } from 'react'
import { useState } from 'react'
import { getTreatmentExperience } from '../../../api/treatment-report.api'
import type { Column } from '../../../components/ui'
import { Button, Card, FormGroup, Input, Table } from '../../../components/ui'
import type { TreatmentExperience as TreatmentExperienceRow } from '../../../types/dto/treatment-report.dto'

type Row = TreatmentExperienceRow & { _idx: number }

const COLUMNS: Column<Row>[] = [
  {
    key: 'diagnoseDate',
    label: 'Diagnose Date',
    render: (value) => {
      if (typeof value !== 'string') return ''
      return value.slice(0, 10)
    },
  },
  { key: 'prisonerFirstName', label: 'Prisoner First Name' },
  { key: 'prisonerLastName', label: 'Prisoner Last Name' },
  { key: 'nurseFirstName', label: 'Nurse First Name' },
  { key: 'nurseLastName', label: 'Nurse Last Name' },
  { key: 'description', label: 'Description' },
]

export default function TreatmentExperience() {
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searched, setSearched] = useState(false)
  const [inputError, setInputError] = useState<string | undefined>(undefined)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!startDate || !endDate) {
      setInputError('Please select both start and end dates')
      return
    }

    const start = new Date(startDate)
    const end = new Date(endDate)

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      setInputError('Please enter valid dates')
      return
    }

    if (start > end) {
      setInputError('Start date cannot be later than end date')
      return
    }

    setInputError(undefined)
    setLoading(true)
    setError(null)
    setSearched(true)

    try {
      const data = await getTreatmentExperience(startDate, endDate)
      setRows(data.map((item, index) => ({ ...item, _idx: index })))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load treatment experience report')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="page-header">
        <h1 className="page-header__title">Treatment Experience</h1>
        <p className="page-header__subtitle">
          View prisoner treatment records and attending nurse details within a date range.
        </p>
      </div>

      <Card title="Filter">
        <form onSubmit={handleSubmit} className="report-filter">
          <div className="report-filter__input">
            <FormGroup label="Start Date" htmlFor="startDate" required error={inputError}>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setStartDate(e.target.value)}
                error={!!inputError}
              />
            </FormGroup>
          </div>
          <div className="report-filter__input">
            <FormGroup label="End Date" htmlFor="endDate" required error={inputError}>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setEndDate(e.target.value)}
                error={!!inputError}
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
              emptyMessage="No treatment records found for the selected date range."
            />
          </Card>
        </div>
      )}
    </>
  )
}
