import { Pencil1Icon, PlusIcon, TrashIcon } from '@radix-ui/react-icons'
import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { deleteTreatment, getTreatments } from '../../api/treatment.api'
import { Button, Card, type Column, Modal, PageLoader, Table } from '../../components/ui'
import { useToast } from '../../context/ToastContext'
import type { TreatmentListItem } from '../../types/dto/treatment.dto'

export default function TreatmentList() {
  const [rows, setRows] = useState<TreatmentListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [recordToDelete, setRecordToDelete] = useState<number | null>(null)
  const navigate = useNavigate()
  const toast = useToast()

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const data = await getTreatments()
      setRows(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load treatment records')
    } finally {
      setLoading(false)
    }
  }, [])

  const confirmDelete = async () => {
    if (recordToDelete === null) return

    try {
      await deleteTreatment(recordToDelete)
      toast.success('Treatment record deleted successfully.')
      setDeleteModalOpen(false)
      setRecordToDelete(null)
      void loadData()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete treatment record')
    }
  }

  useEffect(() => {
    void loadData()
  }, [loadData])

  const COLUMNS: Column<TreatmentListItem>[] = [
    { key: 'id', label: '#', width: '60px' },
    {
      key: 'prisonerFirstName',
      label: 'Prisoner',
      render: (_value, row) => (
        <div>
          <div>{`${row.prisonerFirstName} ${row.prisonerLastName}`}</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
            {row.prisonerCode}
          </div>
        </div>
      ),
    },
    {
      key: 'nurseFirstName',
      label: 'Nurse',
      render: (_value, row) => (
        <div>
          <div>{`${row.nurseFirstName} ${row.nurseLastName}`}</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
            {row.nurseCode}
          </div>
        </div>
      ),
    },
    {
      key: 'diagnoseDate',
      label: 'Diagnose Date',
      width: '140px',
      render: (value) => {
        if (typeof value !== 'string') return ''
        return value.slice(0, 10)
      },
    },
    { key: 'description', label: 'Description' },
    {
      key: 'actions',
      label: '',
      width: '120px',
      render: (_value, row) => (
        <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end' }}>
          <Button
            size="sm"
            variant="ghost"
            iconOnly
            onClick={() => navigate(`/treatment/${row.id}`)}
          >
            <Pencil1Icon width={14} height={14} />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            iconOnly
            style={{ color: 'var(--color-danger)' }}
            onClick={() => {
              setRecordToDelete(row.id)
              setDeleteModalOpen(true)
            }}
          >
            <TrashIcon width={14} height={14} />
          </Button>
        </div>
      ),
    },
  ]

  if (loading && rows.length === 0) return <PageLoader />

  return (
    <>
      <div
        className="page-header"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: '1rem',
          alignItems: 'flex-start',
        }}
      >
        <div>
          <h1 className="page-header__title">Treatment Records</h1>
          <p className="page-header__subtitle">
            Manage prisoner treatment records and quickly open the treatment form to edit or create
            entries.
          </p>
        </div>
        <Button variant="primary" onClick={() => navigate('/treatment/new')}>
          <PlusIcon width={14} height={14} style={{ marginRight: '0.5rem' }} />
          New Treatment
        </Button>
      </div>

      {error && <div className="form-error-banner">{error}</div>}

      <Card padding="flush">
        <Table
          columns={COLUMNS}
          data={rows}
          rowKey="id"
          loading={loading}
          emptyMessage="No treatment records found."
        />
      </Card>

      <Modal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false)
          setRecordToDelete(null)
        }}
        title="Delete Treatment"
      >
        <div style={{ marginBottom: '1rem' }}>
          Are you sure you want to delete this treatment record? This action cannot be undone.
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
          <Button variant="secondary" onClick={() => setDeleteModalOpen(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDelete}>
            Delete
          </Button>
        </div>
      </Modal>
    </>
  )
}
