import { MagnifyingGlassIcon, Pencil1Icon, TrashIcon } from '@radix-ui/react-icons'
import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import './PrisonerIntakeList.css'
import { deletePrisonerIntake, getPrisonerIntakes } from '../../api/prisonerintake.api'
import type { Column, SortDirection } from '../../components/ui'
import { Badge, Button, Card, Input, Modal, PageLoader, Select, Table } from '../../components/ui'
import { useToast } from '../../context/ToastContext'
import type { PrisonerIntakeListItem } from '../../types/dto/prisonerintake.dto'
import { HEALTH_STATUSES } from '../../types/dto/prisonerintake.dto'

type SortKey = 'intakeDate' | 'initialHealthStatus' | 'itemCount'

const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  ...HEALTH_STATUSES.map((s) => ({ value: s, label: s })),
]

function healthVariant(status: string) {
  switch (status) {
    case 'Cleared':
      return 'success' as const
    case 'Routine Follow-up':
      return 'info' as const
    case 'Observation':
      return 'primary' as const
    case 'Quarantined':
      return 'warning' as const
    case 'Hospitalized':
    case 'Critical':
    case 'Deceased':
      return 'danger' as const
    default:
      return 'neutral' as const
  }
}

function compare(
  a: PrisonerIntakeListItem,
  b: PrisonerIntakeListItem,
  key: SortKey,
  dir: 'asc' | 'desc'
): number {
  let av: unknown = a[key]
  let bv: unknown = b[key]
  if (key === 'intakeDate') {
    av = new Date(av as string).getTime()
    bv = new Date(bv as string).getTime()
  }
  if (av == null || bv == null) return 0
  const result = av < bv ? -1 : av > bv ? 1 : 0
  return dir === 'asc' ? result : -result
}

export default function PrisonerIntakeList() {
  const navigate = useNavigate()
  const toast = useToast()

  const [rows, setRows] = useState<PrisonerIntakeListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<PrisonerIntakeListItem | null>(null)
  const [deleting, setDeleting] = useState(false)

  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [sortKey, setSortKey] = useState<SortKey | ''>('')
  const [sortDir, setSortDir] = useState<SortDirection>(null)

  const load = useCallback(() => {
    setLoading(true)
    setError(null)
    getPrisonerIntakes()
      .then(setRows)
      .catch((err) =>
        setError(err instanceof Error ? err.message : 'Failed to load prisoner intakes')
      )
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const handleSort = (key: string) => {
    const k = key as SortKey
    if (sortKey === k) {
      setSortDir((d) => (d === 'asc' ? 'desc' : d === 'desc' ? null : 'asc'))
    } else {
      setSortKey(k)
      setSortDir('asc')
    }
  }

  let displayed = rows
  if (search.trim()) {
    const q = search.toLowerCase()
    displayed = displayed.filter(
      (r) =>
        r.prisonerCode.toLowerCase().includes(q) ||
        r.firstName.toLowerCase().includes(q) ||
        r.lastName.toLowerCase().includes(q)
    )
  }
  if (filterStatus) {
    displayed = displayed.filter((r) => r.initialHealthStatus === filterStatus)
  }
  if (sortKey && sortDir) {
    displayed = [...displayed].sort((a, b) => compare(a, b, sortKey, sortDir))
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await deletePrisonerIntake(deleteTarget.id)
      toast.success('Prisoner intake deleted.')
      setDeleteTarget(null)
      load()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Delete failed')
      setDeleteTarget(null)
    } finally {
      setDeleting(false)
    }
  }

  const COLUMNS: Column<PrisonerIntakeListItem>[] = [
    { key: 'id', label: '#', width: '60px' },
    { key: 'prisonerCode', label: 'Code', width: '100px' },
    {
      key: 'firstName',
      label: 'Prisoner',
      render: (_, row) => `${row.firstName} ${row.lastName}`,
    },
    {
      key: 'intakeDate',
      label: 'Intake Date',
      width: '130px',
      sortable: true,
      render: (val) =>
        new Date(val as string).toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }),
    },
    {
      key: 'initialHealthStatus',
      label: 'Health Status',
      width: '170px',
      sortable: true,
      render: (val) => (
        <Badge variant={healthVariant(val as string)} dot>
          {val as string}
        </Badge>
      ),
    },
    { key: 'itemCount', label: 'Items', width: '80px', sortable: true },
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
            title="Edit"
            onClick={() => navigate(`/prisoner-intake/${row.id}`)}
          >
            <Pencil1Icon width={15} height={15} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            iconOnly
            title="Delete"
            className="btn-danger-ghost"
            onClick={() => setDeleteTarget(row)}
          >
            <TrashIcon width={15} height={15} />
          </Button>
        </span>
      ),
    },
  ]

  if (loading && rows.length === 0) return <PageLoader />

  return (
    <>
      <div className="page-header">
        <h1 className="page-header__title">Prisoner Intake</h1>
        <p className="page-header__subtitle">
          Records of prisoner admissions and confiscated items.
        </p>
      </div>

      {error && <p className="page-error">{error}</p>}

      <Card padding="flush">
        <div className="page-toolbar">
          <div className="page-toolbar__search">
            <Input
              prefix={<MagnifyingGlassIcon width={15} height={15} />}
              placeholder="Search by code or name…"
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
            <Button size="sm" onClick={() => navigate('/prisoner-intake/new')}>
              + New Intake
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
          emptyMessage="No prisoner intake records match the current filter."
          sortKey={sortKey || undefined}
          sortDirection={sortDir}
          onSort={handleSort}
        />
      </Card>

      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Prisoner Intake"
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
          Delete intake record for prisoner{' '}
          <strong className="delete-confirm-text__emphasis">{deleteTarget?.prisonerCode}</strong> (
          {deleteTarget?.firstName} {deleteTarget?.lastName})? This will also remove the prisoner
          record.
        </p>
      </Modal>
    </>
  )
}
