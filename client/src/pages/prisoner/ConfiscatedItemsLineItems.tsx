import { Cross2Icon, Pencil1Icon, PlusIcon, TrashIcon } from '@radix-ui/react-icons'
import { useState } from 'react'
import { Button, Input } from '../../components/ui'
import type { ConfiscatedItemInput } from '../../types/dto/prisonerintake.dto'

export type ConfiscatedItemDraft = ConfiscatedItemInput & { uid: string }

const emptyDraft = (): ConfiscatedItemDraft => ({
  itemName: '',
  quantity: 1,
  remarks: '',
  uid: crypto.randomUUID(),
})

interface Props {
  items: ConfiscatedItemDraft[]
  onAdd: (item: ConfiscatedItemDraft) => void
  onUpdate: (index: number, item: ConfiscatedItemDraft) => void
  onRemove: (index: number) => void
}

export default function ConfiscatedItemsLineItems({ items, onAdd, onUpdate, onRemove }: Props) {
  const [editingIdx, setEditingIdx] = useState<number | null>(null)
  const [editDraft, setEditDraft] = useState<ConfiscatedItemDraft>(emptyDraft())
  const [isAdding, setIsAdding] = useState(false)
  const [addDraft, setAddDraft] = useState<ConfiscatedItemDraft>(emptyDraft())

  const busy = editingIdx !== null || isAdding

  const startEdit = (idx: number) => {
    setEditingIdx(idx)
    setEditDraft({ ...items[idx] })
  }

  const saveEdit = () => {
    if (editingIdx === null || !editDraft.itemName.trim()) return
    onUpdate(editingIdx, editDraft)
    setEditingIdx(null)
  }

  const cancelEdit = () => setEditingIdx(null)

  const startAdd = () => {
    setAddDraft(emptyDraft())
    setIsAdding(true)
  }

  const confirmAdd = () => {
    if (!addDraft.itemName.trim()) return
    onAdd({ ...addDraft, quantity: Math.max(1, addDraft.quantity) })
    setAddDraft(emptyDraft())
    setIsAdding(false)
  }

  const cancelAdd = () => {
    setAddDraft(emptyDraft())
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
              <th className="labor-table__th">Item Name</th>
              <th className="labor-table__th">Quantity</th>
              <th className="labor-table__th">Remarks</th>
              <th className="labor-table__th labor-table__th--actions" />
            </tr>
          </thead>

          <tbody>
            {!hasRows && (
              <tr>
                <td colSpan={5} className="labor-table__empty">
                  No confiscated items recorded. Use "+ Add Item" below.
                </td>
              </tr>
            )}

            {items.map((item, idx) =>
              editingIdx === idx ? (
                <tr key={item.uid} className="labor-table__row labor-table__row--editing">
                  <td className="labor-table__td labor-table__td--idx">{idx + 1}</td>

                  <td className="labor-table__td">
                    <Input
                      placeholder="Item name"
                      value={editDraft.itemName}
                      onChange={(e) => setEditDraft((d) => ({ ...d, itemName: e.target.value }))}
                    />
                  </td>

                  <td className="labor-table__td">
                    <Input
                      type="number"
                      min="1"
                      value={editDraft.quantity}
                      onChange={(e) =>
                        setEditDraft((d) => ({
                          ...d,
                          quantity: Math.max(1, parseInt(e.target.value, 10) || 1),
                        }))
                      }
                      style={{ width: '80px' }}
                    />
                  </td>

                  <td className="labor-table__td">
                    <Input
                      placeholder="Optional remarks"
                      value={editDraft.remarks ?? ''}
                      onChange={(e) => setEditDraft((d) => ({ ...d, remarks: e.target.value }))}
                    />
                  </td>

                  <td className="labor-table__td labor-table__td--actions">
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={saveEdit}
                      disabled={!editDraft.itemName.trim()}
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
                <tr key={item.uid} className="labor-table__row">
                  <td className="labor-table__td labor-table__td--idx">{idx + 1}</td>
                  <td className="labor-table__td labor-table__td--name">{item.itemName}</td>
                  <td className="labor-table__td">{item.quantity}</td>
                  <td className="labor-table__td labor-table__td--muted">{item.remarks || '—'}</td>
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
                  <Input
                    placeholder="Item name"
                    value={addDraft.itemName}
                    onChange={(e) => setAddDraft((d) => ({ ...d, itemName: e.target.value }))}
                  />
                </td>

                <td className="labor-table__td">
                  <Input
                    type="number"
                    min="1"
                    value={addDraft.quantity}
                    onChange={(e) =>
                      setAddDraft((d) => ({
                        ...d,
                        quantity: Math.max(1, parseInt(e.target.value, 10) || 1),
                      }))
                    }
                    style={{ width: '80px' }}
                  />
                </td>

                <td className="labor-table__td">
                  <Input
                    placeholder="Optional remarks"
                    value={addDraft.remarks ?? ''}
                    onChange={(e) => setAddDraft((d) => ({ ...d, remarks: e.target.value }))}
                  />
                </td>

                <td className="labor-table__td labor-table__td--actions">
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={confirmAdd}
                    disabled={!addDraft.itemName.trim()}
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

      {!isAdding && (
        <div className="labor-items__toolbar">
          <Button type="button" variant="secondary" size="sm" onClick={startAdd} disabled={busy}>
            <PlusIcon width={13} height={13} /> Add Item
          </Button>
        </div>
      )}
    </div>
  )
}
