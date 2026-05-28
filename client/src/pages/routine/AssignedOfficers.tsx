import { PlusIcon, TrashIcon } from '@radix-ui/react-icons'
import { useState } from 'react'
import type { LovColumn } from '../../components/ui'
import { Button, LovButton } from '../../components/ui'
import type { OfficerOption } from '../../types/dto/officer.dto'
import type { RoutineOfficer } from '../../types/dto/routine.dto'

// Define a flexible type that Biome accepts for the dropdown
type ExtendedOfficerOption = OfficerOption & {
  person?: { firstName: string; lastName: string }
  name?: string
}

const OFFICER_LOV_COLUMNS: LovColumn<ExtendedOfficerOption>[] = [
  { key: 'id', label: 'ID', width: '60px' },
  { key: 'code', label: 'Code', width: '100px' },
  { key: 'rank', label: 'Rank' },
]

interface Props {
  items: RoutineOfficer[]
  allOfficers: ExtendedOfficerOption[]
  onAdd: (item: RoutineOfficer) => void
  onRemove: (index: number) => void
}

export default function AssignedOfficers({ items, allOfficers, onAdd, onRemove }: Props) {
  const [isAdding, setIsAdding] = useState(false)

  const handleSelect = (officer: ExtendedOfficerOption) => {
    const name = officer.person
      ? `${officer.person.firstName} ${officer.person.lastName}`
      : officer.name || 'Unknown Officer'

    onAdd({
      officerId: officer.id,
      officerCode: officer.code,
      officerName: name,
    })
    setIsAdding(false)
  }

  const usedIds = new Set(items.map((i) => i.officerId))
  const addAvailable = allOfficers.filter((o) => !usedIds.has(o.id))
  const hasRows = items.length > 0 || isAdding

  return (
    <div className="labor-items">
      <div className="labor-items__wrap">
        <table className="labor-table">
          <thead>
            <tr>
              <th className="labor-table__th labor-table__th--idx">#</th>
              <th className="labor-table__th">Officer Code</th>
              <th className="labor-table__th">Officer Name</th>
              <th className="labor-table__th labor-table__th--actions" />
            </tr>
          </thead>
          <tbody>
            {!hasRows && (
              <tr>
                <td colSpan={4} className="labor-table__empty">
                  No officers assigned. Use "+ Assign Officer" below.
                </td>
              </tr>
            )}

            {items.map((item, idx) => (
              <tr key={item.officerId} className="labor-table__row">
                <td className="labor-table__td labor-table__td--idx">{idx + 1}</td>
                <td className="labor-table__td">
                  <span className="cell-bold">{item.officerCode}</span>
                </td>
                <td className="labor-table__td labor-table__td--name">{item.officerName}</td>
                <td className="labor-table__td labor-table__td--actions">
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
              <tr className="labor-table__row labor-table__row--adding">
                <td className="labor-table__td labor-table__td--idx">
                  <PlusIcon width={13} height={13} style={{ color: 'var(--color-text-muted)' }} />
                </td>
                <td className="labor-table__td" colSpan={2}>
                  <LovButton
                    displayValue=""
                    placeholder="Search and select an officer…"
                    modalTitle="Select Officer to Assign"
                    columns={OFFICER_LOV_COLUMNS}
                    data={addAvailable}
                    rowKey="id"
                    onSelect={handleSelect}
                  />
                </td>
                <td className="labor-table__td labor-table__td--actions">
                  <Button size="sm" variant="secondary" onClick={() => setIsAdding(false)}>
                    Cancel
                  </Button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {!isAdding && addAvailable.length > 0 && (
        <div className="labor-items__toolbar">
          <Button type="button" variant="secondary" size="sm" onClick={() => setIsAdding(true)}>
            <PlusIcon width={13} height={13} /> Assign Officer
          </Button>
        </div>
      )}
    </div>
  )
}
