import { useState } from 'react'
import { getVisitationAnalysis } from '../../../api/visitation-report.api'
import type { Column } from '../../../components/ui'
import { Button, Card, FormGroup, Input, Table } from '../../../components/ui'
import type { VisitationAnalysisRow } from '../../../types/dto/visitation-report.dto'

const COLUMNS: Column<VisitationAnalysisRow & { _idx: number }>[] = [
  { key: 'prisoner_code', label: 'Prisoner Code', width: '130px' },
  { key: 'prisoner_first_name', label: 'First Name' },
  { key: 'prisoner_last_name', label: 'Last Name' },
  {
    key: 'evaluation_score',
    label: 'Score',
    width: '80px',
    render: (val) => {
      const score = Number(val)
      return (
        <span
          style={{
            color: score > 80 ? 'var(--color-success)' : score < 40 ? 'var(--color-danger)' : '',
          }}
        >
          {score}
        </span>
      )
    },
  },
  { key: 'total_completed_visits', label: 'Visits', width: '80px' },
  { key: 'total_visitation_duration', label: 'Total Min', width: '100px' },
  { key: 'avg_duration_per_visit', label: 'Avg Min', width: '100px' },
  { key: 'unique_visitor_count', label: 'Visitors', width: '100px' },
]

export default function VisitationAnalysis() {
  const [filters, setFilters] = useState({
    prisonerCode: '',
    prisonerFirstName: '',
    prisonerLastName: '',
    scoreFrom: '',
    scoreTo: '',
    dateFrom: '',
    dateTo: '',
  })
  const [rows, setRows] = useState<(VisitationAnalysisRow & { _idx: number })[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searched, setSearched] = useState(false)

  const handleChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSearched(true)
    try {
      const data = await getVisitationAnalysis(filters)
      setRows(data.map((item: any, i: number) => ({ ...item, _idx: i })))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setFilters({
      prisonerCode: '',
      prisonerFirstName: '',
      prisonerLastName: '',
      scoreFrom: '',
      scoreTo: '',
      dateFrom: '',
      dateTo: '',
    })
    setRows([])
    setSearched(false)
  }

  return (
    <>
      <div className="page-header">
        <h1 className="page-header__title">Prisoner Visitation Support Analysis</h1>
        <p className="page-header__subtitle">
          Analytical report on visitation support levels and impact on prisoner evaluation.
        </p>
      </div>

      <Card title="Filter">
        <form onSubmit={handleSubmit}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: 'var(--space-4)',
              marginBottom: 'var(--space-6)',
            }}
          >
            <FormGroup label="Prisoner Code">
              <Input
                placeholder="e.g. P-0001"
                value={filters.prisonerCode}
                onChange={(e) => handleChange('prisonerCode', e.target.value)}
              />
            </FormGroup>
            <FormGroup label="Prisoner First Name">
              <Input
                placeholder="Search first name..."
                value={filters.prisonerFirstName}
                onChange={(e) => handleChange('prisonerFirstName', e.target.value)}
              />
            </FormGroup>
            <FormGroup label="Prisoner Last Name">
              <Input
                placeholder="Search last name..."
                value={filters.prisonerLastName}
                onChange={(e) => handleChange('prisonerLastName', e.target.value)}
              />
            </FormGroup>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-2)' }}>
              <FormGroup label="Score From">
                <Input
                  type="number"
                  placeholder="Min"
                  value={filters.scoreFrom}
                  onChange={(e) => handleChange('scoreFrom', e.target.value)}
                />
              </FormGroup>
              <FormGroup label="Score To">
                <Input
                  type="number"
                  placeholder="Max"
                  value={filters.scoreTo}
                  onChange={(e) => handleChange('scoreTo', e.target.value)}
                />
              </FormGroup>
            </div>
            <FormGroup label="Visit Date From">
              <Input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => handleChange('dateFrom', e.target.value)}
              />
            </FormGroup>
            <FormGroup label="Visit Date To">
              <Input
                type="date"
                value={filters.dateTo}
                onChange={(e) => handleChange('dateTo', e.target.value)}
              />
            </FormGroup>
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'flex-end' }}>
            <Button type="button" variant="secondary" onClick={handleReset}>
              Reset
            </Button>
            <Button type="submit" loading={loading}>
              Search
            </Button>
          </div>
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
              emptyMessage="No analysis data found matching the criteria"
            />
          </Card>
        </div>
      )}
    </>
  )
}
