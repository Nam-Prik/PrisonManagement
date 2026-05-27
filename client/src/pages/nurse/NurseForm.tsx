import { ArrowLeftIcon } from '@radix-ui/react-icons'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { createNurse, getNurseById, updateNurse } from '../../api/nurse.api'
import { getPersons } from '../../api/person.api'
import { Button, Card, FormGroup, Input, Label, PageLoader, Select } from '../../components/ui'
import { useToast } from '../../context/ToastContext'
import type { GENDERS } from '../../types/dto/nurse.dto'
import type { Person } from '../../types/dto/person.dto'

export default function NurseForm() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const toast = useToast()
  const isEdit = id !== undefined

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [persons, setPersons] = useState<Person[]>([])
  const [personId, setPersonId] = useState('')
  const [code, setCode] = useState('')
  const [gender, setGender] = useState('')

  useEffect(() => {
    const loads: Promise<unknown>[] = [getPersons().then(setPersons)]
    if (isEdit) {
      loads.push(
        getNurseById(Number(id)).then((n) => {
          setPersonId(String(n.personId))
          setCode(n.code)
          setGender(n.gender)
        })
      )
    }
    Promise.all(loads)
      .catch((err) => toast.error(err instanceof Error ? err.message : 'Failed to load'))
      .finally(() => setLoading(false))
  }, [id, isEdit, toast])

  const personOptions = persons.map((p) => ({
    value: String(p.id),
    label: `[#${p.id}] ${p.firstName} ${p.lastName}`,
  }))
  const selectedPerson = persons.find((p) => String(p.id) === personId)
  const genderValue = selectedPerson?.gender ?? gender

  const handleSubmit = async () => {
    if (!personId) {
      toast.error('Person is required')
      return
    }
    if (!code.trim()) {
      toast.error('Code is required')
      return
    }
    if (!genderValue) {
      toast.error('Gender is required')
      return
    }
    setSubmitting(true)
    try {
      const dto = {
        personId: Number(personId),
        code: code.trim(),
        gender: genderValue as (typeof GENDERS)[number],
      }
      if (isEdit) {
        await updateNurse(Number(id), dto)
        toast.success('Nurse updated.')
      } else {
        await createNurse(dto)
        toast.success('Nurse created.')
      }
      navigate('/nurse')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <PageLoader />

  return (
    <>
      <Link to="/nurse" className="form-page-back">
        <ArrowLeftIcon width={14} height={14} /> Back to Nurses
      </Link>
      <div className="page-header">
        <h1 className="page-header__title">{isEdit ? 'Edit Nurse' : 'New Nurse'}</h1>
      </div>
      <Card>
        <div className="form-page__grid">
          <FormGroup>
            <Label htmlFor="person" required>
              Person
            </Label>
            <Select
              id="person"
              placeholder="Select person"
              options={personOptions}
              value={personId}
              onChange={(e) => {
                const nextPersonId = e.target.value
                setPersonId(nextPersonId)
                setGender(persons.find((p) => String(p.id) === nextPersonId)?.gender ?? '')
              }}
            />
          </FormGroup>
          <FormGroup>
            <Label htmlFor="code" required>
              Code
            </Label>
            <Input
              id="code"
              placeholder="Nurse code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
          </FormGroup>
          <FormGroup>
            <Label htmlFor="gender" required>
              Gender
            </Label>
            <Input id="gender" value={genderValue} disabled />
          </FormGroup>
        </div>
      </Card>
      <div className="form-page__actions">
        <Button variant="secondary" onClick={() => navigate('/nurse')} disabled={submitting}>
          Cancel
        </Button>
        <Button loading={submitting} onClick={handleSubmit}>
          {isEdit ? 'Save Changes' : 'Create Nurse'}
        </Button>
      </div>
    </>
  )
}
