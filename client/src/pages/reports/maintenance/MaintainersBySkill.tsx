import { useState } from 'react'
import { getMaintainersBySkill } from '../../../api/labor-report.api'
import type { Column } from '../../../components/ui'
import { Button, Card, FormGroup, Select, Table } from '../../../components/ui'
import type { MaintainerBySkill, MaintenanceSkill } from '../../../types/dto/labor-report.dto'
import { MAINTENANCE_SKILLS } from '../../../types/dto/labor-report.dto'

type Row = MaintainerBySkill & { _idx: number } & Record<string, unknown>

const COLUMNS: Column<Row>[] = [
  { key: 'firstName', label: 'First Name' },
  { key: 'lastName', label: 'Last Name' },
  { key: 'age', label: 'Age', width: '80px' },
]

const SKILL_OPTIONS = MAINTENANCE_SKILLS.map((s) => ({ value: s, label: s }))

export default function MaintainersBySkill() {
  const [skill, setSkill] = useState<MaintenanceSkill>(MAINTENANCE_SKILLS[0])
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searched, setSearched] = useState(false)

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSearched(true)
    try {
      const data = await getMaintainersBySkill(skill)
      setRows(data.map((item, i) => ({ ...item, _idx: i }) as Row))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="page-header">
        <h1 className="page-header__title">Maintainers by Skill</h1>
        <p className="page-header__subtitle">
          List all maintainers' personal information filtered by a specific maintenance skill.
        </p>
      </div>

      <Card title="Filter">
        <form
          onSubmit={handleSubmit}
          style={{ display: 'flex', alignItems: 'flex-end', gap: 'var(--space-4)' }}
        >
          <div style={{ flex: 1, maxWidth: 320 }}>
            <FormGroup label="Maintenance Skill" htmlFor="skill" required>
              <Select
                id="skill"
                options={SKILL_OPTIONS}
                value={skill}
                onChange={(e) => setSkill(e.target.value as MaintenanceSkill)}
              />
            </FormGroup>
          </div>
          <Button type="submit" loading={loading}>
            Search
          </Button>
        </form>
      </Card>

      {error && (
        <p
          style={{
            color: 'var(--color-danger)',
            margin: 'var(--space-4) 0',
            fontSize: 'var(--font-size-sm)',
          }}
        >
          {error}
        </p>
      )}

      {searched && (
        <div style={{ marginTop: 'var(--space-6)' }}>
          <Card
            title={rows.length > 0 ? `Results — ${rows.length} maintainer(s)` : 'Results'}
            padding="flush"
          >
            <Table
              columns={COLUMNS}
              data={rows}
              rowKey="_idx"
              loading={loading}
              emptyMessage={`No maintainers found with skill "${skill}"`}
            />
          </Card>
        </div>
      )}
    </>
  )
}
