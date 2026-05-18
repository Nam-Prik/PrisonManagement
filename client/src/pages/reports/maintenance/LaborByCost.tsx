import type { FormEvent } from 'react'
import { useState } from 'react'
import { getLaborByCost } from '../../../api/labor-report.api'
import type { Column } from '../../../components/ui'
import { Button, Card, FormGroup, Input, Table } from '../../../components/ui'
import type { LaborByCost as LaborByCostRow } from '../../../types/dto/labor-report.dto'

type Row = LaborByCostRow & { _idx: number }

const COLUMNS: Column<Row>[] = [
  { key: 'firstName', label: 'First Name' },
  { key: 'lastName', label: 'Last Name' },
  { key: 'laborTask', label: 'Task' },
  {
    key: 'maintainanceCost',
    label: 'Maintenance Cost',
    width: '160px',
    render: (val) => <strong>฿{Number(val).toLocaleString()}</strong>,
  },
]

export default function LaborByCost() {
  const [minCost, setMinCost] = useState('')
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searched, setSearched] = useState(false)
  const [inputError, setInputError] = useState<string | undefined>(undefined)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const parsed = Number(minCost)
    if (minCost === '' || Number.isNaN(parsed) || parsed < 0) {
      setInputError('Please enter a valid amount (0 or more)')
      return
    }
    setInputError(undefined)
    setLoading(true)
    setError(null)
    setSearched(true)
    try {
      const data = await getLaborByCost(parsed)
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
        <h1 className="page-header__title">Labor by Cost</h1>
        <p className="page-header__subtitle">
          List maintenance assignments where cost exceeds a specified amount.
        </p>
      </div>

      <Card title="Filter">
        <form onSubmit={handleSubmit} className="report-filter">
          <div className="report-filter__input">
            <FormGroup
              label="Minimum Maintenance Cost (฿)"
              htmlFor="minCost"
              required
              error={inputError}
            >
              <Input
                id="minCost"
                type="number"
                min="0"
                step="1"
                placeholder="e.g. 500"
                value={minCost}
                onChange={(e) => setMinCost(e.target.value)}
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
              emptyMessage={`No labor records found with cost greater than ฿${Number(minCost).toLocaleString()}`}
            />
          </Card>
        </div>
      )}
    </>
  )
}
