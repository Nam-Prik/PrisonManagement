import { Cross2Icon, Pencil1Icon, PlusIcon, TrashIcon } from '@radix-ui/react-icons'
import { useState } from 'react'
import type { LovColumn } from '../../components/ui'
import { Button, Input, LovButton } from '../../components/ui'
import type { MaintainerOption } from '../../types/dto/maintainer.dto'

/* ── Types ────────────────────────────────────────────────────── */

export interface LaborItemDraft {
  maintainerId: number
  laborTask: string
  maintainerFirstName: string
  maintainerLastName: string
  maintenanceSkill: string
  skillDescription: string | null
  companyName: string
  specialization: string
}

const EMPTY: LaborItemDraft = {
  maintainerId: 0,
  laborTask: '',
  maintainerFirstName: '',
  maintainerLastName: '',
  maintenanceSkill: '',
  skillDescription: null,
  companyName: '',
  specialization: '',
}

/* ── LOV column config for the maintainer picker ─────────────── */

const MAINTAINER_LOV_COLUMNS: LovColumn<MaintainerOption>[] = [
  { key: 'id', label: 'ID', width: '56px' },
  { key: 'firstName', label: 'First Name' },
  { key: 'lastName', label: 'Last Name' },
  { key: 'maintenanceSkill', label: 'Skill' },
]

/* ── Props ────────────────────────────────────────────────────── */

interface Props {
  items: LaborItemDraft[]
  allMaintainers: MaintainerOption[]
  onAdd: (item: LaborItemDraft) => void
  onUpdate: (index: number, item: LaborItemDraft) => void
  onRemove: (index: number) => void
}

/* ── Component ────────────────────────────────────────────────── */

export default function LineItems({ items, allMaintainers, onAdd, onUpdate, onRemove }: Props) {
  const [editingIdx, setEditingIdx] = useState<number | null>(null)
  const [editDraft, setEditDraft] = useState<LaborItemDraft>(EMPTY)
  const [isAdding, setIsAdding] = useState(false)
  const [addDraft, setAddDraft] = useState<LaborItemDraft>(EMPTY)

  const busy = editingIdx !== null || isAdding

  // Maintainers available for the add-row LOV (exclude all currently assigned)
  const usedIds = new Set(items.map((li) => li.maintainerId))
  const addAvailable = allMaintainers.filter((m) => !usedIds.has(m.id))

  // Maintainers available for the edit-row LOV (exclude OTHER rows, keep current row's)
  const editAvailable =
    editingIdx !== null
      ? allMaintainers.filter((m) => {
          const othersUsed = new Set(
            items.filter((_, i) => i !== editingIdx).map((li) => li.maintainerId)
          )
          return !othersUsed.has(m.id)
        })
      : []

  /* ── Helpers ── */

  const applyMaintainer = (
    m: MaintainerOption,
    setter: React.Dispatch<React.SetStateAction<LaborItemDraft>>
  ) => {
    setter((d) => ({
      ...d,
      maintainerId: m.id,
      maintainerFirstName: m.firstName,
      maintainerLastName: m.lastName,
      maintenanceSkill: m.maintenanceSkill,
      skillDescription: m.skillDescription,
      companyName: m.companyName,
      specialization: m.specialization,
    }))
  }

  const maintainerLabel = (draft: LaborItemDraft) =>
    draft.maintainerId ? `${draft.maintainerFirstName} ${draft.maintainerLastName}` : ''

  /* ── Edit flow ── */

  const startEdit = (idx: number) => {
    setEditingIdx(idx)
    setEditDraft({ ...items[idx] })
  }

  const saveEdit = () => {
    if (editingIdx === null || !editDraft.maintainerId) return
    onUpdate(editingIdx, editDraft)
    setEditingIdx(null)
    setEditDraft(EMPTY)
  }

  const cancelEdit = () => {
    setEditingIdx(null)
    setEditDraft(EMPTY)
  }

  /* ── Add flow ── */

  const startAdd = () => {
    setAddDraft(EMPTY)
    setIsAdding(true)
  }

  const confirmAdd = () => {
    if (!addDraft.maintainerId) return
    onAdd(addDraft)
    setAddDraft(EMPTY)
    setIsAdding(false)
  }

  const cancelAdd = () => {
    setAddDraft(EMPTY)
    setIsAdding(false)
  }

  /* ── Render ── */

  const hasRows = items.length > 0 || isAdding

  return (
    <div className="labor-items">
      <div className="labor-items__wrap">
        <table className="labor-table">
          <thead>
            <tr>
              <th className="labor-table__th labor-table__th--idx">#</th>
              <th className="labor-table__th">Name</th>
              <th className="labor-table__th">Skill</th>
              <th className="labor-table__th">Skill Description</th>
              <th className="labor-table__th">Company</th>
              <th className="labor-table__th">Specialization</th>
              <th className="labor-table__th">Task</th>
              <th className="labor-table__th labor-table__th--actions" />
            </tr>
          </thead>

          <tbody>
            {!hasRows && (
              <tr>
                <td colSpan={8} className="labor-table__empty">
                  No workers assigned. Use "+ Add Item" below.
                </td>
              </tr>
            )}

            {items.map((item, idx) =>
              editingIdx === idx ? (
                /* ── Editing row ── */
                <tr
                  key={`edit-${item.maintainerId}`}
                  className="labor-table__row labor-table__row--editing"
                >
                  <td className="labor-table__td labor-table__td--idx">{idx + 1}</td>

                  <td className="labor-table__td">
                    <LovButton<MaintainerOption>
                      displayValue={maintainerLabel(editDraft)}
                      placeholder="Pick maintainer…"
                      modalTitle="Select Maintainer"
                      columns={MAINTAINER_LOV_COLUMNS}
                      data={editAvailable}
                      rowKey="id"
                      onSelect={(m) => applyMaintainer(m, setEditDraft)}
                    />
                  </td>

                  {/* Maintainer fields auto-populate from LOV selection */}
                  <td className="labor-table__td labor-table__td--muted">
                    {editDraft.maintenanceSkill || '—'}
                  </td>
                  <td className="labor-table__td labor-table__td--muted">
                    {editDraft.skillDescription || '—'}
                  </td>
                  <td className="labor-table__td labor-table__td--muted">
                    {editDraft.companyName || '—'}
                  </td>
                  <td className="labor-table__td labor-table__td--muted">
                    {editDraft.specialization || '—'}
                  </td>

                  <td className="labor-table__td">
                    <Input
                      placeholder="Describe task…"
                      value={editDraft.laborTask}
                      onChange={(e) => setEditDraft((d) => ({ ...d, laborTask: e.target.value }))}
                    />
                  </td>

                  <td className="labor-table__td labor-table__td--actions">
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={saveEdit}
                      disabled={!editDraft.maintainerId}
                    >
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      iconOnly
                      onClick={cancelEdit}
                      title="Cancel"
                    >
                      <Cross2Icon width={13} height={13} />
                    </Button>
                  </td>
                </tr>
              ) : (
                /* ── View row ── */
                <tr key={item.maintainerId} className="labor-table__row">
                  <td className="labor-table__td labor-table__td--idx">{idx + 1}</td>
                  <td className="labor-table__td labor-table__td--name">
                    {item.maintainerFirstName} {item.maintainerLastName}
                  </td>
                  <td className="labor-table__td">{item.maintenanceSkill}</td>
                  <td className="labor-table__td labor-table__td--muted">
                    {item.skillDescription || '—'}
                  </td>
                  <td className="labor-table__td">{item.companyName}</td>
                  <td className="labor-table__td">{item.specialization}</td>
                  <td className="labor-table__td labor-table__td--muted">
                    {item.laborTask || <em>—</em>}
                  </td>
                  <td className="labor-table__td labor-table__td--actions">
                    <Button
                      variant="ghost"
                      size="sm"
                      iconOnly
                      title="Edit"
                      disabled={busy}
                      onClick={() => startEdit(idx)}
                    >
                      <Pencil1Icon width={14} height={14} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      iconOnly
                      title="Remove"
                      disabled={busy}
                      onClick={() => onRemove(idx)}
                      style={{ color: 'var(--color-danger)' } as React.CSSProperties}
                    >
                      <TrashIcon width={14} height={14} />
                    </Button>
                  </td>
                </tr>
              )
            )}

            {/* ── Add row ── */}
            {isAdding && (
              <tr className="labor-table__row labor-table__row--adding">
                <td className="labor-table__td labor-table__td--idx">
                  <PlusIcon width={13} height={13} style={{ color: 'var(--color-text-muted)' }} />
                </td>

                <td className="labor-table__td">
                  <LovButton<MaintainerOption>
                    displayValue={maintainerLabel(addDraft)}
                    placeholder="Pick maintainer…"
                    modalTitle="Select Maintainer"
                    columns={MAINTAINER_LOV_COLUMNS}
                    data={addAvailable}
                    rowKey="id"
                    onSelect={(m) => applyMaintainer(m, setAddDraft)}
                  />
                </td>

                <td className="labor-table__td labor-table__td--muted">
                  {addDraft.maintenanceSkill || '—'}
                </td>
                <td className="labor-table__td labor-table__td--muted">
                  {addDraft.skillDescription || '—'}
                </td>
                <td className="labor-table__td labor-table__td--muted">
                  {addDraft.companyName || '—'}
                </td>
                <td className="labor-table__td labor-table__td--muted">
                  {addDraft.specialization || '—'}
                </td>

                <td className="labor-table__td">
                  <Input
                    placeholder="Describe task…"
                    value={addDraft.laborTask}
                    onChange={(e) => setAddDraft((d) => ({ ...d, laborTask: e.target.value }))}
                  />
                </td>

                <td className="labor-table__td labor-table__td--actions">
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={confirmAdd}
                    disabled={!addDraft.maintainerId}
                  >
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

      {/* Add item trigger */}
      {!isAdding && addAvailable.length > 0 && (
        <div className="labor-items__toolbar">
          <Button type="button" variant="secondary" size="sm" onClick={startAdd} disabled={busy}>
            <PlusIcon width={13} height={13} /> Add Item
          </Button>
        </div>
      )}
    </div>
  )
}
