import { ArrowLeftIcon } from '@radix-ui/react-icons'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { createMaintainer, getMaintainerById, updateMaintainer } from '../../api/maintainer.api'
import { getPersons } from '../../api/person.api'
import {
  Button,
  Card,
  FormGroup,
  Input,
  Label,
  PageLoader,
  Select,
  Textarea,
} from '../../components/ui'
import { useToast } from '../../context/ToastContext'
import { MAINTENANCE_SKILLS, SPECIALIZATIONS } from '../../types/dto/maintainer.dto'
import type { Person } from '../../types/dto/person.dto'

const SKILL_OPTIONS = MAINTENANCE_SKILLS.map((s) => ({ value: s, label: s }))
const SPEC_OPTIONS = SPECIALIZATIONS.map((s) => ({ value: s, label: s }))

export default function MaintainerForm() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const toast = useToast()
  const isEdit = id !== undefined

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [persons, setPersons] = useState<Person[]>([])

  const [personId, setPersonId] = useState('')
  const [maintenanceSkill, setMaintenanceSkill] = useState('')
  const [skillDescription, setSkillDescription] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [specialization, setSpecialization] = useState('')

  useEffect(() => {
    const loads: Promise<unknown>[] = [getPersons().then(setPersons)]
    if (isEdit) {
      loads.push(
        getMaintainerById(Number(id)).then((m) => {
          setPersonId(String(m.personId))
          setMaintenanceSkill(m.maintenanceSkill)
          setSkillDescription(m.skillDescription ?? '')
          setCompanyName(m.companyName)
          setSpecialization(m.specialization)
        })
      )
    }
    Promise.all(loads)
      .catch((err) => toast.error(err instanceof Error ? err.message : 'Failed to load'))
      .finally(() => setLoading(false))
  }, [id, isEdit, toast])

  const selectedPerson = persons.find((p) => String(p.id) === personId)
  const personOptions = persons.map((p) => ({
    value: String(p.id),
    label: `[#${p.id}] ${p.firstName} ${p.lastName}`,
  }))

  const handleSubmit = async () => {
    if (!personId) {
      toast.error('Person is required')
      return
    }
    if (!maintenanceSkill) {
      toast.error('Maintenance skill is required')
      return
    }
    if (!companyName.trim()) {
      toast.error('Company name is required')
      return
    }
    if (!specialization) {
      toast.error('Specialization is required')
      return
    }
    setSubmitting(true)
    try {
      const dto = {
        personId: Number(personId),
        maintenanceSkill: maintenanceSkill as (typeof MAINTENANCE_SKILLS)[number],
        skillDescription: skillDescription.trim() || undefined,
        companyName: companyName.trim(),
        specialization: specialization as (typeof SPECIALIZATIONS)[number],
      }
      if (isEdit) {
        await updateMaintainer(Number(id), dto)
        toast.success('Maintainer updated.')
      } else {
        await createMaintainer(dto)
        toast.success('Maintainer created.')
      }
      navigate('/maintainer')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <PageLoader />

  return (
    <>
      <Link to="/maintainer" className="form-page-back">
        <ArrowLeftIcon width={14} height={14} /> Back to Maintainers
      </Link>
      <div className="page-header">
        <h1 className="page-header__title">{isEdit ? 'Edit Maintainer' : 'New Maintainer'}</h1>
      </div>
      <div className="form-page__section">
        <Card title="Person Information">
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
                onChange={(e) => setPersonId(e.target.value)}
              />
            </FormGroup>
            <FormGroup>
              <Label htmlFor="gender">Gender</Label>
              <Input id="gender" value={selectedPerson?.gender ?? ''} disabled />
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
      <Card title="Maintainer Details">
        <div className="form-page__grid">
          <FormGroup>
            <Label htmlFor="skill" required>
              Maintenance Skill
            </Label>
            <Select
              id="skill"
              placeholder="Select skill"
              options={SKILL_OPTIONS}
              value={maintenanceSkill}
              onChange={(e) => setMaintenanceSkill(e.target.value)}
            />
          </FormGroup>
          <FormGroup>
            <Label htmlFor="spec" required>
              Specialization
            </Label>
            <Select
              id="spec"
              placeholder="Select specialization"
              options={SPEC_OPTIONS}
              value={specialization}
              onChange={(e) => setSpecialization(e.target.value)}
            />
          </FormGroup>
          <FormGroup>
            <Label htmlFor="company" required>
              Company
            </Label>
            <Input
              id="company"
              placeholder="Company name"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
            />
          </FormGroup>
        </div>
        <FormGroup>
          <Label htmlFor="desc">Skill Description</Label>
          <Textarea
            id="desc"
            placeholder="Description of skills"
            value={skillDescription}
            onChange={(e) => setSkillDescription(e.target.value)}
            rows={2}
          />
        </FormGroup>
      </Card>
      <div className="form-page__actions">
        <Button variant="secondary" onClick={() => navigate('/maintainer')} disabled={submitting}>
          Cancel
        </Button>
        <Button loading={submitting} onClick={handleSubmit}>
          {isEdit ? 'Save Changes' : 'Create Maintainer'}
        </Button>
      </div>
    </>
  )
}
