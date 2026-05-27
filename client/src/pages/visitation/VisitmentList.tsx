import { MagnifyingGlassIcon, Pencil1Icon, PlusIcon, TrashIcon } from '@radix-ui/react-icons'
import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { type VisitmentData, visitmentApi } from '../../api/visitment.api'
import {
  Badge,
  Button,
  Card,
  type Column,
  Input,
  Modal,
  PageLoader,
  type SortDirection,
  Table,
} from '../../components/ui'
import { useToast } from '../../context/ToastContext'

type VisitBadgeVariant = 'success' | 'danger' | 'primary'

function statusVariant(status: string): VisitBadgeVariant {
  if (status === 'completed') return 'success'
  if (status === 'cancelled') return 'danger'
  return 'primary'
}

export default function VisitmentList() {
  const [data, setData] = useState<VisitmentData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState<string>('visitmentDate')
  const [sortDir, setSortDir] = useState<SortDirection>('desc')
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [recordToDelete, setRecordToDelete] = useState<number | null>(null)
  const [deleting, setDeleting] = useState(false)
  const navigate = useNavigate()
  const toast = useToast()

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      const res = await visitmentApi.getAll()
      setData(res)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load records')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const q = search.trim().toLowerCase()
  const filtered = q
    ? data.filter(
        (row) =>
          row.prisonerName?.toLowerCase().includes(q) || row.prisonerCode?.toLowerCase().includes(q)
      )
    : data

  const displayed = [...filtered].sort((a, b) => {
    const key = sortKey as keyof VisitmentData
    let av = a[key] as string | number | undefined
    let bv = b[key] as string | number | undefined

    if (key === 'visitmentDate') {
      av = av ? new Date(av as string).getTime() : 0
      bv = bv ? new Date(bv as string).getTime() : 0
    }

    if ((av ?? 0) < (bv ?? 0)) return sortDir === 'asc' ? -1 : 1
    if ((av ?? 0) > (bv ?? 0)) return sortDir === 'asc' ? 1 : -1
    return 0
  })

  const confirmDelete = (id: number) => {
    setRecordToDelete(id)
    setDeleteModalOpen(true)
  }

  const handleDelete = async () => {
    if (recordToDelete === null) return
    setDeleting(true)
    try {
      await visitmentApi.delete(recordToDelete)
      toast.success('Record deleted successfully')
      setDeleteModalOpen(false)
      setRecordToDelete(null)
      void loadData()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Delete failed')
      setDeleteModalOpen(false)
      setRecordToDelete(null)
    } finally {
      setDeleting(false)
    }
  }

  const COLUMNS: Column<VisitmentData>[] = [
    { key: 'id', label: '#', width: '56px' },
    {
      key: 'prisonerName',
      label: 'Prisoner',
      render: (_, row) => (
        <div>
          <div>{row.prisonerName}</div>
          <div className="cell-muted">{row.prisonerCode}</div>
        </div>
      ),
    },
    {
      key: 'visitmentDate',
      label: 'Date',
      width: '150px',
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
      key: 'duration',
      label: 'Duration',
      width: '100px',
      sortable: true,
      render: (val) => `${val} mins`,
    },
    {
      key: 'status',
      label: 'Status',
      width: '130px',
      sortable: true,
      render: (val) => (
        <Badge variant={statusVariant(val as string)} dot>
          {val as string}
        </Badge>
      ),
    },
    {
      key: 'visitorCount',
      label: 'Visitors',
      width: '100px',
      sortable: true,
      render: (val) => `${val ?? 0} persons`,
    },
    {
      key: 'actions',
      label: '',
      width: '100px',
      render: (_, row) => (
        <span className="cell-actions">
          <Button
            variant="ghost"
            size="sm"
            iconOnly
            title="Edit"
            onClick={() => navigate(`/visitation/edit/${row.id}`)}
          >
            <Pencil1Icon width={14} height={14} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            iconOnly
            title="Delete"
            className="btn-danger-ghost"
            onClick={() => {
              if (row.id !== undefined) confirmDelete(row.id)
            }}
          >
            <TrashIcon width={14} height={14} />
          </Button>
        </span>
      ),
    },
  ]

  if (loading && data.length === 0) return <PageLoader />

  return (
    <>
      <div className="page-header">
        <h1 className="page-header__title">Visitment Records</h1>
        <p className="page-header__subtitle">Manage and track all registered visitation records.</p>
      </div>

      {error && <p className="page-error">{error}</p>}

      <Card padding="flush">
        <div className="page-toolbar">
          <div className="page-toolbar__search">
            <Input
              prefix={<MagnifyingGlassIcon width={15} height={15} />}
              placeholder="Search by prisoner name or code…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="page-toolbar__actions">
            <Button size="sm" onClick={() => navigate('/visitation/new')}>
              <PlusIcon width={13} height={13} /> New Visitment
            </Button>
          </div>
        </div>

        <div className="page-count">
          {loading ? 'Loading…' : `${displayed.length} of ${data.length} record(s)`}
        </div>

        <Table
          columns={COLUMNS}
          data={displayed}
          rowKey="id"
          loading={loading}
          emptyMessage="No visitation records found."
          sortKey={sortKey}
          sortDirection={sortDir}
          onSort={handleSort}
        />
      </Card>

      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Visitment"
        size="sm"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setDeleteModalOpen(false)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button variant="danger" loading={deleting} onClick={handleDelete}>
              Delete
            </Button>
          </>
        }
      >
        <p className="delete-confirm-text">
          Are you sure you want to delete this visitation record? This action cannot be undone.
        </p>
      </Modal>
    </>
  )
}
