import { ArrowLeftIcon } from '@radix-ui/react-icons'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import {
  createMaintainance,
  getMaintainanceById,
  updateMaintainance,
} from '../../api/maintainance.api'
import { getMaintainerOptions } from '../../api/maintainer.api'
import { getPrisonLocations } from '../../api/prison-location.api'
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
import type { MaintStatus } from '../../types/dto/maintainance.dto'
import { MAINT_STATUSES } from '../../types/dto/maintainance.dto'
import type { PrisonLocation } from '../../types/dto/prison-location.dto'
import type { LaborItemDraft } from './LineItems'
import LineItems from './LineItems'
import './MaintenanceForm.css'

/* ── LOV column config ───────────────────────────────────────── */

const LOCATION_COLUMNS: LovColumn<PrisonLocation>[] = [
  { key: 'code', label: 'Code', width: '80px' },
  { key: 'name', label: 'Name' },
  { key: 'purpose', label: 'Purpose' },
  { key: 'maxCapacity', label: 'Capacity', width: '90px' },
]

/* ── Component ───────────────────────────────────────────────── */

export default function MaintenanceForm() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const toast = useToast()
  const isEdit = id !== undefined

  const [locations, setLocations] = useState<PrisonLocation[]>([])
  const [allMaintainers, setAllMaintainers] = useState<
    Parameters<typeof LineItems>[0]['allMaintainers']
  >([])

  const [prisonLocationId, setPrisonLocationId] = useState<number>(0)
  const [maintainanceDate, setMaintainanceDate] = useState('')
  const [maintainanceCost, setMaintainanceCost] = useState('')
  const [status, setStatus] = useState<MaintStatus>('Scheduled')
  const [laborItems, setLaborItems] = useState<LaborItemDraft[]>([])

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load reference data and (if editing) the existing record together
  useEffect(() => {
    setLoading(true)
    setError(null)

    const refData = Promise.all([getPrisonLocations(), getMaintainerOptions()])
    const detailData = isEdit ? getMaintainanceById(Number(id)) : Promise.resolve(null)

    Promise.all([refData, detailData])
      .then(([[locs, maints], detail]) => {
        setLocations(locs)
        setAllMaintainers(maints)

        if (detail) {
          setPrisonLocationId(detail.prisonLocationId)
          setMaintainanceDate(detail.maintainanceDate.slice(0, 10))
          setMaintainanceCost(String(detail.maintainanceCost))
          setStatus(detail.status)
          setLaborItems(
            detail.laborItems.map((li) => ({
              maintainerId: li.maintainerId,
              laborTask: li.laborTask,
              maintainerFirstName: li.maintainerFirstName,
              maintainerLastName: li.maintainerLastName,
              maintenanceSkill: li.maintenanceSkill,
              skillDescription: li.skillDescription,
              companyName: li.companyName,
              specialization: li.specialization,
            }))
          )
        }
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load data'))
      .finally(() => setLoading(false))
  }, [id, isEdit])

  /* ── Labor item handlers ── */

  const handleAddItem = (item: LaborItemDraft) => {
    if (laborItems.some((li) => li.maintainerId === item.maintainerId)) {
      setError('This maintainer is already assigned.')
      return
    }
    setLaborItems((prev) => [...prev, item])
    setError(null)
  }

  const handleUpdateItem = (index: number, item: LaborItemDraft) => {
    setLaborItems((prev) => prev.map((li, i) => (i === index ? item : li)))
  }

  const handleRemoveItem = (index: number) => {
    setLaborItems((prev) => prev.filter((_, i) => i !== index))
  }

  /* ── Location LOV display ── */

  const selectedLocation = locations.find((l) => l.id === prisonLocationId)
  const locationDisplay = selectedLocation
    ? `[${selectedLocation.code}] ${selectedLocation.name}`
    : ''

  /* ── Submit ── */

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    if (!prisonLocationId) {
      setError('Please select a location.')
      return
    }
    if (!maintainanceDate) {
      setError('Please pick a date.')
      return
    }
    if (
      !maintainanceCost ||
      Number.isNaN(Number(maintainanceCost)) ||
      Number(maintainanceCost) <= 0
    ) {
      setError('Cost must be a positive number.')
      return
    }
    if (laborItems.length === 0) {
      setError('Add at least one labor assignment.')
      return
    }

    const dto = {
      prisonLocationId,
      maintainanceDate,
      maintainanceCost: Number(maintainanceCost),
      status,
      laborItems: laborItems.map(({ maintainerId, laborTask }) => ({ maintainerId, laborTask })),
    }

    setSubmitting(true)
    try {
      if (isEdit) {
        await updateMaintainance(Number(id), dto)
        toast.success('Maintenance record updated successfully.')
      } else {
        await createMaintainance(dto)
        toast.success('Maintenance record created successfully.')
      }
      navigate('/maintenance')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSubmitting(false)
    }
  }

  /* ── Render ── */

  if (loading) return <PageLoader />

  return (
    <>
      <Link to="/maintenance" className="form-page-back">
        <ArrowLeftIcon width={14} height={14} /> Back to Maintenance
      </Link>

      <div className="page-header">
        <h1 className="page-header__title">{isEdit ? 'Edit Maintenance' : 'New Maintenance'}</h1>
        <p className="page-header__subtitle">
          {isEdit
            ? 'Update the maintenance record and its labor assignments.'
            : 'Create a new maintenance record and assign workers.'}
        </p>
      </div>

      {error && <div className="form-error-banner">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 'var(--space-5)' }}>
          <Card title="Maintenance Details">
            <div className="form-page__grid">
              <div className="field-id">
                <Label>ID</Label>
                <div className="field-id__value">{isEdit ? `#${id}` : 'Auto'}</div>
              </div>

              <FormGroup>
                <Label required>Status</Label>
                <Select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as MaintStatus)}
                  options={MAINT_STATUSES.map((s) => ({ value: s, label: s }))}
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
                <Label required>Maintenance Date</Label>
                <Input
                  type="date"
                  value={maintainanceDate}
                  onChange={(e) => setMaintainanceDate(e.target.value)}
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label required>Cost (฿)</Label>
                <Input
                  type="number"
                  min="1"
                  step="1"
                  placeholder="0"
                  value={maintainanceCost}
                  onChange={(e) => setMaintainanceCost(e.target.value)}
                  required
                />
              </FormGroup>
            </div>
          </Card>
        </div>

        <Card
          title={`Labor Assignments${laborItems.length ? ` (${laborItems.length})` : ''}`}
          padding="flush"
        >
          <LineItems
            items={laborItems}
            allMaintainers={allMaintainers}
            onAdd={handleAddItem}
            onUpdate={handleUpdateItem}
            onRemove={handleRemoveItem}
          />
        </Card>

        <div className="form-page__actions">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate('/maintenance')}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button type="submit" loading={submitting}>
            {isEdit ? 'Save Changes' : 'Create Maintenance'}
          </Button>
        </div>
      </form>
    </>
  )
}
