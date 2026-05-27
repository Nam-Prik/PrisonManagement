import { MagnifyingGlassIcon, Pencil1Icon, PlusIcon, TrashIcon } from '@radix-ui/react-icons'
import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { deleteTreatment, getTreatments } from '../../api/treatment.api'
import {
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
import type { TreatmentListItem } from '../../types/dto/treatment.dto'

export default function TreatmentList() {
  const [rows, setRows] = useState<TreatmentListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState<string>('')
  const [sortDir, setSortDir] = useState<SortDirection>(null)
  const [deleteTarget, setDeleteTarget] = useState<TreatmentListItem | null>(null)
  const [deleting, setDeleting] = useState(false)
  const navigate = useNavigate()
  const toast = useToast()

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setRows(await getTreatments())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load treatment records')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadData()
  }, [loadData])

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : d === 'desc' ? null : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await deleteTreatment(deleteTarget.id)
      toast.success('Treatment record deleted.')
      setDeleteTarget(null)
      void loadData()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Delete failed')
      setDeleteTarget(null)
    } finally {
      setDeleting(false)
    }
  }

  const q = search.trim().toLowerCase()
  let displayed = q
    ? rows.filter(
        (r) =>
          `${r.prisonerFirstName} ${r.prisonerLastName}`.toLowerCase().includes(q) ||
          r.prisonerCode.toLowerCase().includes(q) ||
          `${r.nurseFirstName} ${r.nurseLastName}`.toLowerCase().includes(q)
      )
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

  const COLUMNS: Column<TreatmentListItem>[] = [
    { key: 'id', label: '#', width: '56px' },
    {
      key: 'prisonerFirstName',
      label: 'Prisoner',
      sortable: true,
      render: (_, row) => (
        <div>
          <div>{`${row.prisonerFirstName} ${row.prisonerLastName}`}</div>
          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
            {row.prisonerCode}
          </div>
        </div>
      ),
    },
    {
      key: 'nurseFirstName',
      label: 'Nurse',
      sortable: true,
      render: (_, row) => (
        <div>
          <div>{`${row.nurseFirstName} ${row.nurseLastName}`}</div>
          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
            {row.nurseCode}
          </div>
        </div>
      ),
    },
    {
      key: 'diagnoseDate',
      label: 'Diagnosis Date',
      width: '140px',
      sortable: true,
      render: (val) =>
        typeof val === 'string' ? (
          <span className="cell-muted">
            {new Date(val).toLocaleDateString('en-GB', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })}
          </span>
        ) : null,
    },
    { key: 'description', label: 'Description' },
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
            onClick={() => navigate(`/treatment/${row.id}`)}
          >
            <Pencil1Icon width={14} height={14} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            iconOnly
            title="Delete"
            className="btn-danger-ghost"
            onClick={() => setDeleteTarget(row)}
          >
            <TrashIcon width={14} height={14} />
          </Button>
        </span>
      ),
    },
  ]

  if (loading && rows.length === 0) return <PageLoader />

  return (
    <>
      <div className="page-header">
        <h1 className="page-header__title">Treatment Records</h1>
        <p className="page-header__subtitle">
          Manage prisoner treatment records and medication prescriptions.
        </p>
      </div>

      {error && <p className="page-error">{error}</p>}

      <Card padding="flush">
        <div className="page-toolbar">
          <div className="page-toolbar__search">
            <Input
              prefix={<MagnifyingGlassIcon width={15} height={15} />}
              placeholder="Search by prisoner or nurse name…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="page-toolbar__actions">
            <Button size="sm" onClick={() => navigate('/treatment/new')}>
              <PlusIcon width={13} height={13} /> New Treatment
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
          emptyMessage="No treatment records found."
          sortKey={sortKey || undefined}
          sortDirection={sortDir}
          onSort={handleSort}
        />
      </Card>

      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Treatment"
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
          Delete treatment record <strong>#{deleteTarget?.id}</strong> for{' '}
          <strong>
            {deleteTarget?.prisonerFirstName} {deleteTarget?.prisonerLastName}
          </strong>
          ? This action cannot be undone.
        </p>
      </Modal>
    </>
  )
}
