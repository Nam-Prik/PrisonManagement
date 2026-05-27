import { ArrowLeftIcon } from '@radix-ui/react-icons'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { getPrisonerIntakeById, updatePrisonerIntake } from '../../api/prisonerintake.api'
import {
  Button,
  Card,
  FormGroup,
  Input,
  Label,
  Modal,
  PageLoader,
  Select,
} from '../../components/ui'
import { useToast } from '../../context/ToastContext'
import { HEALTH_STATUSES } from '../../types/dto/prisonerintake.dto'
import '../maintenance/MaintenanceForm.css'
import type { ConfiscatedItemDraft } from './ConfiscatedItemsLineItems'
import ConfiscatedItemsLineItems from './ConfiscatedItemsLineItems'
import './PrisonerIntakeForm.css'

const HEALTH_STATUS_OPTIONS = HEALTH_STATUSES.map((s) => ({ value: s, label: s }))

export default function PrisonerIntakeEdit() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const toast = useToast()

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const [prisonerCode, setPrisonerCode] = useState('')
  const [prisonerName, setPrisonerName] = useState('')

  const [intakeDate, setIntakeDate] = useState('')
  const [initialHealthStatus, setInitialHealthStatus] = useState('')
  const [confiscatedItems, setConfiscatedItems] = useState<ConfiscatedItemDraft[]>([])

  const [confirmModal, setConfirmModal] = useState(false)

  useEffect(() => {
    if (!id) return
    getPrisonerIntakeById(Number(id))
      .then((detail) => {
        setPrisonerCode(detail.prisonerCode ?? '')
        setPrisonerName(
          detail.firstName || detail.lastName
            ? `${detail.firstName ?? ''} ${detail.lastName ?? ''}`.trim()
            : 'Not created yet'
        )
        setIntakeDate(detail.intakeDate.slice(0, 10))
        setInitialHealthStatus(detail.initialHealthStatus)
        setConfiscatedItems(
          detail.confiscatedItems.map((item) => ({
            itemName: item.itemName,
            quantity: item.quantity,
            remarks: item.remarks ?? undefined,
            uid: crypto.randomUUID(),
          }))
        )
      })
      .catch(() => toast.error('Failed to load prisoner intake'))
      .finally(() => setLoading(false))
  }, [id, toast])

  const handleSave = async () => {
    if (!intakeDate) {
      toast.error('Intake date is required')
      return
    }
    if (!initialHealthStatus) {
      toast.error('Health status is required')
      return
    }
    if (submitting) return
    setSubmitting(true)
    try {
      await updatePrisonerIntake(Number(id), {
        intakeDate,
        initialHealthStatus: initialHealthStatus as (typeof HEALTH_STATUSES)[number],
        confiscatedItems: confiscatedItems.map(({ uid: _uid, ...rest }) => ({
          ...rest,
          remarks: rest.remarks || undefined,
        })),
      })
      toast.success('Prisoner intake updated successfully.')
      navigate('/prisoner-intake')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update prisoner intake')
    } finally {
      setSubmitting(false)
      setConfirmModal(false)
    }
  }

  if (loading) return <PageLoader />

  return (
    <>
      <Link to="/prisoner-intake" className="form-page-back">
        <ArrowLeftIcon width={14} height={14} /> Back to Prisoner Intake
      </Link>

      <div className="page-header">
        <h1 className="page-header__title">Edit Prisoner Intake</h1>
        <p className="page-header__subtitle">
          {prisonerCode ? `${prisonerCode} - ${prisonerName}` : prisonerName}
        </p>
      </div>

      <div className="form-page__section">
        <Card title="Intake Record">
          <div className="form-page__grid">
            <FormGroup>
              <Label htmlFor="intake-date" required>
                Intake Date
              </Label>
              <Input
                id="intake-date"
                type="date"
                value={intakeDate}
                onChange={(e) => setIntakeDate(e.target.value)}
              />
            </FormGroup>

            <FormGroup>
              <Label htmlFor="health-status" required>
                Initial Health Status
              </Label>
              <Select
                id="health-status"
                placeholder="Select health status..."
                options={HEALTH_STATUS_OPTIONS}
                value={initialHealthStatus}
                onChange={(e) => setInitialHealthStatus(e.target.value)}
              />
            </FormGroup>
          </div>
        </Card>
      </div>

      <Card
        title={`Confiscated Items${confiscatedItems.length ? ` (${confiscatedItems.length})` : ''}`}
        padding="flush"
      >
        <ConfiscatedItemsLineItems
          items={confiscatedItems}
          onAdd={(item) => setConfiscatedItems((prev) => [...prev, item])}
          onUpdate={(idx, item) =>
            setConfiscatedItems((prev) => prev.map((x, i) => (i === idx ? item : x)))
          }
          onRemove={(idx) => setConfiscatedItems((prev) => prev.filter((_, i) => i !== idx))}
        />
      </Card>

      <div className="form-page__actions">
        <Button
          variant="secondary"
          onClick={() => navigate('/prisoner-intake')}
          disabled={submitting}
        >
          Cancel
        </Button>
        <Button
          loading={submitting}
          onClick={() => {
            if (!intakeDate) {
              toast.error('Intake date is required')
              return
            }
            if (!initialHealthStatus) {
              toast.error('Health status is required')
              return
            }
            setConfirmModal(true)
          }}
        >
          Save Changes
        </Button>
      </div>

      <Modal
        isOpen={confirmModal}
        onClose={() => setConfirmModal(false)}
        title="Save Changes"
        size="sm"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setConfirmModal(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button loading={submitting} onClick={handleSave}>
              Save
            </Button>
          </>
        }
      >
        <p>
          Save changes to intake record for{' '}
          <strong>{prisonerCode ? `${prisonerCode} - ${prisonerName}` : prisonerName}</strong>?
        </p>
      </Modal>
    </>
  )
}
