import { ArrowLeftIcon } from '@radix-ui/react-icons'
import type { FormEvent } from 'react'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { getMedicines } from '../../api/medicine.api'
import { getPrisonerOptions } from '../../api/prisoner.api'
import {
  createTreatment,
  getNurseOptions,
  getTreatmentById,
  updateTreatment,
} from '../../api/treatment.api'
import type { LovColumn } from '../../components/ui'
import { Button, Card, FormGroup, Input, Label, LovButton, PageLoader } from '../../components/ui'
import { useToast } from '../../context/ToastContext'
import type { Medicine } from '../../types/dto/medicine.dto'
import type { PrisonerOption } from '../../types/dto/prisoner.dto'
import type { NurseOption } from '../../types/dto/treatment.dto'
import type { PrescriptionDraft } from './LineItems'
import LineItems from './LineItems'
import '../maintenance/MaintenanceForm.css'

const PRISONER_LOV_COLUMNS: LovColumn<PrisonerOption>[] = [
  { key: 'code', label: 'Code', width: '80px' },
  { key: 'firstName', label: 'First Name' },
  { key: 'lastName', label: 'Last Name' },
]

const NURSE_LOV_COLUMNS: LovColumn<NurseOption>[] = [
  { key: 'code', label: 'Code', width: '80px' },
  { key: 'firstName', label: 'First Name' },
  { key: 'lastName', label: 'Last Name' },
]

export default function TreatmentForm() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const toast = useToast()
  const isEdit = id !== undefined

  const [prisonerOptions, setPrisonerOptions] = useState<PrisonerOption[]>([])
  const [nurseOptions, setNurseOptions] = useState<NurseOption[]>([])
  const [allMedicines, setAllMedicines] = useState<Medicine[]>([])

  const [prisonerId, setPrisonerId] = useState<number>(0)
  const [prisonerLabel, setPrisonerLabel] = useState('')
  const [nurseId, setNurseId] = useState<number>(0)
  const [nurseLabel, setNurseLabel] = useState('')
  const [description, setDescription] = useState('')
  const [diagnoseDate, setDiagnoseDate] = useState(new Date().toISOString().slice(0, 10))
  const [prescriptions, setPrescriptions] = useState<PrescriptionDraft[]>([])

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)

    const refs = Promise.all([getPrisonerOptions(), getNurseOptions(), getMedicines()])
    const detail = isEdit ? getTreatmentById(Number(id)) : Promise.resolve(null)

    Promise.all([refs, detail])
      .then(([[prisoners, nurses, medicines], treatment]) => {
        setPrisonerOptions(prisoners)
        setNurseOptions(nurses)
        setAllMedicines(medicines)

        if (treatment) {
          setPrisonerId(treatment.prisonerId)
          const p = prisoners.find((x) => x.id === treatment.prisonerId)
          if (p) setPrisonerLabel(`[${p.code}] ${p.firstName} ${p.lastName}`)

          setNurseId(treatment.nurseId)
          const n = nurses.find((x) => x.id === treatment.nurseId)
          if (n) setNurseLabel(`[${n.code}] ${n.firstName} ${n.lastName}`)

          setDescription(treatment.description)
          setDiagnoseDate(treatment.diagnoseDate.slice(0, 10))
          setPrescriptions(
            treatment.prescriptions.map((rx) => ({
              medicineId: rx.medicineId,
              medicineName: rx.medicineName,
              medicineCode: rx.medicineCode,
              dosage: rx.dosage,
              frequency: rx.frequency,
              duration: rx.duration,
            }))
          )
        }
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load form data'))
      .finally(() => setLoading(false))
  }, [id, isEdit])

  const handleAddPrescription = (item: PrescriptionDraft) => {
    if (prescriptions.some((p) => p.medicineId === item.medicineId)) {
      setError('This medicine is already in the prescription list.')
      return
    }
    setPrescriptions((prev) => [...prev, item])
    setError(null)
  }

  const handleUpdatePrescription = (index: number, item: PrescriptionDraft) => {
    setPrescriptions((prev) => prev.map((p, i) => (i === index ? item : p)))
  }

  const handleRemovePrescription = (index: number) => {
    setPrescriptions((prev) => prev.filter((_, i) => i !== index))
  }

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

    const payload = {
      prisonerId,
      nurseId,
      description,
      diagnoseDate,
      prescriptions,
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

  return (
    <>
      <Link to="/treatment" className="form-page-back">
        <ArrowLeftIcon width={14} height={14} /> Back to Treatment List
      </Link>

      <div className="page-header">
        <h1 className="page-header__title">{isEdit ? 'Edit Treatment' : 'New Treatment'}</h1>
        <p className="page-header__subtitle">
          {isEdit
            ? 'Update treatment record and medication prescriptions.'
            : 'Create a new treatment record and add medication prescriptions.'}
        </p>
      </div>

      {error && <div className="form-error-banner">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-page__section">
          <Card title="Treatment Record">
            <div className="form-page__grid">
              <div className="field-id">
                <Label>ID</Label>
                <div className="field-id__value">{isEdit ? `#${id}` : 'Auto'}</div>
              </div>

              <FormGroup>
                <Label required>Diagnosis Date</Label>
                <Input
                  type="date"
                  value={diagnoseDate}
                  onChange={(e) => setDiagnoseDate(e.target.value)}
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label required>Prisoner</Label>
                <LovButton<PrisonerOption>
                  displayValue={prisonerLabel}
                  placeholder="Select prisoner…"
                  modalTitle="Select Prisoner"
                  columns={PRISONER_LOV_COLUMNS}
                  data={prisonerOptions}
                  rowKey="id"
                  onSelect={(p) => {
                    setPrisonerId(p.id)
                    setPrisonerLabel(`[${p.code}] ${p.firstName} ${p.lastName}`)
                  }}
                />
              </FormGroup>

              <FormGroup>
                <Label required>Nurse</Label>
                <LovButton<NurseOption>
                  displayValue={nurseLabel}
                  placeholder="Select nurse…"
                  modalTitle="Select Nurse"
                  columns={NURSE_LOV_COLUMNS}
                  data={nurseOptions}
                  rowKey="id"
                  onSelect={(n) => {
                    setNurseId(n.id)
                    setNurseLabel(`[${n.code}] ${n.firstName} ${n.lastName}`)
                  }}
                />
              </FormGroup>

              <FormGroup>
                <Label>Description / Diagnosis</Label>
                <Input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the diagnosis or treatment notes"
                />
              </FormGroup>
            </div>
          </Card>
        </div>

        <Card
          title={`Medication Prescriptions${prescriptions.length ? ` (${prescriptions.length})` : ''}`}
          padding="flush"
        >
          <LineItems
            items={prescriptions}
            allMedicines={allMedicines}
            onAdd={handleAddPrescription}
            onUpdate={handleUpdatePrescription}
            onRemove={handleRemovePrescription}
          />
        </Card>

        <div className="form-page__actions">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate('/treatment')}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button type="submit" loading={submitting}>
            {isEdit ? 'Save Changes' : 'Create Treatment'}
          </Button>
        </div>
      </form>
    </>
  )
}
