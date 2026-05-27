import { ArrowLeftIcon } from '@radix-ui/react-icons'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { createPrisonerIntake } from '../../api/prisonerintake.api'
import { Button, Card, FormGroup, Label, Select } from '../../components/ui'
import Input from '../../components/ui/Form/Input'
import { useToast } from '../../context/ToastContext'
import { HEALTH_STATUSES } from '../../types/dto/prisonerintake.dto'
import type { ConfiscatedItemDraft } from './ConfiscatedItemsLineItems'
import ConfiscatedItemsLineItems from './ConfiscatedItemsLineItems'
import '../maintenance/MaintenanceForm.css'

const HEALTH_STATUS_OPTIONS = HEALTH_STATUSES.map((s) => ({ value: s, label: s }))

export default function PrisonerIntakeForm() {
  const navigate = useNavigate()
  const toast = useToast()

  const [intakeDate, setIntakeDate] = useState(new Date().toISOString().slice(0, 10))
  const [initialHealthStatus, setInitialHealthStatus] = useState('')
  const [confiscatedItems, setConfiscatedItems] = useState<ConfiscatedItemDraft[]>([])

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    setError(null)

    if (!intakeDate) {
      setError('Intake date is required.')
      return
    }
    if (!initialHealthStatus) {
      setError('Initial health status is required.')
      return
    }
    if (submitting) return

    setSubmitting(true)
    try {
      await createPrisonerIntake({
        intakeDate,
        initialHealthStatus: initialHealthStatus as (typeof HEALTH_STATUSES)[number],
        confiscatedItems: confiscatedItems.map(({ uid: _uid, ...rest }) => ({
          ...rest,
          remarks: rest.remarks || undefined,
        })),
      })
      toast.success('Prisoner intake created successfully.')
      navigate('/prisoner-intake')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create prisoner intake')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <Link to="/prisoner-intake" className="form-page-back">
        <ArrowLeftIcon width={14} height={14} /> Back to Prisoner Intake
      </Link>

      <div className="page-header">
        <h1 className="page-header__title">New Prisoner Intake</h1>
        <p className="page-header__subtitle">
          Record a new intake event before creating the prisoner record.
        </p>
      </div>

      {error && <div className="form-error-banner">{error}</div>}

      <div className="form-page__section">
        <Card title="Intake Record">
          <div className="form-page__grid">
            <FormGroup>
              <Label required>Intake Date</Label>
              <Input
                type="date"
                value={intakeDate}
                onChange={(e) => setIntakeDate(e.target.value)}
              />
            </FormGroup>

            <FormGroup>
              <Label required>Initial Health Status</Label>
              <Select
                placeholder="Select health status…"
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
          type="button"
          variant="secondary"
          onClick={() => navigate('/prisoner-intake')}
          disabled={submitting}
        >
          Cancel
        </Button>
        <Button loading={submitting} onClick={handleSubmit}>
          Create Intake
        </Button>
      </div>
    </>
  )
}
