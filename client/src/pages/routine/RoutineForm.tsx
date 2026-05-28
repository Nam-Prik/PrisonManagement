import { ArrowLeftIcon } from '@radix-ui/react-icons'
import type { FormEvent } from 'react'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
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
import type { OfficerOption } from '../../types/dto/officer.dto'
import type { PrisonLocation } from '../../types/dto/prison-location.dto'
import type { RoutineOfficer, RoutineType } from '../../types/dto/routine.dto'
import { ROUTINE_TYPES } from '../../types/dto/routine.dto'
import AssignedOfficers from './AssignedOfficers'

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

  const [locations, setLocations] = useState<PrisonLocation[]>([])
  const [officers, setOfficers] = useState<OfficerOption[]>([])

  const [routineName, setRoutineName] = useState('')
  const [type, setType] = useState<string>('')
  const [scheduleDate, setScheduleDate] = useState('')
  const [locationId, setLocationId] = useState<number>(0)
  const [assignedOfficers, setAssignedOfficers] = useState<RoutineOfficer[]>([])

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)

    const refData = Promise.all([getPrisonLocations(), getOfficerOptions()])
    const detailData = isEdit ? getRoutineById(Number(id)) : Promise.resolve(null)

    Promise.all([refData, detailData])
      .then(([[locationsData, officersData], detail]) => {
        setLocations(locationsData)
        setOfficers(officersData)

        if (detail) {
          setRoutineName(detail.routineName)
          setType(detail.type)
          setScheduleDate(detail.scheduleDate)
          setLocationId(detail.prisonLocationId)
          setAssignedOfficers(detail.officers)
        }
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load form data'))
      .finally(() => setLoading(false))
  }, [id, isEdit])

  const selectedLocation = locations.find((l) => l.id === locationId)
  const locationDisplay = selectedLocation
    ? `[${selectedLocation.code}] ${selectedLocation.name}`
    : ''

  const handleAddOfficer = (officer: RoutineOfficer) => {
    setAssignedOfficers((prev) => [...prev, officer])
  }

  const handleRemoveOfficer = (index: number) => {
    setAssignedOfficers((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    if (!routineName) return setError('Please enter a Routine Name.')
    if (!type) return setError('Please select a Routine Type.')
    if (!locationId) return setError('Please select a Location.')
    if (!scheduleDate) return setError('Please select a Schedule Date.')

    const dto = {
      routineName,
      type: type as RoutineType,
      prisonLocationId: locationId,
      routinesScheduleDate: scheduleDate,
      officerIds: assignedOfficers.map((o) => o.officerId),
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
        <h1 className="page-header__title">{isEdit ? 'Edit Routine' : 'Schedule Routine'}</h1>
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
            {isEdit ? 'Save Changes' : 'Schedule Routine'}
          </Button>
        </div>
      </form>
    </>
  )
}
