import { ArrowLeftIcon, PlusIcon } from '@radix-ui/react-icons'
import React, { useEffect, useState, useRef } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { visitmentApi, type VisitmentData } from '../../api/visitment.api'
import {
  Button,
  Card,
  FormGroup,
  Input,
  PageLoader,
  Select,
  LovButton,
  type LovColumn
} from '../../components/ui'
import { useToast } from '../../context/ToastContext'
import LineItems, { type LineItemsHandle, type VisitorDraft } from './LineItems'
import './VisitmentForm.css'

/* ── LOV column config ───────────────────────────────────────── */

const PRISONER_COLUMNS: LovColumn<any>[] = [
  { key: 'code', label: 'Code', width: '100px' },
  { key: 'firstName', label: 'First Name' },
  { key: 'lastName', label: 'Last Name' },
]

const STATUS_OPTIONS = [
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
]

/* ── Component ───────────────────────────────────────────────── */

export default function VisitmentForm() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const toast = useToast()
  const lineItemsRef = useRef<LineItemsHandle>(null)
  const isEdit = id !== undefined

  const [allPrisoners, setAllPrisoners] = useState<any[]>([])
  const [allPersons, setAllPersons] = useState<any[]>([])

  const [prisonerId, setPrisonerId] = useState<number>(0)
  const [prisonerCode, setPrisonerCode] = useState('')
  const [prisonerName, setPrisonerName] = useState('')
  const [visitmentDate, setVisitmentDate] = useState(new Date().toISOString().slice(0, 10))
  const [duration, setDuration] = useState('30')
  const [status, setStatus] = useState<'scheduled' | 'completed' | 'cancelled'>('scheduled')
  const [visitors, setVisitors] = useState<VisitorDraft[]>([])

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)

    const refs = Promise.all([visitmentApi.getAllPrisoners(), visitmentApi.getAllPersons()])
    const detail = isEdit ? visitmentApi.getById(Number(id)) : Promise.resolve(null)

    Promise.all([refs, detail])
      .then(([[ps, pe], data]) => {
        setAllPrisoners(ps)
        setAllPersons(pe)

        if (data) {
          setPrisonerId(data.prisonerId)
          setPrisonerCode(data.prisonerCode || '')
          setPrisonerName(data.prisonerName || '')
          setVisitmentDate(new Date(data.visitmentDate).toISOString().slice(0, 10))
          setDuration(String(data.duration))
          setStatus(data.status)
          setVisitors(data.visitors.map(v => ({
            personId: v.personId,
            relation: v.relation,
            firstName: v.firstName,
            lastName: v.lastName,
            gender: v.gender,
            identificationNo: v.identificationNo
          })))
        }
      })
      .catch(err => setError(err instanceof Error ? err.message : 'Failed to load data'))
      .finally(() => setLoading(false))
  }, [id, isEdit])

  /* ── Handlers ── */

  const handleAddVisitor = (item: VisitorDraft) => {
    setVisitors(prev => [...prev, item])
  }

  const handleUpdateVisitor = (index: number, item: VisitorDraft) => {
    setVisitors(prev => prev.map((v, i) => (i === index ? item : v)))
  }

  const handleRemoveVisitor = (index: number) => {
    setVisitors(prev => prev.filter((_, i) => i !== index))
  }

  const prisonerDisplay = prisonerCode ? `[${prisonerCode}] ${prisonerName}` : ''

  /* ── Submit ── */

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!prisonerId) return setError('Please select a prisoner.')
    if (visitors.length === 0) return setError('Add at least one visitor.')

    const payload: VisitmentData = {
      prisonerId,
      visitmentDate,
      duration: Number(duration),
      status,
      visitors: visitors.map(v => ({ personId: v.personId, relation: v.relation }))
    }

    setSubmitting(true)
    try {
      if (isEdit) {
        await visitmentApi.update(Number(id), payload)
        toast.success('Visitment record updated successfully.')
      } else {
        await visitmentApi.create(payload)
        toast.success('Visitment record created successfully.')
      }
      navigate('/visitation')
    } catch (err: any) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <PageLoader />

  return (
    <>
      <Link to="/visitation" className="form-page-back">
        <ArrowLeftIcon width={14} height={14} /> Back to Visitment List
      </Link>

      <div className="page-header">
        <h1 className="page-header__title">Visitment Form</h1>
        <p className="page-header__subtitle">
          {isEdit 
            ? 'Update the visitation record and visitor details.' 
            : 'Record a new prisoner visitation session.'}
        </p>
      </div>

      {error && <div className="form-error-banner">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-page__section">
          <Card title="Visitment Information">
            <div className="form-page__grid">
              <FormGroup label="Prisoner" required>
                <LovButton
                  displayValue={prisonerDisplay}
                  placeholder="Select prisoner…"
                  modalTitle="Prisoner Search"
                  columns={PRISONER_COLUMNS}
                  data={allPrisoners}
                  rowKey="id"
                  onSelect={(p) => {
                    setPrisonerId(p.id)
                    setPrisonerCode(p.code)
                    setPrisonerName(`${p.firstName} ${p.lastName}`)
                  }}
                />
              </FormGroup>

              <FormGroup label="Visit Date" required>
                <Input
                  type="date"
                  value={visitmentDate}
                  onChange={e => setVisitmentDate(e.target.value)}
                  required
                />
              </FormGroup>

              <FormGroup label="First Name">
                <Input
                  value={prisonerName.split(' ')[0] || ''}
                  readOnly
                  placeholder="Auto-filled"
                />
              </FormGroup>

              <FormGroup label="Last Name">
                <Input
                  value={prisonerName.split(' ').slice(1).join(' ') || ''}
                  readOnly
                  placeholder="Auto-filled"
                />
              </FormGroup>

              <FormGroup label="Duration (Minutes)" required>
                <Input
                  type="number"
                  min="1"
                  value={duration}
                  onChange={e => setDuration(e.target.value)}
                  required
                />
              </FormGroup>

              <FormGroup label="Status" required>
                <Select
                  value={status}
                  onChange={e => setStatus(e.target.value as any)}
                  options={STATUS_OPTIONS}
                />
              </FormGroup>
            </div>
          </Card>
        </div>

        <Card 
          title={`Visitor Details${visitors.length ? ` (${visitors.length})` : ''}`} 
          padding="flush"
          actions={
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => lineItemsRef.current?.startAdd()}
            >
              <PlusIcon style={{ marginRight: 'var(--space-2)' }} />
              Add Visitor
            </Button>
          }
        >
          <LineItems
            ref={lineItemsRef}
            items={visitors}
            allPersons={allPersons}
            onAdd={handleAddVisitor}
            onUpdate={handleUpdateVisitor}
            onRemove={handleRemoveVisitor}
          />
        </Card>

        <div className="form-page__actions">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate('/visitation')}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button type="submit" loading={submitting}>
            {isEdit ? 'Save Changes' : 'Create Visitment'}
          </Button>
        </div>
      </form>
    </>
  )
}
