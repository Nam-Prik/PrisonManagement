import { Pencil1Icon, PlusIcon, TrashIcon } from '@radix-ui/react-icons'
import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { type VisitmentData, visitmentApi } from '../../api/visitment.api'
import {
  Button,
  Card,
  type Column,
  Modal,
  PageLoader,
  type SortDirection,
  Table,
} from '../../components/ui'
import { useToast } from '../../context/ToastContext'
import './VisitmentForm.css'

export default function VisitmentList() {
  const [data, setData] = useState<VisitmentData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sortKey, setSortKey] = useState<string>('visitmentDate')
  const [sortDir, setSortDir] = useState<SortDirection>('desc')
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [recordToDelete, setRecordToDelete] = useState<number | null>(null)
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

  const displayed = [...data].sort((a, b) => {
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
    try {
      await visitmentApi.delete(recordToDelete)
      toast.success('Record deleted successfully')
      loadData()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Delete failed')
    } finally {
      setDeleteModalOpen(false)
      setRecordToDelete(null)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'var(--color-success)'
      case 'cancelled':
        return 'var(--color-danger)'
      default:
        return 'var(--color-primary)'
    }
  }

  const COLUMNS: Column<VisitmentData>[] = [
    { key: 'id', label: '#', width: '56px' },
    {
      key: 'prisonerName',
      label: 'Prisoner',
      render: (_, row) => (
        <div>
          <div style={{ fontWeight: '500', color: 'var(--color-text-primary)' }}>
            {row.prisonerName}
          </div>
          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
            {row.prisonerCode}
          </div>
        </div>
      ),
    },
    {
      key: 'visitmentDate',
      label: 'Date',
      width: '150px',
      sortable: true,
      render: (val) => (
        <span style={{ color: 'var(--color-text-muted)' }}>
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
      render: (val) => `${val} mins`,
    },
    {
      key: 'status',
      label: 'Status',
      width: '150px',
      render: (val) => (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: 'var(--font-size-xs)',
            fontWeight: '600',
            textTransform: 'uppercase',
            color: getStatusColor(val as string),
          }}
        >
          <span
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: getStatusColor(val as string),
            }}
          />
          {val as string}
        </span>
      ),
    },
    {
      key: 'visitorCount',
      label: 'Visitors',
      width: '100px',
      render: (val) => `${val ?? 0} persons`,
    },
    {
      key: 'actions',
      label: '',
      width: '100px',
      render: (_, row) => (
        <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end' }}>
          <Button
            size="sm"
            variant="ghost"
            iconOnly
            onClick={() => navigate(`/visitation/edit/${row.id}`)}
          >
            <Pencil1Icon width={14} height={14} />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            iconOnly
            style={{ color: 'var(--color-danger)' }}
            onClick={() => {
              if (row.id !== undefined) confirmDelete(row.id)
            }}
          >
            <TrashIcon width={14} height={14} />
          </Button>
        </div>
      ),
    },
  ]

  if (loading && data.length === 0) return <PageLoader />

  return (
    <div className="visitment-form-page">
      <div
        className="page-header"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 'var(--space-6)',
        }}
      >
        <div>
          <h1 className="page-header__title">Visitment List</h1>
          <p className="page-header__subtitle">
            Manage and track all registered visitation records.
          </p>
        </div>
        <Button variant="primary" onClick={() => navigate('/visitation/new')}>
          <PlusIcon style={{ marginRight: 'var(--space-2)' }} />
          New Visitment
        </Button>
      </div>

      {error && <div className="form-error-banner">{error}</div>}

      <Card padding="flush">
        <Table
          columns={COLUMNS}
          data={displayed}
          rowKey="id"
          loading={loading}
          sortKey={sortKey}
          sortDirection={sortDir}
          onSort={handleSort}
        />
      </Card>

      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Record"
        size="sm"
        footer={
          <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'flex-end' }}>
            <Button variant="secondary" onClick={() => setDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              style={{ backgroundColor: 'var(--color-danger)', borderColor: 'var(--color-danger)' }}
              onClick={handleDelete}
            >
              Delete
            </Button>
          </div>
        }
      >
        <p>Are you sure you want to delete this record? This action cannot be undone.</p>
      </Modal>
    </div>
  )
}
