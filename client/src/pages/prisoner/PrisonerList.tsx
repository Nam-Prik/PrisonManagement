import { MagnifyingGlassIcon, Pencil1Icon, TrashIcon } from '@radix-ui/react-icons'
import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { deletePrisoner, getPrisonerOptions } from '../../api/prisoner.api'
import type { Column } from '../../components/ui'
import { Button, Card, Input, Modal, PageLoader, Table } from '../../components/ui'
import { useToast } from '../../context/ToastContext'
import type { PrisonerOption } from '../../types/dto/prisoner.dto'

export default function PrisonerList() {
  const navigate = useNavigate()
  const toast = useToast()
  const [rows, setRows] = useState<PrisonerOption[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<PrisonerOption | null>(null)
  const [deleting, setDeleting] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getPrisonerOptions()
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

  const displayed = search.trim()
    ? rows.filter((r) => {
        const q = search.toLowerCase()
        return (
          r.firstName.toLowerCase().includes(q) ||
          r.lastName.toLowerCase().includes(q) ||
          r.code.toLowerCase().includes(q)
        )
      })
    : rows

  const confirmDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await deletePrisoner(deleteTarget.id)
      toast.success('Prisoner deleted.')
      setDeleteTarget(null)
      load()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Delete failed')
      setDeleteTarget(null)
    } finally {
      setDeleting(false)
    }
  }

  const COLUMNS: Column<PrisonerOption>[] = [
    { key: 'id', label: '#', width: '56px' },
    { key: 'code', label: 'Code', width: '100px' },
    {
      key: 'firstName',
      label: 'Name',
      render: (_, row) => (
        <span>
          {row.firstName} {row.lastName}
        </span>
      ),
    },
    {
      key: 'evaluationScore',
      label: 'Eval. Score',
      width: '110px',
      render: (v) => <span>{v != null ? String(v) : '—'}</span>,
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
            onClick={() => navigate(`/prisoner/${row.id}`)}
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
        <h1 className="page-header__title">Prisoners</h1>
        <p className="page-header__subtitle">Manage prisoner records.</p>
      </div>
      <Card padding="flush">
        <div className="page-toolbar">
          <div className="page-toolbar__search">
            <Input
              prefix={<MagnifyingGlassIcon width={15} height={15} />}
              placeholder="Search by name or code…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="page-toolbar__actions">
            <Button onClick={() => navigate('/prisoner/new')} size="sm">
              + New Prisoner
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
          emptyMessage="No prisoners found."
        />
      </Card>
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Prisoner"
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
          Delete prisoner{' '}
          <strong>
            {deleteTarget?.firstName} {deleteTarget?.lastName}
          </strong>{' '}
          ({deleteTarget?.code})?
        </p>
      </Modal>
    </>
  )
}
