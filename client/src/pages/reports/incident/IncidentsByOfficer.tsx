import type { FormEvent } from 'react'
import { useEffect, useState } from 'react'
import { getIncidentsByOfficer } from '../../../api/incident-report.api'
import { getOfficerOptions } from '../../../api/officer.api'
import type { Column, LovColumn } from '../../../components/ui'
import { Button, Card, FormGroup, LovButton, Table } from '../../../components/ui'
import type { IncidentByOfficer } from '../../../types/dto/incident-report.dto'
import type { OfficerOption } from '../../../types/dto/officer.dto'

type Row = IncidentByOfficer & { _idx: number }

const OFFICER_LOV_COLUMNS: LovColumn<OfficerOption>[] = [
  { key: 'code', label: 'Code', width: '70px' },
  { key: 'rank', label: 'Rank', width: '150px' },
  { key: 'firstName', label: 'First Name' },
  { key: 'lastName', label: 'Last Name' },
]

const COLUMNS: Column<Row>[] = [
  { key: 'incidentId', label: 'ID', width: '70px' },
  {
    key: 'incidentDatetime',
    label: 'Date',
    width: '130px',
    render: (val) => new Date(String(val)).toLocaleDateString(),
  },
  { key: 'locationName', label: 'Location' },
  { key: 'description', label: 'Description' },
  { key: 'daysSinceIncident', label: 'Days Ago', width: '100px' },
  {
    key: 'prisonerCode',
    label: 'Prisoner Code',
    width: '140px',
    render: (val) => String(val ?? '—'),
  },
  { key: 'prisonerFirstName', label: 'First Name', render: (val) => String(val ?? '—') },
  { key: 'prisonerLastName', label: 'Last Name', render: (val) => String(val ?? '—') },
]

export default function IncidentsByOfficer() {
  const [officers, setOfficers] = useState<OfficerOption[]>([])
  const [selected, setSelected] = useState<OfficerOption | null>(null)
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searched, setSearched] = useState(false)
  const [selectError, setSelectError] = useState<string | undefined>(undefined)

  useEffect(() => {
    getOfficerOptions()
      .then(setOfficers)
      .catch(() => {})
  }, [])

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!selected) {
      setSelectError('Please select an officer')
      return
    }
    setSelectError(undefined)
    setLoading(true)
    setError(null)
    setSearched(true)
    try {
      const data = await getIncidentsByOfficer(selected.id)
      setRows(data.map((item, i) => ({ ...item, _idx: i })))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const displayValue = selected
    ? `[${selected.code}] ${selected.firstName} ${selected.lastName}`
    : ''

  return (
    <>
      <div className="page-header">
        <h1 className="page-header__title">Incidents by Officer</h1>
        <p className="page-header__subtitle">
          List all incidents documented by a specific reporting officer.
        </p>
      </div>

      <Card title="Filter">
        <form onSubmit={handleSubmit} className="report-filter">
          <div className="report-filter__input">
            <FormGroup label="Reporting Officer" required error={selectError}>
              <LovButton<OfficerOption>
                displayValue={displayValue}
                placeholder="Select officer…"
                modalTitle="Reporting Officer"
                columns={OFFICER_LOV_COLUMNS}
                data={officers}
                rowKey="id"
                onSelect={(o) => {
                  setSelected(o)
                  setSelectError(undefined)
                }}
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
              emptyMessage={`No incidents found for officer "${selected?.firstName} ${selected?.lastName}"`}
            />
          </Card>
        </div>
      )}
    </>
  )
}
