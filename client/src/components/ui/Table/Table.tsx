import './Table.css'

export type SortDirection = 'asc' | 'desc' | null

export interface Column<T> {
  key: string
  label: string
  sortable?: boolean
  width?: string
  render?: (value: unknown, row: T, index: number) => React.ReactNode
  className?: string
}

interface TableProps<T extends object> {
  columns: Column<T>[]
  data: T[]
  rowKey: keyof T
  loading?: boolean
  emptyMessage?: string
  sortKey?: string
  sortDirection?: SortDirection
  onSort?: (key: string) => void
  className?: string
}

function SortIcon() {
  return (
    <span className="table__sort-icon" aria-hidden="true">
      <span className="asc" />
      <span className="desc" />
    </span>
  )
}

export default function Table<T extends object>({
  columns,
  data,
  rowKey,
  loading = false,
  emptyMessage = 'No data available',
  sortKey,
  sortDirection,
  onSort,
  className = '',
}: TableProps<T>) {
  const containerClasses = ['table-container', className].filter(Boolean).join(' ')

  return (
    <div className={containerClasses}>
      <table className="table">
        <thead className="table__head">
          <tr className="table__tr">
            {columns.map((col) => {
              const isSorted = sortKey === col.key
              const thClasses = [
                'table__th',
                col.sortable ? 'table__th--sortable' : '',
                isSorted && sortDirection === 'asc' ? 'table__th--asc' : '',
                isSorted && sortDirection === 'desc' ? 'table__th--desc' : '',
                col.className ?? '',
              ]
                .filter(Boolean)
                .join(' ')

              return (
                <th
                  key={col.key}
                  className={thClasses}
                  style={col.width ? { width: col.width } : undefined}
                  onClick={col.sortable && onSort ? () => onSort(col.key) : undefined}
                  aria-sort={
                    isSorted ? (sortDirection === 'asc' ? 'ascending' : 'descending') : undefined
                  }
                >
                  <span className="table__th-inner">
                    {col.label}
                    {col.sortable && <SortIcon />}
                  </span>
                </th>
              )
            })}
          </tr>
        </thead>

        <tbody className="table__body">
          {loading ? (
            <tr>
              <td colSpan={columns.length} className="table__loading">
                <div className="table__spinner" role="status" aria-label="Loading" />
                Loading...
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="table__empty">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, index) => (
              <tr key={String((row as Record<keyof T, unknown>)[rowKey])} className="table__tr">
                {columns.map((col) => (
                  <td key={col.key} className={`table__td ${col.className ?? ''}`.trim()}>
                    {col.render
                      ? col.render((row as Record<string, unknown>)[col.key], row, index)
                      : ((row as Record<string, unknown>)[col.key] as React.ReactNode)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
