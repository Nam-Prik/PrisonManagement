import { ArrowLeftIcon } from '@radix-ui/react-icons'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { createNurse, getNurseById, updateNurse } from '../../api/nurse.api'
import { getPersons } from '../../api/person.api'
import {
  Button,
  Card,
  FormGroup,
  Input,
  Label,
  LovButton,
  type LovColumn,
  PageLoader,
  Textarea,
} from '../../components/ui'
import { useToast } from '../../context/ToastContext'
import type { GENDERS } from '../../types/dto/nurse.dto'
import type { Person } from '../../types/dto/person.dto'

const PERSON_LOV_COLUMNS: LovColumn<Person>[] = [
  { key: 'id', label: '#', width: '70px' },
  { key: 'firstName', label: 'First Name' },
  { key: 'lastName', label: 'Last Name' },
  { key: 'gender', label: 'Gender', width: '110px' },
  {
    key: 'dateOfBirth',
    label: 'Date Of Birth',
    width: '140px',
    render: (value) => String(value ?? '').slice(0, 10),
  },
]

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

  const selectedPerson = persons.find((p) => String(p.id) === personId)
  const personDisplayValue = selectedPerson
    ? `[#${selectedPerson.id}] ${selectedPerson.firstName} ${selectedPerson.lastName}`
    : ''
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
      <div className="form-page__section">
        <Card title="Person Information">
          <div className="form-page__grid">
            <FormGroup>
              <Label required>Person</Label>
              <LovButton<Person>
                displayValue={personDisplayValue}
                placeholder="Select person..."
                modalTitle="Select Person"
                columns={PERSON_LOV_COLUMNS}
                data={persons}
                rowKey="id"
                onSelect={(person) => {
                  setPersonId(String(person.id))
                  setGender(person.gender)
                }}
              />
            </FormGroup>
            <FormGroup>
              <Label htmlFor="gender">Gender</Label>
              <Input id="gender" value={genderValue} disabled />
            </FormGroup>
            <FormGroup>
              <Label htmlFor="dob">Date Of Birth</Label>
              <Input id="dob" value={selectedPerson?.dateOfBirth?.slice(0, 10) ?? ''} disabled />
            </FormGroup>
            <FormGroup>
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                value={selectedPerson?.age != null ? String(selectedPerson.age) : ''}
                disabled
              />
            </FormGroup>
            <FormGroup>
              <Label htmlFor="bt">Blood Type</Label>
              <Input id="bt" value={selectedPerson?.bloodType ?? ''} disabled />
            </FormGroup>
            <FormGroup>
              <Label htmlFor="cn">Contact No.</Label>
              <Input id="cn" value={selectedPerson?.contactNo ?? ''} disabled />
            </FormGroup>
          </div>
          <FormGroup>
            <Label htmlFor="addr">Address</Label>
            <Textarea id="addr" value={selectedPerson?.address ?? ''} rows={2} disabled />
          </FormGroup>
        </Card>
      </div>
      <Card title="Occupation Information">
        <div className="form-page__grid">
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
