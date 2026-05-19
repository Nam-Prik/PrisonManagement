import { MagnifyingGlassIcon, Pencil1Icon, TrashIcon } from '@radix-ui/react-icons'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { deleteIncident, getIncidents } from '../../api/incident.api'
import type { Column, SortDirection } from '../../components/ui'
import { Badge, Button, Card, Input, Modal, PageLoader, Table } from '../../components/ui'
import { useToast } from '../../context/ToastContext'
import type { IncidentListItem } from '../../types/dto/incident.dto'
import './IncidentList.css'

type SortKey = 'incidentDatetime' | 'involvedCount'

function compare(
  a: IncidentListItem,
  b: IncidentListItem,
  key: SortKey,
  dir: 'asc' | 'desc'
): number {
  let av: unknown = a[key]
  let bv: unknown = b[key]
  if (key === 'incidentDatetime') {
    av = new Date(av as string).getTime()
    bv = new Date(bv as string).getTime()
  }
  if (av == null || bv == null) return 0
  const result = av < bv ? -1 : av > bv ? 1 : 0
  return dir === 'asc' ? result : -result
}

export default function IncidentList() {
  const navigate = useNavigate()
  const toast = useToast()

  const [rows, setRows] = useState<IncidentListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState<SortKey | ''>('')
  const [sortDir, setSortDir] = useState<SortDirection>(null)

  const [deleteTarget, setDeleteTarget] = useState<IncidentListItem | null>(null)
  const [deleting, setDeleting] = useState(false)

  const load = () => {
    setLoading(true)
    setError(null)
    getIncidents()
      .then((data) => setRows(data))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load incidents'))
      .finally(() => setLoading(false))
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: load is stable — no captured state
  useEffect(() => {
    load()
  }, [])

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
        r.locationName.toLowerCase().includes(q) ||
        r.locationCode.toLowerCase().includes(q) ||
        r.officerFirstName.toLowerCase().includes(q) ||
        r.officerLastName.toLowerCase().includes(q)
    )
  }
  if (sortKey && sortDir) {
    displayed = [...displayed].sort((a, b) => compare(a, b, sortKey, sortDir))
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await deleteIncident(deleteTarget.id)
      toast.success('Incident record deleted.')
      setDeleteTarget(null)
      load()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Delete failed')
      setDeleteTarget(null)
    } finally {
      setDeleting(false)
    }
  }

  const COLUMNS: Column<IncidentListItem>[] = [
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
      key: 'incidentDatetime',
      label: 'Date & Time',
      width: '160px',
      sortable: true,
      render: (val) => (
        <span className="cell-muted">
          {new Date(val as string).toLocaleString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      ),
    },
    {
      key: 'officerFirstName',
      label: 'Reporting Officer',
      render: (_, row) => (
        <span>
          {row.officerFirstName} {row.officerLastName}
        </span>
      ),
    },
    {
      key: 'involvedCount',
      label: 'Involved',
      width: '90px',
      sortable: true,
      render: (val) => (
        <Badge variant={Number(val) > 0 ? 'warning' : 'neutral'}>{String(val)}</Badge>
      ),
    },
    {
      key: 'description',
      label: 'Description',
      render: (val) => <span className="cell-muted">{val ? String(val) : <em>—</em>}</span>,
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
            onClick={() => navigate(`/incident/${row.id}`)}
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
        <h1 className="page-header__title">Prisoner Incidents</h1>
        <p className="page-header__subtitle">Manage prisoner incident records.</p>
      </div>

      {error && <p className="page-error">{error}</p>}

      <Card padding="flush">
        <div className="page-toolbar">
          <div className="page-toolbar__search">
            <Input
              prefix={<MagnifyingGlassIcon width={15} height={15} />}
              placeholder="Search by location or officer…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="page-toolbar__actions">
            <Button onClick={() => navigate('/incident/new')} size="sm">
              + New Incident
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
          emptyMessage="No incident records match the current filter."
          sortKey={sortKey || undefined}
          sortDirection={sortDir}
          onSort={handleSort}
        />
      </Card>

      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Incident Record"
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
          Delete incident record{' '}
          <strong className="delete-confirm-text__emphasis">#{deleteTarget?.id}</strong> at{' '}
          <strong className="delete-confirm-text__emphasis">{deleteTarget?.locationName}</strong>?
          This also removes all involved prisoner records.
        </p>
      </Modal>
    </>
  )
}
