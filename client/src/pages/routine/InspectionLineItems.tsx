import { Cross2Icon, Pencil1Icon, PlusIcon, TrashIcon } from '@radix-ui/react-icons'
import { useState } from 'react'
import type { LovColumn } from '../../components/ui'
import { Button, Input, LovButton } from '../../components/ui'
import type { Irregularity } from '../../types/dto/irregularity.dto'

export interface InspectionLineItemDraft {
  foundIrregularityId: number
  irregularityType: string
  severity: string
  irregularityDescription: string
  resultDescription: string
}

const EMPTY: InspectionLineItemDraft = {
  foundIrregularityId: 0,
  irregularityType: '',
  severity: '',
  irregularityDescription: '',
  resultDescription: '',
}

const IRREGULARITY_LOV_COLUMNS: LovColumn<Irregularity>[] = [
  { key: 'id', label: 'ID', width: '56px' },
  { key: 'type', label: 'Type' },
  { key: 'severity', label: 'Severity' },
  { key: 'description', label: 'Description' },
]

interface Props {
  items: InspectionLineItemDraft[]
  allIrregularities: Irregularity[]
  onAdd: (item: InspectionLineItemDraft) => void
  onUpdate: (index: number, item: InspectionLineItemDraft) => void
  onRemove: (index: number) => void
}

export default function InspectionLineItems({
  items,
  allIrregularities,
  onAdd,
  onUpdate,
  onRemove,
}: Props) {
  const [editingIdx, setEditingIdx] = useState<number | null>(null)
  const [editDraft, setEditDraft] = useState<InspectionLineItemDraft>(EMPTY)
  const [isAdding, setIsAdding] = useState(false)
  const [addDraft, setAddDraft] = useState<InspectionLineItemDraft>(EMPTY)

  const busy = editingIdx !== null || isAdding

  const usedIds = new Set(items.map((li) => li.foundIrregularityId))
  const addAvailable = allIrregularities.filter((irr) => !usedIds.has(irr.id))

  const editAvailable =
    editingIdx !== null
      ? allIrregularities.filter((irr) => {
          const othersUsed = new Set(
            items.filter((_, i) => i !== editingIdx).map((li) => li.foundIrregularityId)
          )
          return !othersUsed.has(irr.id)
        })
      : []

  const withIrregularity = (
    draft: InspectionLineItemDraft,
    irr: Irregularity
  ): InspectionLineItemDraft => ({
    ...draft,
    foundIrregularityId: irr.id,
    irregularityType: irr.type,
    severity: irr.severity,
    irregularityDescription: irr.description || '',
  })

  const irregularityLabel = (draft: InspectionLineItemDraft) =>
    draft.foundIrregularityId ? `[${draft.irregularityType}] ${draft.irregularityDescription}` : ''

  const startEdit = (idx: number) => {
    setEditingIdx(idx)
    setEditDraft({ ...items[idx] })
  }

  const saveEdit = () => {
    if (editingIdx === null || !editDraft.foundIrregularityId) return
    onUpdate(editingIdx, editDraft)
    setEditingIdx(null)
    setEditDraft(EMPTY)
  }

  const cancelEdit = () => {
    setEditingIdx(null)
    setEditDraft(EMPTY)
  }

  const startAdd = () => {
    setAddDraft(EMPTY)
    setIsAdding(true)
  }

  const confirmAdd = () => {
    if (!addDraft.foundIrregularityId) return
    onAdd(addDraft)
    setAddDraft(EMPTY)
    setIsAdding(false)
  }

  const cancelAdd = () => {
    setAddDraft(EMPTY)
    setIsAdding(false)
  }

  const hasRows = items.length > 0 || isAdding

  return (
    <div className="labor-items">
      <div className="labor-items__wrap">
        <table className="labor-table">
          <thead>
            <tr>
              <th className="labor-table__th labor-table__th--idx">#</th>
              <th className="labor-table__th">Irregularity Type</th>
              <th className="labor-table__th">Severity</th>
              <th className="labor-table__th">Base Description</th>
              <th className="labor-table__th">Specific Result Findings</th>
              <th className="labor-table__th labor-table__th--actions" />
            </tr>
          </thead>

          <tbody>
            {!hasRows && (
              <tr>
                <td colSpan={6} className="labor-table__empty">
                  No findings recorded. Use "+ Add Finding" below.
                </td>
              </tr>
            )}

            {items.map((item, idx) =>
              editingIdx === idx ? (
                <tr
                  key={`edit-${item.foundIrregularityId}`}
                  className="labor-table__row labor-table__row--editing"
                >
                  <td className="labor-table__td labor-table__td--idx">{idx + 1}</td>

                  <td className="labor-table__td" colSpan={3}>
                    <LovButton<Irregularity>
                      displayValue={irregularityLabel(editDraft)}
                      placeholder="Select Irregularity…"
                      modalTitle="Select Irregularity Profile"
                      columns={IRREGULARITY_LOV_COLUMNS}
                      data={editAvailable}
                      rowKey="id"
                      onSelect={(irr) => setEditDraft(withIrregularity(editDraft, irr))}
                    />
                  </td>

                  <td className="labor-table__td">
                    <Input
                      placeholder="Detail the specific findings..."
                      value={editDraft.resultDescription}
                      onChange={(e) =>
                        setEditDraft((d) => ({ ...d, resultDescription: e.target.value }))
                      }
                    />
                  </td>

                  <td className="labor-table__td labor-table__td--actions">
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={saveEdit}
                      disabled={!editDraft.foundIrregularityId || !editDraft.resultDescription}
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
                <tr key={item.foundIrregularityId} className="labor-table__row">
                  <td className="labor-table__td labor-table__td--idx">{idx + 1}</td>
                  <td className="labor-table__td labor-table__td--name">{item.irregularityType}</td>
                  <td className="labor-table__td">{item.severity}</td>
                  <td className="labor-table__td labor-table__td--muted">
                    {item.irregularityDescription || '—'}
                  </td>
                  <td className="labor-table__td">{item.resultDescription || <em>—</em>}</td>
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
                      variant="danger"
                      size="sm"
                      iconOnly
                      title="Remove"
                      disabled={busy}
                      onClick={() => onRemove(idx)}
                    >
                      <TrashIcon width={14} height={14} />
                    </Button>
                  </td>
                </tr>
              )
            )}

            {isAdding && (
              <tr className="labor-table__row labor-table__row--adding">
                <td className="labor-table__td labor-table__td--idx">
                  <PlusIcon width={13} height={13} style={{ color: 'var(--color-text-muted)' }} />
                </td>

                <td className="labor-table__td" colSpan={3}>
                  <LovButton<Irregularity>
                    displayValue={irregularityLabel(addDraft)}
                    placeholder="Select Irregularity…"
                    modalTitle="Select Irregularity Profile"
                    columns={IRREGULARITY_LOV_COLUMNS}
                    data={addAvailable}
                    rowKey="id"
                    onSelect={(irr) => setAddDraft(withIrregularity(addDraft, irr))}
                  />
                </td>

                <td className="labor-table__td">
                  <Input
                    placeholder="Detail the specific findings..."
                    value={addDraft.resultDescription}
                    onChange={(e) =>
                      setAddDraft((d) => ({ ...d, resultDescription: e.target.value }))
                    }
                  />
                </td>

                <td className="labor-table__td labor-table__td--actions">
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={confirmAdd}
                    disabled={!addDraft.foundIrregularityId || !addDraft.resultDescription}
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

      {!isAdding && addAvailable.length > 0 && (
        <div className="labor-items__toolbar">
          <Button type="button" variant="secondary" size="sm" onClick={startAdd} disabled={busy}>
            <PlusIcon width={13} height={13} /> Add Finding
          </Button>
        </div>
      )}
    </div>
  )
}
