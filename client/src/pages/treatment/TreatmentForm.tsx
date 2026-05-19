import { ArrowLeftIcon } from '@radix-ui/react-icons'
import type { FormEvent } from 'react'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { createTreatment, getNurseOptions, getTreatmentById, updateTreatment } from '../../api/treatment.api'
import { getPrisonerOptions } from '../../api/prisoner.api'
import { Button, Card, FormGroup, Input, PageLoader, Select } from '../../components/ui'
import { useToast } from '../../context/ToastContext'
import type { NurseOption, UpdateTreatmentDto } from '../../types/dto/treatment.dto'
import type { PrisonerOption } from '../../types/dto/prisoner.dto'

export default function TreatmentForm() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const toast = useToast()
  const isEdit = id !== undefined

  const [prisonerOptions, setPrisonerOptions] = useState<PrisonerOption[]>([])
  const [nurseOptions, setNurseOptions] = useState<NurseOption[]>([])

  const [prisonerId, setPrisonerId] = useState<number>(0)
  const [nurseId, setNurseId] = useState<number>(0)
  const [description, setDescription] = useState('')
  const [diagnoseDate, setDiagnoseDate] = useState(new Date().toISOString().slice(0, 10))

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)

    const refs = Promise.all([getPrisonerOptions(), getNurseOptions()])
    const detail = isEdit ? getTreatmentById(Number(id)) : Promise.resolve(null)

    Promise.all([refs, detail])
      .then(([[prisoners, nurses], treatment]) => {
        setPrisonerOptions(prisoners)
        setNurseOptions(nurses)

        if (treatment) {
          setPrisonerId(treatment.prisonerId)
          setNurseId(treatment.nurseId)
          setDescription(treatment.description)
          setDiagnoseDate(treatment.diagnoseDate.slice(0, 10))
        }
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load treatment form data'))
      .finally(() => setLoading(false))
  }, [id, isEdit])

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    if (!prisonerId) {
      setError('Please select a prisoner.')
      return
    }
    if (!nurseId) {
      setError('Please select a nurse.')
      return
    }
    if (!diagnoseDate) {
      setError('Please select a diagnosis date.')
      return
    }

    const payload: UpdateTreatmentDto = {
      prisonerId,
      nurseId,
      description,
      diagnoseDate,
    }

    setSubmitting(true)
    try {
      if (isEdit) {
        await updateTreatment(Number(id), payload)
        toast.success('Treatment record updated successfully.')
      } else {
        await createTreatment(payload)
        toast.success('Treatment record created successfully.')
      }
      navigate('/treatment')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <PageLoader />

  const prisonerOptionsList = prisonerOptions.map((prisoner) => ({
    value: String(prisoner.id),
    label: `[${prisoner.code}] ${prisoner.firstName} ${prisoner.lastName}`,
  }))

  const nurseOptionsList = nurseOptions.map((nurse) => ({
    value: String(nurse.id),
    label: `[${nurse.code}] ${nurse.firstName} ${nurse.lastName}`,
  }))

  return (
    <>
      <Link to="/treatment" className="form-page-back">
        <ArrowLeftIcon width={14} height={14} /> Back to Treatment List
      </Link>

      <div className="page-header">
        <h1 className="page-header__title">{isEdit ? 'Edit Treatment' : 'New Treatment'}</h1>
        <p className="page-header__subtitle">
          {isEdit
            ? 'Update an existing treatment record.'
            : 'Create a new treatment record for a prisoner.'}
        </p>
      </div>

      {error && <div className="form-error-banner">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-page__section">
          <Card title="Treatment Details">
            <div className="form-page__grid">
              <FormGroup label="Prisoner" required>
                <Select
                  value={prisonerId ? String(prisonerId) : ''}
                  onChange={(e) => setPrisonerId(Number(e.target.value))}
                  options={[{ value: '', label: 'Select a prisoner…' }, ...prisonerOptionsList]}
                />
              </FormGroup>

              <FormGroup label="Nurse" required>
                <Select
                  value={nurseId ? String(nurseId) : ''}
                  onChange={(e) => setNurseId(Number(e.target.value))}
                  options={[{ value: '', label: 'Select a nurse…' }, ...nurseOptionsList]}
                />
              </FormGroup>

              <FormGroup label="Diagnosis Date" required>
                <Input
                  type="date"
                  value={diagnoseDate}
                  onChange={(e) => setDiagnoseDate(e.target.value)}
                  required
                />
              </FormGroup>

              <FormGroup label="Description">
                <Input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the treatment or observation"
                />
              </FormGroup>
            </div>
          </Card>
        </div>

        <div className="form-page__section">
          <Button type="submit" disabled={submitting}>
            {isEdit ? 'Save Changes' : 'Create Treatment'}
          </Button>
        </div>
      </form>
    </>
  )
}
