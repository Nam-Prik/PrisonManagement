import { Cross2Icon, Pencil1Icon, PlusIcon, TrashIcon } from '@radix-ui/react-icons'
import { useState } from 'react'
import type { LovColumn } from '../../components/ui'
import { Button, Input, LovButton } from '../../components/ui'
import type { Medicine } from '../../types/dto/medicine.dto'
import type { PrescriptionDraft } from '../../types/dto/treatment.dto'

export type { PrescriptionDraft }

const EMPTY: PrescriptionDraft = {
  medicineId: 0,
  medicineName: '',
  medicineCode: 0,
  dosage: 0,
  frequency: 0,
  duration: 0,
}

const MEDICINE_LOV_COLUMNS: LovColumn<Medicine>[] = [
  { key: 'code', label: 'Code', width: '72px' },
  { key: 'name', label: 'Name' },
  { key: 'genericName', label: 'Generic Name' },
]

interface Props {
  items: PrescriptionDraft[]
  allMedicines: Medicine[]
  onAdd: (item: PrescriptionDraft) => void
  onUpdate: (index: number, item: PrescriptionDraft) => void
  onRemove: (index: number) => void
}

export default function LineItems({ items, allMedicines, onAdd, onUpdate, onRemove }: Props) {
  const [editingIdx, setEditingIdx] = useState<number | null>(null)
  const [editDraft, setEditDraft] = useState<PrescriptionDraft>(EMPTY)
  const [isAdding, setIsAdding] = useState(false)
  const [addDraft, setAddDraft] = useState<PrescriptionDraft>(EMPTY)

  const busy = editingIdx !== null || isAdding

  const usedIds = new Set(items.map((p) => p.medicineId))
  const addAvailable = allMedicines.filter((m) => !usedIds.has(m.id))
  const editAvailable =
    editingIdx !== null
      ? allMedicines.filter((m) => {
          const othersUsed = new Set(
            items.filter((_, i) => i !== editingIdx).map((p) => p.medicineId)
          )
          return !othersUsed.has(m.id)
        })
      : []

  const withMedicine = (draft: PrescriptionDraft, med: Medicine): PrescriptionDraft => ({
    ...draft,
    medicineId: med.id,
    medicineName: med.name,
    medicineCode: med.code,
  })

  const startEdit = (idx: number) => {
    setEditingIdx(idx)
    setEditDraft({ ...items[idx] })
  }

  const saveEdit = () => {
    if (
      editingIdx === null ||
      !editDraft.medicineId ||
      !editDraft.dosage ||
      !editDraft.frequency ||
      !editDraft.duration
    )
      return
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
    if (!addDraft.medicineId || !addDraft.dosage || !addDraft.frequency || !addDraft.duration)
      return
    onAdd(addDraft)
    setAddDraft(EMPTY)
    setIsAdding(false)
  }

  const cancelAdd = () => {
    setAddDraft(EMPTY)
    setIsAdding(false)
  }

  const numInput = (value: number, onChange: (v: number) => void, placeholder: string) => (
    <Input
      type="number"
      min="1"
      placeholder={placeholder}
      value={value || ''}
      onChange={(e) => onChange(Math.max(0, parseInt(e.target.value, 10) || 0))}
      style={{ width: '80px' }}
    />
  )

  const hasRows = items.length > 0 || isAdding

  return (
    <div className="labor-items">
      <div className="labor-items__wrap">
        <table className="labor-table">
          <thead>
            <tr>
              <th className="labor-table__th labor-table__th--idx">#</th>
              <th className="labor-table__th">Medicine</th>
              <th className="labor-table__th">Code</th>
              <th className="labor-table__th">Dosage (mg)</th>
              <th className="labor-table__th">Frequency (×/day)</th>
              <th className="labor-table__th">Duration (days)</th>
              <th className="labor-table__th labor-table__th--actions" />
            </tr>
          </thead>

          <tbody>
            {!hasRows && (
              <tr>
                <td colSpan={7} className="labor-table__empty">
                  No prescriptions added. Use "+ Add Item" below.
                </td>
              </tr>
            )}

            {items.map((item, idx) =>
              editingIdx === idx ? (
                <tr
                  key={`edit-${item.medicineId}`}
                  className="labor-table__row labor-table__row--editing"
                >
                  <td className="labor-table__td labor-table__td--idx">{idx + 1}</td>

                  <td className="labor-table__td">
                    <LovButton<Medicine>
                      displayValue={editDraft.medicineName}
                      placeholder="Pick medicine…"
                      modalTitle="Select Medicine"
                      columns={MEDICINE_LOV_COLUMNS}
                      data={editAvailable}
                      rowKey="id"
                      onSelect={(med) => setEditDraft(withMedicine(editDraft, med))}
                    />
                  </td>

                  <td className="labor-table__td labor-table__td--muted">
                    {editDraft.medicineCode || '—'}
                  </td>

                  <td className="labor-table__td">
                    {numInput(
                      editDraft.dosage,
                      (v) => setEditDraft((d) => ({ ...d, dosage: v })),
                      'mg'
                    )}
                  </td>

                  <td className="labor-table__td">
                    {numInput(
                      editDraft.frequency,
                      (v) => setEditDraft((d) => ({ ...d, frequency: v })),
                      '×/day'
                    )}
                  </td>

                  <td className="labor-table__td">
                    {numInput(
                      editDraft.duration,
                      (v) => setEditDraft((d) => ({ ...d, duration: v })),
                      'days'
                    )}
                  </td>

                  <td className="labor-table__td labor-table__td--actions">
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={saveEdit}
                      disabled={
                        !editDraft.medicineId ||
                        !editDraft.dosage ||
                        !editDraft.frequency ||
                        !editDraft.duration
                      }
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
                <tr key={item.medicineId} className="labor-table__row">
                  <td className="labor-table__td labor-table__td--idx">{idx + 1}</td>
                  <td className="labor-table__td labor-table__td--name">{item.medicineName}</td>
                  <td className="labor-table__td labor-table__td--muted">{item.medicineCode}</td>
                  <td className="labor-table__td">{item.dosage} mg</td>
                  <td className="labor-table__td">{item.frequency}×/day</td>
                  <td className="labor-table__td">{item.duration} days</td>
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

                <td className="labor-table__td">
                  <LovButton<Medicine>
                    displayValue={addDraft.medicineName}
                    placeholder="Pick medicine…"
                    modalTitle="Select Medicine"
                    columns={MEDICINE_LOV_COLUMNS}
                    data={addAvailable}
                    rowKey="id"
                    onSelect={(med) => setAddDraft(withMedicine(addDraft, med))}
                  />
                </td>

                <td className="labor-table__td labor-table__td--muted">
                  {addDraft.medicineCode || '—'}
                </td>

                <td className="labor-table__td">
                  {numInput(
                    addDraft.dosage,
                    (v) => setAddDraft((d) => ({ ...d, dosage: v })),
                    'mg'
                  )}
                </td>

                <td className="labor-table__td">
                  {numInput(
                    addDraft.frequency,
                    (v) => setAddDraft((d) => ({ ...d, frequency: v })),
                    '×/day'
                  )}
                </td>

                <td className="labor-table__td">
                  {numInput(
                    addDraft.duration,
                    (v) => setAddDraft((d) => ({ ...d, duration: v })),
                    'days'
                  )}
                </td>

                <td className="labor-table__td labor-table__td--actions">
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={confirmAdd}
                    disabled={
                      !addDraft.medicineId ||
                      !addDraft.dosage ||
                      !addDraft.frequency ||
                      !addDraft.duration
                    }
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
            <PlusIcon width={13} height={13} /> Add Item
          </Button>
        </div>
      )}
    </div>
  )
}
