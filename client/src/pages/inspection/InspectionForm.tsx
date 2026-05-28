import { ArrowLeftIcon } from '@radix-ui/react-icons'
import type { FormEvent } from 'react'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { createInspection, getInspectionById, updateInspection } from '../../api/inspection.api'
import { getIrregularities } from '../../api/irregularity.api'
import { getRoutineOptions } from '../../api/routine.api'
import type { LovColumn } from '../../components/ui'
import { Button, Card, FormGroup, Input, Label, LovButton, PageLoader } from '../../components/ui'
import { useToast } from '../../context/ToastContext'
import type { Irregularity } from '../../types/dto/irregularity.dto'
import type { RoutineOption } from '../../types/dto/routine.dto'
import type { InspectionLineItemDraft } from './InspectionLineItems'
import InspectionLineItems from './InspectionLineItems'

import '../maintenance/MaintenanceForm.css'

const ROUTINE_COLUMNS: LovColumn<RoutineOption>[] = [
  { key: 'id', label: 'ID', width: '60px' },
  { key: 'routineName', label: 'Routine Name' },
  { key: 'type', label: 'Type' },
  { key: 'locationName', label: 'Location' },
]

export default function InspectionForm() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const toast = useToast()
  const isEdit = id !== undefined

  const [routines, setRoutines] = useState<RoutineOption[]>([])
  const [irregularities, setIrregularities] = useState<Irregularity[]>([])

  const [code, setCode] = useState('')
  const [reason, setReason] = useState('')
  const [routineId, setRoutineId] = useState<number>(0)
  const [lineItems, setLineItems] = useState<InspectionLineItemDraft[]>([])

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)

    const refData = Promise.all([getRoutineOptions(), getIrregularities()])
    const detailData = isEdit ? getInspectionById(Number(id)) : Promise.resolve(null)

    Promise.all([refData, detailData])
      .then(([[routinesData, irregularitiesData], detail]) => {
        setRoutines(routinesData)
        setIrregularities(irregularitiesData)

        if (detail) {
          setCode(detail.code)
          setReason(detail.reason)
          setRoutineId(detail.routineId)
          setLineItems(
            detail.results.map((r) => ({
              foundIrregularityId: r.foundIrregularityId,
              irregularityType: r.irregularityType,
              severity: r.severity,
              irregularityDescription: r.irregularityDescription,
              resultDescription: r.resultDescription,
            }))
          )
        }
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load form data'))
      .finally(() => setLoading(false))
  }, [id, isEdit])

  const selectedRoutine = routines.find((r) => r.id === routineId)
  const routineDisplay = selectedRoutine ? selectedRoutine.routineName : ''

  const handleAddItem = (item: InspectionLineItemDraft) => {
    if (lineItems.some((li) => li.foundIrregularityId === item.foundIrregularityId)) {
      setError('This finding is already logged.')
      return
    }
    setLineItems((prev) => [...prev, item])
    setError(null)
  }

  const handleUpdateItem = (index: number, item: InspectionLineItemDraft) => {
    setLineItems((prev) => prev.map((li, i) => (i === index ? item : li)))
  }

  const handleRemoveItem = (index: number) => {
    setLineItems((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    if (!code) return setError('Please enter an Inspection Code.')
    if (!routineId) return setError('Please select a Routine.')
    if (!reason) return setError('Please enter an Inspection Reason.')

    const dto = {
      code,
      reason,
      routineId,
      results: lineItems.map((li) => ({
        foundIrregularityId: li.foundIrregularityId,
        resultDescription: li.resultDescription,
      })),
    }

    setSubmitting(true)
    try {
      if (isEdit) {
        await updateInspection(Number(id), dto)
        toast.success('Inspection updated successfully.')
      } else {
        await createInspection(dto)
        toast.success('Inspection created successfully.')
      }
      navigate('/inspections')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <PageLoader />

  return (
    <>
      <Link to="/inspections" className="form-page-back">
        <ArrowLeftIcon width={14} height={14} /> Back to Inspections
      </Link>

      <div className="page-header">
        <h1 className="page-header__title">{isEdit ? 'Edit Inspection' : 'New Inspection'}</h1>
        <p className="page-header__subtitle">
          Record inspection details and specific irregularity findings.
        </p>
      </div>

      {error && <div className="form-error-banner">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-page__section">
          <Card title="Inspection Details">
            <div className="form-page__grid">
              <FormGroup>
                <Label required>Inspection Code</Label>
                <Input
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="e.g. INS-001"
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label required>Routine Schedule</Label>
                <LovButton<RoutineOption>
                  displayValue={routineDisplay}
                  placeholder="Select routine…"
                  modalTitle="Select Routine Schedule"
                  columns={ROUTINE_COLUMNS}
                  data={routines}
                  rowKey="id"
                  onSelect={(r) => setRoutineId(r.id)}
                />
              </FormGroup>

              <div style={{ gridColumn: 'span 2' }}>
                <FormGroup>
                  <Label required>Reason for Inspection</Label>
                  <Input
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="e.g. Routine quarterly cell sweep"
                    required
                  />
                </FormGroup>
              </div>
            </div>
          </Card>
        </div>

        <Card
          title={`Irregularity Findings${lineItems.length ? ` (${lineItems.length})` : ''}`}
          padding="flush"
        >
          <InspectionLineItems
            items={lineItems}
            allIrregularities={irregularities}
            onAdd={handleAddItem}
            onUpdate={handleUpdateItem}
            onRemove={handleRemoveItem}
          />
        </Card>

        <div className="form-page__actions">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate('/inspections')}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button type="submit" loading={submitting}>
            {isEdit ? 'Save Changes' : 'Submit Inspection'}
          </Button>
        </div>
      </form>
    </>
  )
}
