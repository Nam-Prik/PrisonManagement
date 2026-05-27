import { MagnifyingGlassIcon, Pencil1Icon, TrashIcon } from '@radix-ui/react-icons'
import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { deleteOfficer, getOfficerOptions } from '../../api/officer.api'
import type { Column, SortDirection } from '../../components/ui'
import { Button, Card, Input, Modal, PageLoader, Table } from '../../components/ui'
import { useToast } from '../../context/ToastContext'
import type { OfficerOption } from '../../types/dto/officer.dto'

export default function OfficerList() {
  const navigate = useNavigate()
  const toast = useToast()
  const [rows, setRows] = useState<OfficerOption[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState<string>('')
  const [sortDir, setSortDir] = useState<SortDirection>(null)
  const [deleteTarget, setDeleteTarget] = useState<OfficerOption | null>(null)
  const [deleting, setDeleting] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getOfficerOptions()
      setRows(data)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load')
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    void load()
  }, [load])

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : d === 'desc' ? null : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  let displayed = search.trim()
    ? rows.filter((r) => {
        const q = search.toLowerCase()
        return (
          r.firstName.toLowerCase().includes(q) ||
          r.lastName.toLowerCase().includes(q) ||
          r.rank.toLowerCase().includes(q)
        )
      })
    : rows
  if (sortKey && sortDir) {
    displayed = [...displayed].sort((a, b) => {
      const av = (a as unknown as Record<string, unknown>)[sortKey]
      const bv = (b as unknown as Record<string, unknown>)[sortKey]
      if (av == null && bv == null) return 0
      if (av == null) return 1
      if (bv == null) return -1
      const result = av < bv ? -1 : av > bv ? 1 : 0
      return sortDir === 'asc' ? result : -result
    })
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await deleteOfficer(deleteTarget.id)
      toast.success('Officer deleted.')
      setDeleteTarget(null)
      load()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Delete failed')
      setDeleteTarget(null)
    } finally {
      setDeleting(false)
    }
  }

  const COLUMNS: Column<OfficerOption>[] = [
    { key: 'id', label: '#', width: '56px' },
    { key: 'code', label: 'Code', width: '80px', sortable: true },
    {
      key: 'firstName',
      label: 'Name',
      sortable: true,
      render: (_, row) => (
        <span>
          {row.firstName} {row.lastName}
        </span>
      ),
    },
    { key: 'rank', label: 'Rank', sortable: true },
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
            onClick={() => navigate(`/officer/${row.id}`)}
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
        <h1 className="page-header__title">Officers</h1>
        <p className="page-header__subtitle">Manage officer records.</p>
      </div>
      <Card padding="flush">
        <div className="page-toolbar">
          <div className="page-toolbar__search">
            <Input
              prefix={<MagnifyingGlassIcon width={15} height={15} />}
              placeholder="Search by name or rank…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="page-toolbar__actions">
            <Button onClick={() => navigate('/officer/new')} size="sm">
              + New Officer
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
          emptyMessage="No officers found."
          sortKey={sortKey || undefined}
          sortDirection={sortDir}
          onSort={handleSort}
        />
      </Card>
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Officer"
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
        <p>
          Delete{' '}
          <strong>
            {deleteTarget?.firstName} {deleteTarget?.lastName}
          </strong>
          ?
        </p>
      </Modal>
    </>
  )
}
