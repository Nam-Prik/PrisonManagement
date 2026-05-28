import { MagnifyingGlassIcon, Pencil1Icon, TrashIcon } from '@radix-ui/react-icons'
import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { deleteInspection, getInspections } from '../../api/inspection.api'
import type { Column, SortDirection } from '../../components/ui'
import { Badge, Button, Card, Input, Modal, PageLoader, Table } from '../../components/ui'
import { useToast } from '../../context/ToastContext'
import type { InspectionListItem } from '../../types/dto/inspection.dto'

import '../maintenance/MaintenanceList.css'

type SortKey = 'code' | 'routineName' | 'irregularityCount' | 'reason'

function compare(a: InspectionListItem, b: InspectionListItem, key: SortKey, dir: 'asc' | 'desc') {
  const av = a[key]
  const bv = b[key]
  if (av == null || bv == null) return 0
  const result = av < bv ? -1 : av > bv ? 1 : 0
  return dir === 'asc' ? result : -result
}

export default function InspectionList() {
  const navigate = useNavigate()
  const toast = useToast()

  const [rows, setRows] = useState<InspectionListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState<SortKey | ''>('')
  const [sortDir, setSortDir] = useState<SortDirection>(null)

  const [deleteTarget, setDeleteTarget] = useState<InspectionListItem | null>(null)
  const [deleting, setDeleting] = useState(false)

  const loadData = useCallback(() => {
    setLoading(true)
    setError(null)
    getInspections()
      .then(setRows)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load inspections'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

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
      (r) => r.code.toLowerCase().includes(q) || r.routineName.toLowerCase().includes(q)
    )
  }
  if (sortKey && sortDir) {
    displayed = [...displayed].sort((a, b) => compare(a, b, sortKey, sortDir))
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await deleteInspection(deleteTarget.id)
      toast.success('Inspection deleted.')
      setDeleteTarget(null)
      loadData()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Delete failed')
      setDeleteTarget(null)
    } finally {
      setDeleting(false)
    }
  }

  const COLUMNS: Column<InspectionListItem>[] = [
    { key: 'id', label: '#', width: '60px' },
    {
      key: 'code',
      label: 'Code',
      sortable: true,
      width: '120px',
      render: (val) => <Badge variant="neutral">{String(val)}</Badge>,
    },
    { key: 'routineName', label: 'Routine Name', sortable: true },
    { key: 'reason', label: 'Reason', sortable: true },
    {
      key: 'irregularityCount',
      label: 'Findings',
      width: '100px',
      sortable: true,
      render: (val) => <span className="cell-bold">{String(val)}</span>,
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
            onClick={() => navigate(`/inspections/${row.id}`)}
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

  if (loading && rows.length === 0) return <PageLoader />

  return (
    <>
      <div className="page-header">
        <h1 className="page-header__title">Inspections</h1>
        <p className="page-header__subtitle">Manage security inspections and log irregularities.</p>
      </div>

      {error && <p className="page-error">{error}</p>}

      <Card padding="flush">
        <div className="page-toolbar">
          <div className="page-toolbar__search">
            <Input
              prefix={<MagnifyingGlassIcon width={15} height={15} />}
              placeholder="Search code or routine…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="page-toolbar__actions">
            <Button onClick={() => navigate('/inspections/new')} size="sm">
              + New Inspection
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
          emptyMessage="No inspections found."
          sortKey={sortKey || undefined}
          sortDirection={sortDir}
          onSort={handleSort}
        />
      </Card>

      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Inspection"
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
          Are you sure you want to delete inspection{' '}
          <strong className="delete-confirm-text__emphasis">{deleteTarget?.code}</strong>? All line
          item findings will be permanently removed.
        </p>
      </Modal>
    </>
  )
}
