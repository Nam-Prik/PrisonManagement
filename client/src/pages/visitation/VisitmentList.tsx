import { PlusIcon, Pencil1Icon, TrashIcon } from '@radix-ui/react-icons'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { visitmentApi, type VisitmentData } from '../../api/visitment.api'
import { Button, Card, PageLoader, Table, type Column, type SortDirection } from '../../components/ui'
import { useToast } from '../../context/ToastContext'
import './VisitmentForm.css' // Reuse styles for consistency

export default function VisitmentList() {
  const [data, setData] = useState<VisitmentData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sortKey, setSortKey] = useState<string>('visitmentDate')
  const [sortDir, setSortDir] = useState<SortDirection>('desc')
  const navigate = useNavigate()
  const toast = useToast()

  const loadData = async () => {
    try {
      setLoading(true)
      const res = await visitmentApi.getAll()
      setData(res)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load records')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir(prev => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const displayed = [...data].sort((a, b) => {
    const key = sortKey as keyof VisitmentData
    let av: any = a[key]
    let bv: any = b[key]
    
    if (key === 'visitmentDate') {
      av = new Date(av).getTime()
      bv = new Date(bv).getTime()
    }
    
    if (av < bv) return sortDir === 'asc' ? -1 : 1
    if (av > bv) return sortDir === 'asc' ? 1 : -1
    return 0
  })

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this record?')) return
    try {
      await visitmentApi.delete(id)
      toast.success('Record deleted successfully')
      loadData()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Delete failed')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'var(--color-success)'
      case 'cancelled': return 'var(--color-danger)'
      default: return 'var(--color-primary)'
    }
  }

  const COLUMNS: Column<VisitmentData>[] = [
    { key: 'id', label: '#', width: '56px' },
    {
      key: 'prisonerName',
      label: 'Prisoner',
      render: (_, row) => (
        <div>
          <div style={{ fontWeight: '500', color: 'var(--color-text-primary)' }}>{row.prisonerName}</div>
          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>{row.prisonerCode}</div>
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
        <span style={{ 
          display: 'inline-flex', 
          alignItems: 'center', 
          gap: '6px',
          fontSize: 'var(--font-size-xs)',
          fontWeight: '600',
          textTransform: 'uppercase',
          color: getStatusColor(val as string)
        }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: getStatusColor(val as string) }} />
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
            onClick={() => handleDelete(row.id!)}
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
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
        <div>
          <h1 className="page-header__title">Visitment List</h1>
          <p className="page-header__subtitle">Manage and track all registered visitation records.</p>
        </div>
        <Button variant="primary" onClick={() => navigate('/visitation/new')}>
          <PlusIcon style={{ marginRight: 'var(--space-2)' }} />
          New Visitment Form
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
    </div>
  )
}
