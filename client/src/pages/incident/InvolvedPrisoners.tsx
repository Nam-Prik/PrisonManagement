import { Cross2Icon, PlusIcon, TrashIcon } from '@radix-ui/react-icons'
import { useState } from 'react'
import type { LovColumn } from '../../components/ui'
import { Button, LovButton } from '../../components/ui'
import type { InvolvedPrisonerItem } from '../../types/dto/incident.dto'
import type { PrisonerOption } from '../../types/dto/prisoner.dto'

const PRISONER_LOV_COLUMNS: LovColumn<PrisonerOption>[] = [
  { key: 'code', label: 'Code', width: '100px' },
  { key: 'firstName', label: 'First Name' },
  { key: 'lastName', label: 'Last Name' },
  { key: 'evaluationScore', label: 'Score', width: '70px' },
]

interface Props {
  items: InvolvedPrisonerItem[]
  allPrisoners: PrisonerOption[]
  onAdd: (item: InvolvedPrisonerItem) => void
  onRemove: (index: number) => void
}

export default function InvolvedPrisoners({ items, allPrisoners, onAdd, onRemove }: Props) {
  const [isAdding, setIsAdding] = useState(false)
  const [selected, setSelected] = useState<PrisonerOption | null>(null)

  const usedIds = new Set(items.map((p) => p.prisonerId))
  const available = allPrisoners.filter((p) => !usedIds.has(p.id))

  const confirmAdd = () => {
    if (!selected) return
    onAdd({
      prisonerId: selected.id,
      prisonerCode: selected.code,
      firstName: selected.firstName,
      lastName: selected.lastName,
    })
    setSelected(null)
    setIsAdding(false)
  }

  const cancelAdd = () => {
    setSelected(null)
    setIsAdding(false)
  }

  const hasRows = items.length > 0 || isAdding

  return (
    <div className="involved-items">
      <div className="involved-items__wrap">
        <table className="involved-table">
          <thead>
            <tr>
              <th className="involved-table__th involved-table__th--idx">#</th>
              <th className="involved-table__th">Code</th>
              <th className="involved-table__th">First Name</th>
              <th className="involved-table__th">Last Name</th>
              <th className="involved-table__th involved-table__th--actions" />
            </tr>
          </thead>

          <tbody>
            {!hasRows && (
              <tr>
                <td colSpan={5} className="involved-table__empty">
                  No prisoners involved. Use "+ Add Prisoner" below.
                </td>
              </tr>
            )}

            {items.map((item, idx) => (
              <tr key={item.prisonerId} className="involved-table__row">
                <td className="involved-table__td involved-table__td--idx">{idx + 1}</td>
                <td className="involved-table__td">{item.prisonerCode}</td>
                <td className="involved-table__td involved-table__td--name">{item.firstName}</td>
                <td className="involved-table__td">{item.lastName}</td>
                <td className="involved-table__td involved-table__td--actions">
                  <Button
                    variant="danger"
                    size="sm"
                    iconOnly
                    title="Remove"
                    onClick={() => onRemove(idx)}
                  >
                    <TrashIcon width={14} height={14} />
                  </Button>
                </td>
              </tr>
            ))}

            {isAdding && (
              <tr className="involved-table__row involved-table__row--adding">
                <td className="involved-table__td involved-table__td--idx">
                  <PlusIcon width={13} height={13} style={{ color: 'var(--color-text-muted)' }} />
                </td>
                <td className="involved-table__td" colSpan={3}>
                  <LovButton<PrisonerOption>
                    displayValue={
                      selected
                        ? `[${selected.code}] ${selected.firstName} ${selected.lastName}`
                        : ''
                    }
                    placeholder="Select prisoner…"
                    modalTitle="Select Prisoner"
                    columns={PRISONER_LOV_COLUMNS}
                    data={available}
                    rowKey="id"
                    onSelect={(p) => setSelected(p)}
                  />
                </td>
                <td className="involved-table__td involved-table__td--actions">
                  <Button size="sm" variant="primary" onClick={confirmAdd} disabled={!selected}>
                    Add
                  </Button>
                  <Button size="sm" variant="secondary" iconOnly onClick={cancelAdd} title="Cancel">
                    <Cross2Icon width={13} height={13} />
                  </Button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {!isAdding && available.length > 0 && (
        <div className="involved-items__toolbar">
          <Button type="button" variant="secondary" size="sm" onClick={() => setIsAdding(true)}>
            <PlusIcon width={13} height={13} /> Add Prisoner
          </Button>
        </div>
      )}
    </div>
  )
}
