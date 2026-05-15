import { useEffect, useState } from 'react'
import { getNurseWorkloadPercentage } from '../../../api/treatment-report.api'
import type { Column } from '../../../components/ui'
import { Card, Table } from '../../../components/ui'
import type { NurseWorkloadPercentage as NurseWorkloadPercentageRow } from '../../../types/dto/treatment-report.dto'

type Row = NurseWorkloadPercentageRow & { _idx: number }

const TOP_COUNT = 5

const rowStyle = (index: number) => {
  const isTop = index < TOP_COUNT
  return isTop
    ? {
        backgroundColor: 'var(--color-primary-bg)',
        borderLeft: '4px solid var(--color-primary)',
        borderBottom: index === TOP_COUNT - 1 ? '2px solid var(--color-primary-border)' : undefined,
      }
    : undefined
}

const COLUMNS: Column<Row>[] = [
  {
    key: 'rank',
    label: 'Rank',
    width: '80px',
    render: (_value, _row, index) => (index < TOP_COUNT ? `#${index + 1}` : ''),
  },
  { key: 'firstName', label: 'First Name' },
  { key: 'lastName', label: 'Last Name' },
  {
    key: 'workloadPercentage',
    label: 'Workload (%)',
    render: (value) => `${Number(value).toFixed(2)}%`,
  },
]

export default function NurseWorkload() {
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await getNurseWorkloadPercentage()
        setRows(data.map((item, index) => ({ ...item, _idx: index })))
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load nurse workload report')
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [])

  const totalNurses = rows.length
  const visibleTop = Math.min(TOP_COUNT, totalNurses)

  return (
    <>
      <div className="page-header">
        <h1 className="page-header__title">Nurse Workload Percentage</h1>
        <p className="page-header__subtitle">
          Top {visibleTop} nurses are highlighted with orange accent rows and a rank label.
        </p>
      </div>

      {error && <p className="page-error">{error}</p>}

      <div className="report-results">
        <Card title={`Top ${visibleTop} of ${totalNurses} Nurses`} padding="flush">
          <Table
            columns={COLUMNS}
            data={rows}
            rowKey="_idx"
            loading={loading}
            rowStyle={(_row, index) => rowStyle(index)}
            emptyMessage="No nurse workload data available."
          />
        </Card>
      </div>
    </>
  )
}
