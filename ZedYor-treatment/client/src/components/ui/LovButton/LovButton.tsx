import { ListBulletIcon, MagnifyingGlassIcon } from '@radix-ui/react-icons'
import { useState } from 'react'
import Button from '../Button/Button'
import Input from '../Form/Input'
import Modal from '../Modal/Modal'
import './LovButton.css'

export interface LovColumn<T extends object> {
  key: keyof T & string
  label: string
  width?: string
  render?: (value: unknown, row: T) => React.ReactNode
}

interface Props<T extends object> {
  displayValue: string
  placeholder?: string
  modalTitle: string
  columns: LovColumn<T>[]
  data: T[]
  rowKey: keyof T & string
  onSelect: (row: T) => void
  disabled?: boolean
}

export default function LovButton<T extends object>({
  displayValue,
  placeholder = 'Select…',
  modalTitle,
  columns,
  data,
  rowKey,
  onSelect,
  disabled,
}: Props<T>) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')

  const q = search.trim().toLowerCase()
  const filtered = q
    ? data.filter((row) =>
        Object.values(row as Record<string, unknown>).some((v) =>
          String(v ?? '')
            .toLowerCase()
            .includes(q)
        )
      )
    : data

  const handleSelect = (row: T) => {
    onSelect(row)
    setOpen(false)
    setSearch('')
  }

  const close = () => {
    setOpen(false)
    setSearch('')
  }

  return (
    <>
      <div className="lov-field">
        <div className="lov-field__display">
          {displayValue ? (
            <span className="lov-field__value">{displayValue}</span>
          ) : (
            <span className="lov-field__placeholder">{placeholder}</span>
          )}
        </div>
        <button
          type="button"
          className="lov-field__trigger"
          onClick={() => setOpen(true)}
          disabled={disabled}
        >
          <ListBulletIcon width={14} height={14} />
          LOV
        </button>
      </div>

      <Modal isOpen={open} onClose={close} title={modalTitle} size="lg">
        {/* Search bar */}
        <div className="lov-search">
          <MagnifyingGlassIcon width={15} height={15} className="lov-search__icon" />
          <Input
            className="lov-search__input"
            placeholder="Search…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
          />
        </div>

        {/* Table */}
        <div className="lov-table-wrap">
          <table className="lov-table">
            <thead>
              <tr>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className="lov-table__th"
                    style={col.width ? { width: col.width } : undefined}
                  >
                    {col.label}
                  </th>
                ))}
                <th className="lov-table__th lov-table__th--action" />
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + 1} className="lov-table__empty">
                    No results found.
                  </td>
                </tr>
              ) : (
                filtered.map((row) => (
                  <tr key={String(row[rowKey])} className="lov-table__row">
                    {columns.map((col) => (
                      <td key={col.key} className="lov-table__td">
                        {col.render
                          ? col.render(row[col.key as keyof T], row)
                          : String(row[col.key as keyof T] ?? '—')}
                      </td>
                    ))}
                    <td className="lov-table__td lov-table__td--action">
                      <Button size="sm" onClick={() => handleSelect(row)}>
                        Select
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Modal>
    </>
  )
}
