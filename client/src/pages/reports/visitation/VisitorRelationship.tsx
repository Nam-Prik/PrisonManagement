import { useState } from 'react'
import { getVisitorRelationship } from '../../../api/visitation-report.api'
import type { Column } from '../../../components/ui'
import { Button, Card, FormGroup, Input, Select, Table } from '../../../components/ui'
import type { VisitorPrisonerRelationshipRow } from '../../../types/dto/visitation-report.dto'

const GENDER_OPTIONS = [
  { value: 'All', label: 'All Genders' },
  { value: 'M', label: 'Male' },
  { value: 'F', label: 'Female' },
]

const BLOOD_OPTIONS = [
  { value: 'All', label: 'All Blood Types' },
  { value: 'A+', label: 'A+' },
  { value: 'A-', label: 'A-' },
  { value: 'B+', label: 'B+' },
  { value: 'B-', label: 'B-' },
  { value: 'AB+', label: 'AB+' },
  { value: 'AB-', label: 'AB-' },
  { value: 'O+', label: 'O+' },
  { value: 'O-', label: 'O-' },
]

const STATUS_OPTIONS = [
  { value: 'All', label: 'All Statuses' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
]

const COLUMNS: Column<VisitorPrisonerRelationshipRow & { _idx: number }>[] = [
  { key: 'visitor_first_name', label: 'Visitor First Name' },
  { key: 'visitor_last_name', label: 'Visitor Last Name' },
  { key: 'gender', label: 'Gender', width: '100px' },
  { key: 'contact_no', label: 'Contact No' },
  { key: 'blood_type', label: 'Blood Type', width: '120px' },
  { key: 'prisoner_code', label: 'Prisoner Code' },
  {
    key: 'total_visits',
    label: 'Total Visits',
    width: '120px',
    render: (val) => <strong>{String(val)}</strong>,
  },
]

export default function VisitorRelationship() {
  const [filters, setFilters] = useState({
    visitorFirstName: '',
    visitorLastName: '',
    prisonerCode: '',
    gender: 'All',
    bloodType: 'All',
    status: 'All',
    dateFrom: '',
    dateTo: '',
  })
  const [rows, setRows] = useState<(VisitorPrisonerRelationshipRow & { _idx: number })[]>([])
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
      const data = await getVisitorRelationship(filters)
      setRows(data.map((item: any, i: number) => ({ ...item, _idx: i })))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setFilters({
      visitorFirstName: '',
      visitorLastName: '',
      prisonerCode: '',
      gender: 'All',
      bloodType: 'All',
      status: 'All',
      dateFrom: '',
      dateTo: '',
    })
    setRows([])
    setSearched(false)
  }

  return (
    <>
      <div className="page-header">
        <h1 className="page-header__title">Visitor-Prisoner Relationship Summary</h1>
        <p className="page-header__subtitle">
          Summary of relationships and visitation counts between visitors and prisoners.
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
            <FormGroup label="Visitor First Name">
              <Input
                placeholder="Search first name..."
                value={filters.visitorFirstName}
                onChange={(e) => handleChange('visitorFirstName', e.target.value)}
              />
            </FormGroup>
            <FormGroup label="Visitor Last Name">
              <Input
                placeholder="Search last name..."
                value={filters.visitorLastName}
                onChange={(e) => handleChange('visitorLastName', e.target.value)}
              />
            </FormGroup>
            <FormGroup label="Prisoner Code">
              <Input
                placeholder="e.g. P-0001"
                value={filters.prisonerCode}
                onChange={(e) => handleChange('prisonerCode', e.target.value)}
              />
            </FormGroup>
            <FormGroup label="Gender">
              <Select
                options={GENDER_OPTIONS}
                value={filters.gender}
                onChange={(e) => handleChange('gender', e.target.value)}
              />
            </FormGroup>
            <FormGroup label="Blood Type">
              <Select
                options={BLOOD_OPTIONS}
                value={filters.bloodType}
                onChange={(e) => handleChange('bloodType', e.target.value)}
              />
            </FormGroup>
            <FormGroup label="Visit Status">
              <Select
                options={STATUS_OPTIONS}
                value={filters.status}
                onChange={(e) => handleChange('status', e.target.value)}
              />
            </FormGroup>
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
              emptyMessage="No visitation records found matching the criteria"
            />
          </Card>
        </div>
      )}
    </>
  )
}
