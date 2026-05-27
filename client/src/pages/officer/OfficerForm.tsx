import { ArrowLeftIcon } from '@radix-ui/react-icons'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { createOfficer, getOfficerById, updateOfficer } from '../../api/officer.api'
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
  Select,
  Textarea,
} from '../../components/ui'
import { useToast } from '../../context/ToastContext'
import { type GENDERS, RANKS } from '../../types/dto/officer.dto'
import type { Person } from '../../types/dto/person.dto'

const RANK_OPTIONS = RANKS.map((r) => ({ value: r, label: r }))
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

export default function OfficerForm() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const toast = useToast()
  const isEdit = id !== undefined

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [persons, setPersons] = useState<Person[]>([])
  const [personId, setPersonId] = useState('')
  const [code, setCode] = useState('')
  const [rank, setRank] = useState('')
  const [gender, setGender] = useState('')

  useEffect(() => {
    const loads: Promise<unknown>[] = [getPersons().then(setPersons)]
    if (isEdit) {
      loads.push(
        getOfficerById(Number(id)).then((o) => {
          setPersonId(String(o.personId))
          setCode(String(o.code))
          setRank(o.rank)
          setGender(o.gender)
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
    if (!code || Number(code) <= 0) {
      toast.error('Valid code is required')
      return
    }
    if (!rank) {
      toast.error('Rank is required')
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
        code: Number(code),
        rank: rank as (typeof RANKS)[number],
        gender: genderValue as (typeof GENDERS)[number],
      }
      if (isEdit) {
        await updateOfficer(Number(id), dto)
        toast.success('Officer updated.')
      } else {
        await createOfficer(dto)
        toast.success('Officer created.')
      }
      navigate('/officer')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <PageLoader />

  return (
    <>
      <Link to="/officer" className="form-page-back">
        <ArrowLeftIcon width={14} height={14} /> Back to Officers
      </Link>
      <div className="page-header">
        <h1 className="page-header__title">{isEdit ? 'Edit Officer' : 'New Officer'}</h1>
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
              type="number"
              placeholder="Officer code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
          </FormGroup>
          <FormGroup>
            <Label htmlFor="rank" required>
              Rank
            </Label>
            <Select
              id="rank"
              placeholder="Select rank"
              options={RANK_OPTIONS}
              value={rank}
              onChange={(e) => setRank(e.target.value)}
            />
          </FormGroup>
        </div>
      </Card>
      <div className="form-page__actions">
        <Button variant="secondary" onClick={() => navigate('/officer')} disabled={submitting}>
          Cancel
        </Button>
        <Button loading={submitting} onClick={handleSubmit}>
          {isEdit ? 'Save Changes' : 'Create Officer'}
        </Button>
      </div>
    </>
  )
}
