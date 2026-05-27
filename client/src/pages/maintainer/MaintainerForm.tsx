import { ArrowLeftIcon } from '@radix-ui/react-icons'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { createMaintainer, getMaintainerById, updateMaintainer } from '../../api/maintainer.api'
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
import {
  BLOOD_TYPES,
  GENDERS,
  MAINTENANCE_SKILLS,
  SPECIALIZATIONS,
} from '../../types/dto/maintainer.dto'

const SKILL_OPTIONS = MAINTENANCE_SKILLS.map((s) => ({ value: s, label: s }))
const SPEC_OPTIONS = SPECIALIZATIONS.map((s) => ({ value: s, label: s }))
const GENDER_OPTIONS = GENDERS.map((g) => ({
  value: g,
  label: g === 'M' ? 'Male' : g === 'F' ? 'Female' : g,
}))
const BLOOD_OPTIONS = BLOOD_TYPES.map((b) => ({ value: b, label: b }))

function calcAge(dob: string): string {
  if (!dob) return ''
  const today = new Date()
  const birth = new Date(dob)
  let age = today.getFullYear() - birth.getFullYear()
  if (
    today.getMonth() < birth.getMonth() ||
    (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())
  )
    age--
  return String(age)
}

export default function MaintainerForm() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const toast = useToast()
  const isEdit = id !== undefined

  const [loading, setLoading] = useState(isEdit)
  const [submitting, setSubmitting] = useState(false)

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [identificationNo, setIdentificationNo] = useState('')
  const [gender, setGender] = useState('')
  const [address, setAddress] = useState('')
  const [contactNo, setContactNo] = useState('')
  const [age, setAge] = useState('')
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [bloodType, setBloodType] = useState('')
  const [maintenanceSkill, setMaintenanceSkill] = useState('')
  const [skillDescription, setSkillDescription] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [specialization, setSpecialization] = useState('')

  useEffect(() => {
    if (!isEdit) return
    getMaintainerById(Number(id))
      .then((m) => {
        setFirstName(m.firstName)
        setLastName(m.lastName)
        setIdentificationNo(m.identificationNo ?? '')
        setGender(m.gender)
        setAddress(m.address)
        setContactNo(m.contactNo)
        setAge(String(m.age))
        setDateOfBirth(
          typeof m.dateOfBirth === 'string'
            ? m.dateOfBirth.slice(0, 10)
            : new Date(m.dateOfBirth).toISOString().slice(0, 10)
        )
        setBloodType(m.bloodType)
        setMaintenanceSkill(m.maintenanceSkill)
        setSkillDescription(m.skillDescription ?? '')
        setCompanyName(m.companyName)
        setSpecialization(m.specialization)
      })
      .catch((err) => toast.error(err instanceof Error ? err.message : 'Failed to load'))
      .finally(() => setLoading(false))
  }, [id, isEdit, toast])

  const handleSubmit = async () => {
    if (!firstName.trim()) {
      toast.error('First name is required')
      return
    }
    if (!lastName.trim()) {
      toast.error('Last name is required')
      return
    }
    if (!gender) {
      toast.error('Gender is required')
      return
    }
    if (!address.trim()) {
      toast.error('Address is required')
      return
    }
    if (!contactNo.trim()) {
      toast.error('Contact number is required')
      return
    }
    if (!age || Number(age) <= 0) {
      toast.error('Valid age is required')
      return
    }
    if (!dateOfBirth) {
      toast.error('Date of birth is required')
      return
    }
    if (!bloodType) {
      toast.error('Blood type is required')
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
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        identificationNo: identificationNo.trim() || undefined,
        gender: gender as (typeof GENDERS)[number],
        address: address.trim(),
        contactNo: contactNo.trim(),
        age: Number(age),
        dateOfBirth,
        bloodType: bloodType as (typeof BLOOD_TYPES)[number],
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
              <Label htmlFor="fn" required>
                First Name
              </Label>
              <Input
                id="fn"
                placeholder="First name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </FormGroup>
            <FormGroup>
              <Label htmlFor="ln" required>
                Last Name
              </Label>
              <Input
                id="ln"
                placeholder="Last name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </FormGroup>
            <FormGroup>
              <Label htmlFor="idno">ID No.</Label>
              <Input
                id="idno"
                placeholder="ID number"
                value={identificationNo}
                onChange={(e) => setIdentificationNo(e.target.value)}
              />
            </FormGroup>
            <FormGroup>
              <Label htmlFor="gen" required>
                Gender
              </Label>
              <Select
                id="gen"
                placeholder="Select gender"
                options={GENDER_OPTIONS}
                value={gender}
                onChange={(e) => setGender(e.target.value)}
              />
            </FormGroup>
            <FormGroup>
              <Label htmlFor="dob" required>
                Date of Birth
              </Label>
              <Input
                id="dob"
                type="date"
                value={dateOfBirth}
                onChange={(e) => {
                  setDateOfBirth(e.target.value)
                  setAge(calcAge(e.target.value))
                }}
              />
            </FormGroup>
            <FormGroup>
              <Label htmlFor="age" required>
                Age
              </Label>
              <Input
                id="age"
                type="number"
                min="1"
                value={age}
                onChange={(e) => setAge(e.target.value)}
              />
            </FormGroup>
            <FormGroup>
              <Label htmlFor="bt" required>
                Blood Type
              </Label>
              <Select
                id="bt"
                placeholder="Select blood type"
                options={BLOOD_OPTIONS}
                value={bloodType}
                onChange={(e) => setBloodType(e.target.value)}
              />
            </FormGroup>
            <FormGroup>
              <Label htmlFor="cn" required>
                Contact No.
              </Label>
              <Input
                id="cn"
                placeholder="Contact number"
                value={contactNo}
                onChange={(e) => setContactNo(e.target.value)}
              />
            </FormGroup>
          </div>
          <FormGroup>
            <Label htmlFor="addr" required>
              Address
            </Label>
            <Textarea
              id="addr"
              placeholder="Address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows={2}
            />
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
