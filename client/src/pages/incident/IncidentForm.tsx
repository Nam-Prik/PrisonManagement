import { ArrowLeftIcon } from '@radix-ui/react-icons'
import type { FormEvent } from 'react'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { createIncident, getIncidentById, updateIncident } from '../../api/incident.api'
import { getOfficerOptions } from '../../api/officer.api'
import { getPrisonLocations } from '../../api/prison-location.api'
import { getPrisonerOptions } from '../../api/prisoner.api'
import type { LovColumn } from '../../components/ui'
import {
  Button,
  Card,
  FormGroup,
  Input,
  Label,
  LovButton,
  PageLoader,
  Textarea,
} from '../../components/ui'
import { useToast } from '../../context/ToastContext'
import type { InvolvedPrisonerItem } from '../../types/dto/incident.dto'
import type { OfficerOption } from '../../types/dto/officer.dto'
import type { PrisonLocation } from '../../types/dto/prison-location.dto'
import type { PrisonerOption } from '../../types/dto/prisoner.dto'
import InvolvedPrisoners from './InvolvedPrisoners'
import './IncidentForm.css'

const LOCATION_COLUMNS: LovColumn<PrisonLocation>[] = [
  { key: 'code', label: 'Code', width: '80px' },
  { key: 'name', label: 'Name' },
  { key: 'purpose', label: 'Purpose' },
]

const OFFICER_COLUMNS: LovColumn<OfficerOption>[] = [
  { key: 'code', label: 'Code', width: '70px' },
  { key: 'rank', label: 'Rank', width: '140px' },
  { key: 'firstName', label: 'First Name' },
  { key: 'lastName', label: 'Last Name' },
]

export default function IncidentForm() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const toast = useToast()
  const isEdit = id !== undefined

  const [locations, setLocations] = useState<PrisonLocation[]>([])
  const [officers, setOfficers] = useState<OfficerOption[]>([])
  const [allPrisoners, setAllPrisoners] = useState<PrisonerOption[]>([])

  const [prisonLocationId, setPrisonLocationId] = useState<number>(0)
  const [reportingOfficerId, setReportingOfficerId] = useState<number>(0)
  const [incidentDatetime, setIncidentDatetime] = useState('')
  const [description, setDescription] = useState('')
  const [involvedPrisoners, setInvolvedPrisoners] = useState<InvolvedPrisonerItem[]>([])

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)

    const refData = Promise.all([getPrisonLocations(), getOfficerOptions(), getPrisonerOptions()])
    const detailData = isEdit ? getIncidentById(Number(id)) : Promise.resolve(null)

    Promise.all([refData, detailData])
      .then(([[locs, offs, pris], detail]) => {
        setLocations(locs)
        setOfficers(offs)
        setAllPrisoners(pris)

        if (detail) {
          setPrisonLocationId(detail.prisonLocationId)
          setReportingOfficerId(detail.reportingOfficerId)
          setIncidentDatetime(detail.incidentDatetime.slice(0, 16))
          setDescription(detail.description ?? '')
          setInvolvedPrisoners(detail.involvedPrisoners)
        }
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load data'))
      .finally(() => setLoading(false))
  }, [id, isEdit])

  const selectedLocation = locations.find((l) => l.id === prisonLocationId)
  const locationDisplay = selectedLocation
    ? `[${selectedLocation.code}] ${selectedLocation.name}`
    : ''

  const selectedOfficer = officers.find((o) => o.id === reportingOfficerId)
  const officerDisplay = selectedOfficer
    ? `[${selectedOfficer.code}] ${selectedOfficer.firstName} ${selectedOfficer.lastName}`
    : ''

  const handleAddPrisoner = (item: InvolvedPrisonerItem) => {
    if (involvedPrisoners.some((p) => p.prisonerId === item.prisonerId)) return
    setInvolvedPrisoners((prev) => [...prev, item])
  }

  const handleRemovePrisoner = (index: number) => {
    setInvolvedPrisoners((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    if (!prisonLocationId) {
      setError('Please select a location.')
      return
    }
    if (!reportingOfficerId) {
      setError('Please select a reporting officer.')
      return
    }
    if (!incidentDatetime) {
      setError('Please set the incident date and time.')
      return
    }

    const dto = {
      incidentDatetime,
      description: description.trim() || undefined,
      prisonLocationId,
      reportingOfficerId,
      involvedPrisonerIds: involvedPrisoners.map((p) => p.prisonerId),
    }

    setSubmitting(true)
    try {
      if (isEdit) {
        await updateIncident(Number(id), dto)
        toast.success('Incident record updated successfully.')
      } else {
        await createIncident(dto)
        toast.success('Incident record created successfully.')
      }
      navigate('/incident')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <PageLoader />

  return (
    <>
      <Link to="/incident" className="form-page-back">
        <ArrowLeftIcon width={14} height={14} /> Back to Incidents
      </Link>

      <div className="page-header">
        <h1 className="page-header__title">{isEdit ? 'Edit Incident' : 'New Incident'}</h1>
        <p className="page-header__subtitle">
          {isEdit
            ? 'Update the incident record and involved prisoners.'
            : 'Record a new prisoner incident.'}
        </p>
      </div>

      {error && <div className="form-error-banner">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-page__section">
          <Card title="Incident Details">
            <div className="form-page__grid">
              <div className="field-id">
                <Label>ID</Label>
                <div className="field-id__value">{isEdit ? `#${id}` : 'Auto'}</div>
              </div>

              <FormGroup>
                <Label required>Date &amp; Time</Label>
                <Input
                  type="datetime-local"
                  value={incidentDatetime}
                  onChange={(e) => setIncidentDatetime(e.target.value)}
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label required>Location</Label>
                <LovButton<PrisonLocation>
                  displayValue={locationDisplay}
                  placeholder="Select location…"
                  modalTitle="Prison Location"
                  columns={LOCATION_COLUMNS}
                  data={locations}
                  rowKey="id"
                  onSelect={(loc) => setPrisonLocationId(loc.id)}
                />
              </FormGroup>

              <FormGroup>
                <Label required>Reporting Officer</Label>
                <LovButton<OfficerOption>
                  displayValue={officerDisplay}
                  placeholder="Select officer…"
                  modalTitle="Reporting Officer"
                  columns={OFFICER_COLUMNS}
                  data={officers}
                  rowKey="id"
                  onSelect={(o) => setReportingOfficerId(o.id)}
                />
              </FormGroup>

              <div style={{ gridColumn: '1 / -1' }}>
                <FormGroup>
                  <Label>Description</Label>
                  <Textarea
                    placeholder="Brief description of the incident…"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                  />
                </FormGroup>
              </div>
            </div>
          </Card>
        </div>

        <Card
          title={`Involved Prisoners${involvedPrisoners.length ? ` (${involvedPrisoners.length})` : ''}`}
          padding="flush"
        >
          <InvolvedPrisoners
            items={involvedPrisoners}
            allPrisoners={allPrisoners}
            onAdd={handleAddPrisoner}
            onRemove={handleRemovePrisoner}
          />
        </Card>

        <div className="form-page__actions">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate('/incident')}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button type="submit" loading={submitting}>
            {isEdit ? 'Save Changes' : 'Create Incident'}
          </Button>
        </div>
      </form>
    </>
  )
}
