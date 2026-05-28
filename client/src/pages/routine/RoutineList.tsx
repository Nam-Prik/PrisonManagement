import { MagnifyingGlassIcon, Pencil1Icon, TrashIcon } from '@radix-ui/react-icons'
import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { deleteRoutine, getRoutines } from '../../api/routine.api'
import type { Column, SortDirection } from '../../components/ui'
import { Badge, Button, Card, Input, Modal, PageLoader, Table } from '../../components/ui'
import { useToast } from '../../context/ToastContext'
import type { RoutineListItem } from '../../types/dto/routine.dto'

import '../maintenance/MaintenanceList.css'

type SortKey = 'routineName' | 'locationName' | 'scheduleDate' | 'type'

export default function RoutineList() {
  const navigate = useNavigate()
  const toast = useToast()

  const [rows, setRows] = useState<RoutineListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState<SortKey | ''>('')
  const [sortDir, setSortDir] = useState<SortDirection>(null)

  const [deleteTarget, setDeleteTarget] = useState<RoutineListItem | null>(null)
  const [deleting, setDeleting] = useState(false)

  const loadData = useCallback(() => {
    setLoading(true)
    setError(null)
    getRoutines()
      .then(setRows)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load routines'))
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
      (r) => r.routineName.toLowerCase().includes(q) || r.type.toLowerCase().includes(q)
    )
  }
  if (sortKey && sortDir) {
    displayed = [...displayed].sort((a, b) => {
      const av = a[sortKey]
      const bv = b[sortKey]
      if (av == null || bv == null) return 0
      const result = av < bv ? -1 : av > bv ? 1 : 0
      return sortDir === 'asc' ? result : -result
    })
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await deleteRoutine(deleteTarget.id)
      toast.success('Routine deleted.')
      setDeleteTarget(null)
      loadData()
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : 'Cannot delete routine: An inspection might already be tied to it.'
      )
      setDeleteTarget(null)
    } finally {
      setDeleting(false)
    }
  }

  const COLUMNS: Column<RoutineListItem>[] = [
    { key: 'id', label: '#', width: '60px' },
    { key: 'routineName', label: 'Routine Name', sortable: true },
    { key: 'locationName', label: 'Location', sortable: true },
    {
      key: 'type',
      label: 'Type',
      sortable: true,
      render: (val) => <Badge variant="neutral">{String(val)}</Badge>,
    },
    {
      key: 'scheduleDate',
      label: 'Date',
      width: '120px',
      sortable: true,
      render: (val) => new Date(val as string).toLocaleDateString(),
    },
    {
      key: 'officerCount',
      label: 'Assigned',
      width: '100px',
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
            onClick={() => navigate(`/routines/${row.id}`)}
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
        <h1 className="page-header__title">Routine Schedules</h1>
        <p className="page-header__subtitle">Manage guard deployments and active routines.</p>
      </div>

      {error && <p className="page-error">{error}</p>}

      <Card padding="flush">
        <div className="page-toolbar">
          <div className="page-toolbar__search">
            <Input
              prefix={<MagnifyingGlassIcon width={15} height={15} />}
              placeholder="Search by name or type…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="page-toolbar__actions">
            <Button onClick={() => navigate('/routines/new')} size="sm">
              + New Routine
            </Button>
          </div>
        </div>

        <Table
          columns={COLUMNS}
          data={displayed}
          rowKey="id"
          loading={loading}
          emptyMessage="No routines found."
          sortKey={sortKey || undefined}
          sortDirection={sortDir}
          onSort={handleSort}
        />
      </Card>

      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Routine"
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
          Delete schedule{' '}
          <strong className="delete-confirm-text__emphasis">{deleteTarget?.routineName}</strong>?
          All assigned officers will be removed from this patrol.
        </p>
      </Modal>
    </>
  )
}
