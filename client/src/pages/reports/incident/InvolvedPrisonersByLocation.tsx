import type { FormEvent } from 'react'
import { useEffect, useState } from 'react'
import { getInvolvedPrisonersByLocation } from '../../../api/incident-report.api'
import { getPrisonLocations } from '../../../api/prison-location.api'
import type { Column, LovColumn } from '../../../components/ui'
import { Badge, Button, Card, FormGroup, LovButton, Table } from '../../../components/ui'
import type { InvolvedPrisonerByLocation } from '../../../types/dto/incident-report.dto'
import type { PrisonLocation } from '../../../types/dto/prison-location.dto'

type Row = InvolvedPrisonerByLocation & { _idx: number }

const RISK_VARIANT: Record<string, 'danger' | 'warning' | 'neutral'> = {
  'High Risk / Requires Escort': 'danger',
  'Monitor closely': 'warning',
  'Standard Protocol': 'neutral',
}

const LOCATION_LOV_COLUMNS: LovColumn<PrisonLocation>[] = [
  { key: 'code', label: 'Code', width: '80px' },
  { key: 'name', label: 'Name' },
  { key: 'purpose', label: 'Purpose' },
  { key: 'maxCapacity', label: 'Capacity', width: '90px' },
]

const COLUMNS: Column<Row>[] = [
  { key: 'prisonerCode', label: 'Code', width: '130px' },
  { key: 'prisonerFirstName', label: 'First Name' },
  { key: 'prisonerLastName', label: 'Last Name' },
  {
    key: 'incidentDatetime',
    label: 'Incident Date',
    width: '140px',
    render: (val) => new Date(String(val)).toLocaleDateString(),
  },
  { key: 'evaluationScore', label: 'Eval Score', width: '110px' },
  {
    key: 'riskAlert',
    label: 'Risk Alert',
    render: (val) => {
      const label = String(val)
      const variant = RISK_VARIANT[label] ?? 'neutral'
      return <Badge variant={variant}>{label}</Badge>
    },
  },
  { key: 'daysAgo', label: 'Days Ago', width: '100px' },
]

export default function InvolvedPrisonersByLocation() {
  const [locations, setLocations] = useState<PrisonLocation[]>([])
  const [selected, setSelected] = useState<PrisonLocation | null>(null)
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searched, setSearched] = useState(false)
  const [selectError, setSelectError] = useState<string | undefined>(undefined)

  useEffect(() => {
    getPrisonLocations()
      .then(setLocations)
      .catch(() => {})
  }, [])

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!selected) {
      setSelectError('Please select a location')
      return
    }
    setSelectError(undefined)
    setLoading(true)
    setError(null)
    setSearched(true)
    try {
      const data = await getInvolvedPrisonersByLocation(selected.id)
      setRows(data.map((item, i) => ({ ...item, _idx: i })))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const displayValue = selected ? `[${selected.code}] ${selected.name}` : ''

  return (
    <>
      <div className="page-header">
        <h1 className="page-header__title">Involved Prisoners by Location</h1>
        <p className="page-header__subtitle">
          List all prisoners involved in incidents at a specific prison location, including risk
          assessment.
        </p>
      </div>

      <Card title="Filter">
        <form onSubmit={handleSubmit} className="report-filter">
          <div className="report-filter__input">
            <FormGroup label="Prison Location" required error={selectError}>
              <LovButton<PrisonLocation>
                displayValue={displayValue}
                placeholder="Select location…"
                modalTitle="Prison Location"
                columns={LOCATION_LOV_COLUMNS}
                data={locations}
                rowKey="id"
                onSelect={(loc) => {
                  setSelected(loc)
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
              emptyMessage={`No prisoners found for location "${selected?.name}"`}
            />
          </Card>
        </div>
      )}
    </>
  )
}
