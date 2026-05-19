import { Cross2Icon, Pencil1Icon, PlusIcon, TrashIcon } from '@radix-ui/react-icons'
import { forwardRef, useImperativeHandle, useState } from 'react'
import type { PersonOption, VisitmentVisitor } from '../../api/visitment.api'
import type { LovColumn } from '../../components/ui'
import { Button, LovButton, Select } from '../../components/ui'

export interface VisitorDraft extends VisitmentVisitor {
  firstName?: string
  lastName?: string
  gender?: string
  identificationNo?: string
}

const EMPTY: VisitorDraft = {
  personId: 0,
  relation: 'Other',
  firstName: '',
  lastName: '',
  gender: '',
  identificationNo: '',
}

const PERSON_LOV_COLUMNS: LovColumn<PersonOption>[] = [
  { key: 'identificationNo', label: 'ID Number', width: '140px' },
  { key: 'firstName', label: 'First Name' },
  { key: 'lastName', label: 'Last Name' },
  { key: 'gender', label: 'Gender', width: '80px' },
]

const RELATIONS = [
  'Father',
  'Mother',
  'Brother',
  'Sister',
  'Spouse',
  'Child',
  'Relative',
  'Friend',
  'Legal Counsel',
  'Official',
  'Other',
]

interface Props {
  items: VisitorDraft[]
  allPersons: PersonOption[]
  onAdd: (item: VisitorDraft) => void
  onUpdate: (index: number, item: VisitorDraft) => void
  onRemove: (index: number) => void
}

export interface LineItemsHandle {
  startAdd: () => void
  isAdding: boolean
}

const LineItems = forwardRef<LineItemsHandle, Props>((props, ref) => {
  const { items, allPersons, onAdd, onUpdate, onRemove } = props
  const [editingIdx, setEditingIdx] = useState<number | null>(null)
  const [editDraft, setEditDraft] = useState<VisitorDraft>(EMPTY)
  const [isAdding, setIsAdding] = useState(false)
  const [addDraft, setAddDraft] = useState<VisitorDraft>(EMPTY)

  const busy = editingIdx !== null || isAdding

  const usedIds = new Set(items.map((v) => v.personId))
  const addAvailable = allPersons.filter((p) => !usedIds.has(p.id))

  const editAvailable =
    editingIdx !== null
      ? allPersons.filter((p) => {
          const othersUsed = new Set(
            items.filter((_, i) => i !== editingIdx).map((v) => v.personId)
          )
          return !othersUsed.has(p.id)
        })
      : []

  const withPerson = (draft: VisitorDraft, person: PersonOption): VisitorDraft => ({
    ...draft,
    personId: person.id,
    firstName: person.firstName,
    lastName: person.lastName,
    gender: person.gender,
    identificationNo: person.identificationNo,
  })

  const startEdit = (idx: number) => {
    setEditingIdx(idx)
    setEditDraft({ ...items[idx] })
  }

  const saveEdit = () => {
    if (editingIdx === null || !editDraft.personId) return
    onUpdate(editingIdx, editDraft)
    setEditingIdx(null)
    setEditDraft(EMPTY)
  }

  const startAdd = () => {
    setAddDraft(EMPTY)
    setIsAdding(true)
  }

  const confirmAdd = () => {
    if (!addDraft.personId) return
    onAdd(addDraft)
    setAddDraft(EMPTY)
    setIsAdding(false)
  }

  const hasRows = items.length > 0 || isAdding

  useImperativeHandle(ref, () => ({
    startAdd,
    isAdding,
  }))

  return (
    <div className="labor-items">
      <div className="labor-items__wrap">
        <table className="labor-table">
          <thead>
            <tr>
              <th className="labor-table__th labor-table__th--idx">#</th>
              <th className="labor-table__th" style={{ width: '200px' }}>
                Person ID
              </th>
              <th className="labor-table__th" style={{ width: '180px' }}>
                First Name
              </th>
              <th className="labor-table__th" style={{ width: '180px' }}>
                Last Name
              </th>
              <th className="labor-table__th" style={{ width: '100px' }}>
                Gender
              </th>
              <th className="labor-table__th">Relation</th>
              <th className="labor-table__th labor-table__th--actions" />
            </tr>
          </thead>
          <tbody>
            {!hasRows && (
              <tr>
                <td colSpan={7} className="labor-table__empty">
                  No visitors assigned. Use "+ Add Visitor" below.
                </td>
              </tr>
            )}

            {items.map((item, idx) =>
              editingIdx === idx ? (
                <tr
                  key={`edit-${item.personId}`}
                  className="labor-table__row labor-table__row--editing"
                >
                  <td className="labor-table__td labor-table__td--idx">{idx + 1}</td>
                  <td className="labor-table__td">
                    <LovButton<PersonOption>
                      displayValue={editDraft.identificationNo || ''}
                      placeholder="Pick ID..."
                      modalTitle="Select Visitor"
                      columns={PERSON_LOV_COLUMNS}
                      data={editAvailable}
                      rowKey="id"
                      onSelect={(person) => setEditDraft(withPerson(editDraft, person))}
                    />
                  </td>
                  <td className="labor-table__td labor-table__td--name">
                    {editDraft.firstName || '—'}
                  </td>
                  <td className="labor-table__td labor-table__td--name">
                    {editDraft.lastName || '—'}
                  </td>
                  <td className="labor-table__td labor-table__td--muted">
                    {editDraft.gender || '—'}
                  </td>
                  <td className="labor-table__td">
                    <Select
                      value={editDraft.relation}
                      onChange={(e) => setEditDraft((d) => ({ ...d, relation: e.target.value }))}
                      options={RELATIONS.map((r) => ({ value: r, label: r }))}
                    />
                  </td>
                  <td className="labor-table__td labor-table__td--actions">
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={saveEdit}
                      disabled={!editDraft.personId}
                    >
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      iconOnly
                      onClick={() => setEditingIdx(null)}
                    >
                      <Cross2Icon width={13} height={13} />
                    </Button>
                  </td>
                </tr>
              ) : (
                <tr key={item.personId} className="labor-table__row">
                  <td className="labor-table__td labor-table__td--idx">{idx + 1}</td>
                  <td className="labor-table__td labor-table__td--muted">
                    {item.identificationNo}
                  </td>
                  <td className="labor-table__td">{item.firstName}</td>
                  <td className="labor-table__td">{item.lastName}</td>
                  <td className="labor-table__td">{item.gender}</td>
                  <td className="labor-table__td">{item.relation}</td>
                  <td className="labor-table__td labor-table__td--actions">
                    <Button
                      variant="ghost"
                      size="sm"
                      iconOnly
                      disabled={busy}
                      onClick={() => startEdit(idx)}
                    >
                      <Pencil1Icon width={14} height={14} />
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      iconOnly
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
                  <LovButton<PersonOption>
                    displayValue={addDraft.identificationNo || ''}
                    placeholder="Pick ID..."
                    modalTitle="Select Visitor"
                    columns={PERSON_LOV_COLUMNS}
                    data={addAvailable}
                    rowKey="id"
                    onSelect={(person) => setAddDraft(withPerson(addDraft, person))}
                  />
                </td>
                <td className="labor-table__td labor-table__td--name">
                  {addDraft.firstName || '—'}
                </td>
                <td className="labor-table__td labor-table__td--name">
                  {addDraft.lastName || '—'}
                </td>
                <td className="labor-table__td labor-table__td--muted">{addDraft.gender || '—'}</td>
                <td className="labor-table__td">
                  <Select
                    value={addDraft.relation}
                    onChange={(e) => setAddDraft((d) => ({ ...d, relation: e.target.value }))}
                    options={RELATIONS.map((r) => ({ value: r, label: r }))}
                  />
                </td>
                <td className="labor-table__td labor-table__td--actions">
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={confirmAdd}
                    disabled={!addDraft.personId}
                  >
                    Add
                  </Button>
                  <Button size="sm" variant="secondary" iconOnly onClick={() => setIsAdding(false)}>
                    <Cross2Icon width={13} height={13} />
                  </Button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
})

export default LineItems
