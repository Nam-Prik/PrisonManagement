import { ArrowLeftIcon } from '@radix-ui/react-icons'
import type { FormEvent } from 'react'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { getIrregularities } from '../../api/irregularity.api'
import { getOfficerOptions } from '../../api/officer.api'
import { getPrisonLocations } from '../../api/prison-location.api'
import { createRoutine, getRoutineById, updateRoutine } from '../../api/routine.api'
import type { LovColumn } from '../../components/ui'
import {
  Button,
  Card,
  FormGroup,
  Input,
  Label,
  LovButton,
  PageLoader,
  Select,
} from '../../components/ui'
import { useToast } from '../../context/ToastContext'
import type { Irregularity } from '../../types/dto/irregularity.dto'
import type { OfficerOption } from '../../types/dto/officer.dto'
import type { PrisonLocation } from '../../types/dto/prison-location.dto'
import type { CreateRoutineDto, RoutineOfficer, RoutineType } from '../../types/dto/routine.dto'
import { ROUTINE_TYPES } from '../../types/dto/routine.dto'
import AssignedOfficers from './AssignedOfficers'
import type { InspectionLineItemDraft } from './InspectionLineItems'
import InspectionLineItems from './InspectionLineItems'

import '../maintenance/MaintenanceForm.css'

const LOCATION_COLUMNS: LovColumn<PrisonLocation>[] = [
  { key: 'code', label: 'Code', width: '80px' },
  { key: 'name', label: 'Name' },
  { key: 'purpose', label: 'Purpose' },
]

const TYPE_OPTIONS = ROUTINE_TYPES.map((t) => ({ value: t, label: t }))

export default function RoutineForm() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const toast = useToast()
  const isEdit = id !== undefined

  // Reference Data
  const [locations, setLocations] = useState<PrisonLocation[]>([])
  const [officers, setOfficers] = useState<OfficerOption[]>([])
  const [irregularities, setIrregularities] = useState<Irregularity[]>([])

  // Routine Form State
  const [routineName, setRoutineName] = useState('')
  const [type, setType] = useState<string>('')
  const [scheduleDate, setScheduleDate] = useState('')
  const [locationId, setLocationId] = useState<number>(0)
  const [assignedOfficers, setAssignedOfficers] = useState<RoutineOfficer[]>([])

  // Inspection Form State (Only used if type === 'Inspection')
  const [inspectionReason, setInspectionReason] = useState('')
  const [lineItems, setLineItems] = useState<InspectionLineItemDraft[]>([])

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)

    // Fetch all 3 dropdown dependencies at once
    const refData = Promise.all([getPrisonLocations(), getOfficerOptions(), getIrregularities()])
    const detailData = isEdit ? getRoutineById(Number(id)) : Promise.resolve(null)

    Promise.all([refData, detailData])
      .then(([[locationsData, officersData, irregularitiesData], detail]) => {
        setLocations(locationsData)
        setOfficers(officersData)
        setIrregularities(irregularitiesData)

        if (detail) {
          setRoutineName(detail.routineName)
          setType(detail.type)
          setScheduleDate(detail.scheduleDate)
          setLocationId(detail.prisonLocationId)
          setAssignedOfficers(detail.officers)

          if (detail.inspection) {
            setInspectionReason(detail.inspection.reason)
            setLineItems(
              detail.inspection.results.map((r) => ({
                foundIrregularityId: r.foundIrregularityId,
                irregularityType: r.irregularityType,
                severity: r.severity,
                irregularityDescription: '', // Backend doesn't return base desc in detail view
                resultDescription: r.resultDescription,
              }))
            )
          }
        }
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load form data'))
      .finally(() => setLoading(false))
  }, [id, isEdit])

  const selectedLocation = locations.find((l) => l.id === locationId)
  const locationDisplay = selectedLocation
    ? `[${selectedLocation.code}] ${selectedLocation.name}`
    : ''

  // Officer Handlers
  const handleAddOfficer = (officer: RoutineOfficer) =>
    setAssignedOfficers((prev) => [...prev, officer])
  const handleRemoveOfficer = (index: number) =>
    setAssignedOfficers((prev) => prev.filter((_, i) => i !== index))

  // Inspection Line Item Handlers
  const handleAddIrregularity = (item: InspectionLineItemDraft) => {
    if (lineItems.some((li) => li.foundIrregularityId === item.foundIrregularityId)) {
      setError('This finding is already logged.')
      return
    }
    setLineItems((prev) => [...prev, item])
    setError(null)
  }
  const handleUpdateIrregularity = (index: number, item: InspectionLineItemDraft) => {
    setLineItems((prev) => prev.map((li, i) => (i === index ? item : li)))
  }
  const handleRemoveIrregularity = (index: number) => {
    setLineItems((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    if (!routineName) return setError('Please enter a Routine Name.')
    if (!type) return setError('Please select a Routine Type.')
    if (!locationId) return setError('Please select a Location.')
    if (!scheduleDate) return setError('Please select a Schedule Date.')

    if (type === 'Inspection' && !inspectionReason) {
      return setError('Please enter a reason for the inspection.')
    }

    const dto: CreateRoutineDto = {
      routineName,
      type: type as RoutineType,
      prisonLocationId: locationId,
      routinesScheduleDate: scheduleDate,
      officerIds: assignedOfficers.map((o) => o.officerId),
    }

    if (type === 'Inspection') {
      dto.inspectionReason = inspectionReason
      dto.inspectionResults = lineItems.map((li) => ({
        foundIrregularityId: li.foundIrregularityId,
        resultDescription: li.resultDescription,
      }))
    }

    setSubmitting(true)
    try {
      if (isEdit) {
        await updateRoutine(Number(id), dto)
        toast.success('Routine updated successfully.')
      } else {
        await createRoutine(dto)
        toast.success('Routine scheduled successfully.')
      }
      navigate('/routines')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <PageLoader />

  return (
    <>
      <Link to="/routines" className="form-page-back">
        <ArrowLeftIcon width={14} height={14} /> Back to Routines
      </Link>

      <div className="page-header">
        <h1 className="page-header__title">{isEdit ? 'Edit Schedule' : 'Schedule Routine'}</h1>
        <p className="page-header__subtitle">Manage schedule details and assign active officers.</p>
      </div>

      {error && <div className="form-error-banner">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-page__section">
          <Card title="Routine Details">
            <div className="form-page__grid">
              <FormGroup>
                <Label required>Routine Name</Label>
                <Input
                  value={routineName}
                  onChange={(e) => setRoutineName(e.target.value)}
                  placeholder="e.g. Night Shift Patrol B"
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label required>Routine Type</Label>
                <Select
                  placeholder="Select Type..."
                  options={TYPE_OPTIONS}
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label required>Prison Location</Label>
                <LovButton<PrisonLocation>
                  displayValue={locationDisplay}
                  placeholder="Select location…"
                  modalTitle="Select Deployment Location"
                  columns={LOCATION_COLUMNS}
                  data={locations}
                  rowKey="id"
                  onSelect={(l) => setLocationId(l.id)}
                />
              </FormGroup>

              <FormGroup>
                <Label required>Schedule Date</Label>
                <Input
                  type="date"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  required
                />
              </FormGroup>

              {type === 'Inspection' && (
                <div style={{ gridColumn: 'span 2' }}>
                  <FormGroup>
                    <Label required>Reason for Inspection</Label>
                    <Input
                      value={inspectionReason}
                      onChange={(e) => setInspectionReason(e.target.value)}
                      placeholder="e.g. Routine quarterly cell sweep"
                      required={type === 'Inspection'}
                    />
                  </FormGroup>
                </div>
              )}
            </div>
          </Card>
        </div>

        <Card
          title={`Assigned Officers${assignedOfficers.length ? ` (${assignedOfficers.length})` : ''}`}
          padding="flush"
        >
          <AssignedOfficers
            items={assignedOfficers}
            allOfficers={officers}
            onAdd={handleAddOfficer}
            onRemove={handleRemoveOfficer}
          />
        </Card>

        {type === 'Inspection' && (
          <Card
            title={`Irregularity Findings${lineItems.length ? ` (${lineItems.length})` : ''}`}
            padding="flush"
          >
            <InspectionLineItems
              items={lineItems}
              allIrregularities={irregularities}
              onAdd={handleAddIrregularity}
              onUpdate={handleUpdateIrregularity}
              onRemove={handleRemoveIrregularity}
            />
          </Card>
        )}

        <div className="form-page__actions">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate('/routines')}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button type="submit" loading={submitting}>
            {isEdit ? 'Save Changes' : 'Save Schedule'}
          </Button>
        </div>
      </form>
    </>
  )
}
