import { MagnifyingGlassIcon, Pencil1Icon, TrashIcon } from '@radix-ui/react-icons'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { deleteMaintainance, getMaintainanceTasks } from '../../api/maintainance.api'
import type { Column, SortDirection } from '../../components/ui'
import { Badge, Button, Card, Input, Modal, PageLoader, Select, Table } from '../../components/ui'
import { useToast } from '../../context/ToastContext'
import type { MaintainanceListItem, MaintStatus } from '../../types/dto/maintainance.dto'
import { MAINT_STATUSES } from '../../types/dto/maintainance.dto'
import './MaintenanceList.css'

/* ── Types ───────────────────────────────────────────── */

type SortKey = 'maintainanceDate' | 'maintainanceCost' | 'laborCount' | 'status'

/* ── Helpers (module-level, no closures over state) ──── */

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

function compare(
  a: MaintainanceListItem,
  b: MaintainanceListItem,
  key: SortKey,
  dir: 'asc' | 'desc'
): number {
  let av: unknown = a[key]
  let bv: unknown = b[key]
  if (key === 'maintainanceDate') {
    av = new Date(av as string).getTime()
    bv = new Date(bv as string).getTime()
  }
  if (av == null || bv == null) return 0
  const result = av < bv ? -1 : av > bv ? 1 : 0
  return dir === 'asc' ? result : -result
}

/* ── Component ───────────────────────────────────────── */

export default function MaintenanceList() {
  const navigate = useNavigate()
  const toast = useToast()

  const [rows, setRows] = useState<MaintainanceListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [sortKey, setSortKey] = useState<SortKey | ''>('')
  const [sortDir, setSortDir] = useState<SortDirection>(null)

  const [deleteTarget, setDeleteTarget] = useState<MaintainanceListItem | null>(null)
  const [deleting, setDeleting] = useState(false)

  /* ── Initial data load ── */

  useEffect(() => {
    setLoading(true)
    setError(null)
    getMaintainanceTasks()
      .then((data) => setRows(data))
      .catch((err) =>
        setError(err instanceof Error ? err.message : 'Failed to load maintenance records')
      )
      .finally(() => setLoading(false))
  }, [])

  /* ── Sort handler ── */

  const handleSort = (key: string) => {
    const k = key as SortKey
    if (sortKey === k) {
      setSortDir((d) => (d === 'asc' ? 'desc' : d === 'desc' ? null : 'asc'))
    } else {
      setSortKey(k)
      setSortDir('asc')
    }
  }

  /* ── Derived display list (computed inline, no useMemo) ── */

  let displayed = rows
  if (search.trim()) {
    const q = search.toLowerCase()
    displayed = displayed.filter(
      (r) => r.locationName.toLowerCase().includes(q) || r.locationCode.toLowerCase().includes(q)
    )
  }
  if (filterStatus) {
    displayed = displayed.filter((r) => r.status === filterStatus)
  }
  if (sortKey && sortDir) {
    displayed = [...displayed].sort((a, b) => compare(a, b, sortKey, sortDir))
  }

  /* ── Delete ── */

  const confirmDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await deleteMaintainance(deleteTarget.id)
      toast.success('Maintenance record deleted.')
      setDeleteTarget(null)
      setLoading(true)
      setError(null)
      getMaintainanceTasks()
        .then((data) => setRows(data))
        .catch((err) =>
          setError(err instanceof Error ? err.message : 'Failed to reload maintenance records')
        )
        .finally(() => setLoading(false))
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Delete failed')
      setDeleteTarget(null)
    } finally {
      setDeleting(false)
    }
  }

  /* ── Column definitions ── */

  const COLUMNS: Column<MaintainanceListItem>[] = [
    { key: 'id', label: '#', width: '56px' },
    {
      key: 'locationCode',
      label: 'Location',
      render: (_, row) => (
        <span className="cell-location">
          <span>
            <Badge variant="neutral">{row.locationCode}</Badge>
          </span>
          <span className="cell-location__name">{row.locationName}</span>
        </span>
      ),
    },
    {
      key: 'maintainanceDate',
      label: 'Date',
      width: '120px',
      sortable: true,
      render: (val) => (
        <span className="cell-muted">
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
      render: (val) => <span className="cell-cost">฿{Number(val).toLocaleString()}</span>,
    },
    {
      key: 'laborCount',
      label: 'Workers',
      width: '90px',
      sortable: true,
      render: (val) => <span className="cell-bold">{String(val)}</span>,
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
        <span className="cell-actions">
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
            className="btn-danger-ghost"
          >
            <TrashIcon width={15} height={15} />
          </Button>
        </span>
      ),
    },
  ]

  /* ── Render ── */

  if (loading && rows.length === 0) return <PageLoader />

  return (
    <>
      <div className="page-header">
        <h1 className="page-header__title">Maintenance</h1>
        <p className="page-header__subtitle">Manage maintenance records and labor assignments.</p>
      </div>

      {error && <p className="page-error">{error}</p>}

      <Card padding="flush">
        <div className="page-toolbar">
          <div className="page-toolbar__search">
            <Input
              prefix={<MagnifyingGlassIcon width={15} height={15} />}
              placeholder="Search by location…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="page-toolbar__filter">
            <Select
              options={STATUS_OPTIONS}
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            />
          </div>

          <div className="page-toolbar__actions">
            <Button onClick={() => navigate('/maintenance/new')} size="sm">
              + New Maintenance
            </Button>
          </div>
        </div>

        <div className="page-count">
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
        <p className="delete-confirm-text">
          Delete maintenance record{' '}
          <strong className="delete-confirm-text__emphasis">#{deleteTarget?.id}</strong> at{' '}
          <strong className="delete-confirm-text__emphasis">{deleteTarget?.locationName}</strong> on{' '}
          <strong className="delete-confirm-text__emphasis">
            {deleteTarget ? new Date(deleteTarget.maintainanceDate).toLocaleDateString() : ''}
          </strong>
          ? This removes all labor assignments for this record.
        </p>
      </Modal>
    </>
  )
}
