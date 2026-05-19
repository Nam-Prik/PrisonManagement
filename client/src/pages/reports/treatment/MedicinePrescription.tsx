import type { ChangeEvent, FormEvent } from 'react'
import { useState } from 'react'
import { getMedicinePrescriptionExperience } from '../../../api/treatment-report.api'
import type { Column } from '../../../components/ui'
import { Button, Card, FormGroup, Input, Table } from '../../../components/ui'
import type { MedicinePrescriptionExperience as MedicinePrescriptionExperienceRow } from '../../../types/dto/treatment-report.dto'

type Row = MedicinePrescriptionExperienceRow & { _idx: number }

const COLUMNS: Column<Row>[] = [
  { key: 'code', label: 'Code' },
  { key: 'name', label: 'Name' },
  { key: 'genericName', label: 'Generic Name' },
  { key: 'usageCount', label: 'Usage Count' },
  { key: 'caution', label: 'Caution' },
]

export default function MedicinePrescription() {
  const [caution, setCaution] = useState('Take')
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searched, setSearched] = useState(false)
  const [inputError, setInputError] = useState<string | undefined>(undefined)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!caution.trim()) {
      setInputError('Please enter a caution filter value')
      return
    }

    setInputError(undefined)
    setLoading(true)
    setError(null)
    setSearched(true)

    try {
      const data = await getMedicinePrescriptionExperience(caution.trim())
      setRows(data.map((item, index) => ({ ...item, _idx: index })))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load prescription report')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="page-header">
        <h1 className="page-header__title">Medicine Prescription Usage</h1>
        <p className="page-header__subtitle">
          List medicines that match a caution pattern and how many times they have been prescribed.
        </p>
      </div>

      <Card title="Filter">
        <form onSubmit={handleSubmit} className="report-filter">
          <div className="report-filter__input">
            <FormGroup label="Caution contains" htmlFor="caution" required error={inputError}>
              <Input
                id="caution"
                type="text"
                value={caution}
                placeholder="e.g. Take"
                onChange={(e: ChangeEvent<HTMLInputElement>) => setCaution(e.target.value)}
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
            title={rows.length > 0 ? `Results — ${rows.length} medicine(s)` : 'Results'}
            padding="flush"
          >
            <Table
              columns={COLUMNS}
              data={rows}
              rowKey="_idx"
              loading={loading}
              emptyMessage="No medicines found that match the provided caution text."
            />
          </Card>
        </div>
      )}
    </>
  )
}
