import { MagnifyingGlassIcon, Pencil1Icon, TrashIcon } from '@radix-ui/react-icons'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import { deleteMaintainance, getMaintainanceTasks } from '../../api/maintainance.api'
import type { Column, SortDirection } from '../../components/ui'
import { Badge, Button, Card, Input, Modal, PageLoader, Select, Table } from '../../components/ui'
import { useToast } from '../../context/ToastContext'
import type { MaintainanceListItem, MaintStatus } from '../../types/dto/maintainance.dto'
import { MAINT_STATUSES } from '../../types/dto/maintainance.dto'

type Row = MaintainanceListItem & Record<string, unknown>
type SortKey = 'maintainanceDate' | 'maintainanceCost' | 'laborCount' | 'status'

const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  ...MAINT_STATUSES.map((s) => ({ value: s, label: s })),
]

function statusVariant(status: MaintStatus) {
  switch (status) {
    case 'Done':
      return 'success' as const
    case 'In progress':
      return 'primary' as const
    case 'Scheduled':
      return 'info' as const
    case 'On Hold':
      return 'warning' as const
    case 'Cancelled':
      return 'danger' as const
    default:
      return 'neutral' as const
  }
}

function compare(a: Row, b: Row, key: SortKey, dir: 'asc' | 'desc'): number {
  let av = a[key]
  let bv = b[key]
  if (key === 'maintainanceDate') {
    av = new Date(av as string).getTime()
    bv = new Date(bv as string).getTime()
  }
  if (av == null || bv == null) return 0
  const result = av < bv ? -1 : av > bv ? 1 : 0
  return dir === 'asc' ? result : -result
}

export default function MaintenanceList() {
  const navigate = useNavigate()
  const toast = useToast()

  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [sortKey, setSortKey] = useState<SortKey | ''>('')
  const [sortDir, setSortDir] = useState<SortDirection>(null)

  const [deleteTarget, setDeleteTarget] = useState<Row | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fetchList = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getMaintainanceTasks()
      setRows(data as Row[])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load maintenance records')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchList()
  }, [fetchList])

  const handleSort = (key: string) => {
    const k = key as SortKey
    setSortKey((prev) => {
      if (prev === k) {
        setSortDir((d) => (d === 'asc' ? 'desc' : d === 'desc' ? null : 'asc'))
        return prev
      }
      setSortDir('asc')
      return k
    })
  }

  const displayed = useMemo(() => {
    let result = rows
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (r) => r.locationName.toLowerCase().includes(q) || r.locationCode.toLowerCase().includes(q)
      )
    }
    if (filterStatus) {
      result = result.filter((r) => r.status === filterStatus)
    }
    if (sortKey && sortDir) {
      result = [...result].sort((a, b) => compare(a, b, sortKey, sortDir))
    }
    return result
  }, [rows, search, filterStatus, sortKey, sortDir])

  const confirmDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await deleteMaintainance(deleteTarget.id)
      toast.success('Maintenance record deleted.')
      setDeleteTarget(null)
      void fetchList()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Delete failed')
      setDeleteTarget(null)
    } finally {
      setDeleting(false)
    }
  }

  const COLUMNS: Column<Row>[] = [
    { key: 'id', label: '#', width: '56px' },
    {
      key: 'locationCode',
      label: 'Location',
      render: (_, row) => (
        <span style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
          <span>
            <Badge variant="neutral">{String(row.locationCode)}</Badge>
          </span>
          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
            {String(row.locationName)}
          </span>
        </span>
      ),
    },
    {
      key: 'maintainanceDate',
      label: 'Date',
      width: '120px',
      sortable: true,
      render: (val) => (
        <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
          {new Date(val as string).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          })}
        </span>
      ),
    },
    {
      key: 'maintainanceCost',
      label: 'Cost',
      width: '120px',
      sortable: true,
      render: (val) => (
        <span
          style={{
            fontWeight: 'var(--font-weight-semibold)' as string,
            color: 'var(--color-primary)',
          }}
        >
          ฿{Number(val).toLocaleString()}
        </span>
      ),
    },
    {
      key: 'laborCount',
      label: 'Workers',
      width: '90px',
      sortable: true,
      render: (val) => (
        <span style={{ fontWeight: 'var(--font-weight-medium)' as string }}>{String(val)}</span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      width: '150px',
      sortable: true,
      render: (val) => (
        <Badge variant={statusVariant(val as MaintStatus)} dot>
          {val as string}
        </Badge>
      ),
    },
    {
      key: 'actions',
      label: '',
      width: '100px',
      className: 'table__td--actions',
      render: (_, row) => (
        <span style={{ display: 'flex', gap: 'var(--space-1)', justifyContent: 'flex-end' }}>
          <Button
            variant="ghost"
            size="sm"
            iconOnly
            onClick={() => navigate(`/maintenance/${row.id}`)}
            title="Edit"
          >
            <Pencil1Icon width={15} height={15} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            iconOnly
            onClick={() => setDeleteTarget(row)}
            title="Delete"
            style={{ color: 'var(--color-danger)' } as React.CSSProperties}
          >
            <TrashIcon width={15} height={15} />
          </Button>
        </span>
      ),
    },
  ]

  // Show full-page loader on first visit before any rows arrive
  if (loading && rows.length === 0) return <PageLoader />

  return (
    <>
      <div className="page-header">
        <h1 className="page-header__title">Maintenance</h1>
        <p className="page-header__subtitle">Manage maintenance records and labor assignments.</p>
      </div>

      {error && (
        <p
          style={{
            color: 'var(--color-danger)',
            marginBottom: 'var(--space-4)',
            fontSize: 'var(--font-size-sm)',
          }}
        >
          {error}
        </p>
      )}

      <Card padding="flush">
        {/* ── Toolbar ── */}
        <div
          style={{
            display: 'flex',
            gap: 'var(--space-3)',
            alignItems: 'center',
            padding: 'var(--space-4)',
            borderBottom: '1px solid var(--color-border)',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ position: 'relative', flex: '1 1 220px', maxWidth: 320 }}>
            <MagnifyingGlassIcon
              width={15}
              height={15}
              style={{
                position: 'absolute',
                left: 'var(--space-3)',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--color-text-muted)',
                pointerEvents: 'none',
              }}
            />
            <Input
              placeholder="Search by location…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: 'var(--space-8)' } as React.CSSProperties}
            />
          </div>

          <div style={{ flex: '0 0 180px' }}>
            <Select
              options={STATUS_OPTIONS}
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            />
          </div>

          <div style={{ marginLeft: 'auto' }}>
            <Button onClick={() => navigate('/maintenance/new')} size="sm">
              + New Maintenance
            </Button>
          </div>
        </div>

        {/* ── Count line ── */}
        <div
          style={{
            padding: 'var(--space-2) var(--space-4)',
            fontSize: 'var(--font-size-xs)',
            color: 'var(--color-text-muted)',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          {loading ? 'Loading…' : `${displayed.length} of ${rows.length} record(s)`}
        </div>

        <Table
          columns={COLUMNS}
          data={displayed}
          rowKey="id"
          loading={loading}
          emptyMessage="No maintenance records match the current filter."
          sortKey={sortKey || undefined}
          sortDirection={sortDir}
          onSort={handleSort}
        />
      </Card>

      {/* Delete confirmation */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Maintenance Record"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleteTarget(null)} disabled={deleting}>
              Cancel
            </Button>
            <Button variant="danger" loading={deleting} onClick={confirmDelete}>
              Delete
            </Button>
          </>
        }
      >
        <p
          style={{
            fontSize: 'var(--font-size-sm)',
            color: 'var(--color-text-secondary)',
          }}
        >
          Delete maintenance record{' '}
          <strong style={{ color: 'var(--color-text-primary)' }}>#{deleteTarget?.id}</strong> at{' '}
          <strong style={{ color: 'var(--color-text-primary)' }}>
            {deleteTarget?.locationName}
          </strong>{' '}
          on{' '}
          <strong style={{ color: 'var(--color-text-primary)' }}>
            {deleteTarget
              ? new Date(deleteTarget.maintainanceDate as string).toLocaleDateString()
              : ''}
          </strong>
          ? This removes all labor assignments for this record.
        </p>
      </Modal>
    </>
  )
}
