import { ArrowLeftIcon } from '@radix-ui/react-icons'
import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { createPerson, getPersonById, updatePerson, uploadDocument } from '../../api/person.api'
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
import { BLOOD_TYPES, GENDERS } from '../../types/dto/person.dto'

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

interface DocField {
  label: string
  numberKey: 'nationalIdNumber' | 'houseRegistrationNumber' | 'birthCertificateNumber'
  fileKey: 'nationalIdFileKey' | 'houseRegistrationFileKey' | 'birthCertificateFileKey'
}

const DOC_FIELDS: DocField[] = [
  { label: 'National ID', numberKey: 'nationalIdNumber', fileKey: 'nationalIdFileKey' },
  {
    label: 'House Registration',
    numberKey: 'houseRegistrationNumber',
    fileKey: 'houseRegistrationFileKey',
  },
  {
    label: 'Birth Certificate',
    numberKey: 'birthCertificateNumber',
    fileKey: 'birthCertificateFileKey',
  },
]

export default function PersonForm() {
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

  const [nationalIdNumber, setNationalIdNumber] = useState('')
  const [nationalIdFileKey, setNationalIdFileKey] = useState('')
  const [houseRegNumber, setHouseRegNumber] = useState('')
  const [houseRegFileKey, setHouseRegFileKey] = useState('')
  const [birthCertNumber, setBirthCertNumber] = useState('')
  const [birthCertFileKey, setBirthCertFileKey] = useState('')

  // New states to hold pending file uploads
  const [nationalIdFile, setNationalIdFile] = useState<File | null>(null)
  const [houseRegFile, setHouseRegFile] = useState<File | null>(null)
  const [birthCertFile, setBirthCertFile] = useState<File | null>(null)

  const nationalIdRef = useRef<HTMLInputElement>(null)
  const houseRegRef = useRef<HTMLInputElement>(null)
  const birthCertRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!isEdit) return
    getPersonById(Number(id))
      .then((p) => {
        setFirstName(p.firstName)
        setLastName(p.lastName)
        setIdentificationNo(p.identificationNo ?? '')
        setGender(p.gender)
        setAddress(p.address)
        setContactNo(p.contactNo)
        setAge(String(p.age))
        setDateOfBirth(p.dateOfBirth.slice(0, 10))
        setBloodType(p.bloodType)
        setNationalIdNumber(p.nationalIdNumber != null ? String(p.nationalIdNumber) : '')
        setNationalIdFileKey(p.nationalIdFileKey ?? '')
        setHouseRegNumber(
          p.houseRegistrationNumber != null ? String(p.houseRegistrationNumber) : ''
        )
        setHouseRegFileKey(p.houseRegistrationFileKey ?? '')
        setBirthCertNumber(p.birthCertificateNumber != null ? String(p.birthCertificateNumber) : '')
        setBirthCertFileKey(p.birthCertificateFileKey ?? '')
      })
      .catch((err) => toast.error(err instanceof Error ? err.message : 'Failed to load'))
      .finally(() => setLoading(false))
  }, [id, isEdit, toast])

  const handleSubmit = async () => {
    if (!firstName.trim()) return toast.error('First name is required')
    if (!lastName.trim()) return toast.error('Last name is required')
    if (!gender) return toast.error('Gender is required')
    if (!address.trim()) return toast.error('Address is required')
    if (!contactNo.trim()) return toast.error('Contact number is required')
    if (!age || Number(age) <= 0) return toast.error('Valid age is required')
    if (!dateOfBirth) return toast.error('Date of birth is required')
    if (!bloodType) return toast.error('Blood type is required')

    setSubmitting(true)
    try {
      // 1. Upload pending files concurrently
      const [newNatIdKey, newHouseRegKey, newBirthCertKey] = await Promise.all([
        nationalIdFile ? uploadDocument(nationalIdFile) : Promise.resolve(nationalIdFileKey),
        houseRegFile ? uploadDocument(houseRegFile) : Promise.resolve(houseRegFileKey),
        birthCertFile ? uploadDocument(birthCertFile) : Promise.resolve(birthCertFileKey),
      ])

      // 2. Build DTO with the resulting keys
      const dto = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        identificationNo: identificationNo.trim() || undefined,
        gender: gender as 'M' | 'F' | 'Other' | 'Undisclosed',
        address: address.trim(),
        contactNo: contactNo.trim(),
        age: Number(age),
        dateOfBirth,
        bloodType: bloodType as 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | 'Unknown',

        nationalIdNumber: nationalIdNumber ? Number(nationalIdNumber) : undefined,
        houseRegistrationNumber: houseRegNumber ? Number(houseRegNumber) : undefined,
        birthCertificateNumber: birthCertNumber ? Number(birthCertNumber) : undefined,

        nationalIdFileKey: newNatIdKey || nationalIdFileKey || undefined,
        houseRegistrationFileKey: newHouseRegKey || houseRegFileKey || undefined,
        birthCertificateFileKey: newBirthCertKey || birthCertFileKey || undefined,
      }

      // 3. Save the record
      if (isEdit) {
        await updatePerson(Number(id), dto)
        toast.success('Person updated.')
      } else {
        await createPerson(dto)
        toast.success('Person created.')
      }
      navigate('/person')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <PageLoader />

  return (
    <>
      <Link to="/person" className="form-page-back">
        <ArrowLeftIcon width={14} height={14} /> Back to Persons
      </Link>

      <div className="page-header">
        <h1 className="page-header__title">{isEdit ? 'Edit Person' : 'New Person'}</h1>
        <p className="page-header__subtitle">
          {isEdit ? 'Update person information.' : 'Register a new person.'}
        </p>
      </div>

      <div className="form-page__section">
        <Card title="1. Basic Information">
          <div className="form-page__grid">
            <FormGroup>
              <Label htmlFor="first-name" required>
                First Name
              </Label>
              <Input
                id="first-name"
                placeholder="First name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </FormGroup>
            <FormGroup>
              <Label htmlFor="last-name" required>
                Last Name
              </Label>
              <Input
                id="last-name"
                placeholder="Last name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </FormGroup>
            <FormGroup>
              <Label htmlFor="id-no">Identification No.</Label>
              <Input
                id="id-no"
                placeholder="ID number"
                value={identificationNo}
                onChange={(e) => setIdentificationNo(e.target.value)}
              />
            </FormGroup>
            <FormGroup>
              <Label htmlFor="gender" required>
                Gender
              </Label>
              <Select
                id="gender"
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
                max="120"
                placeholder="Age"
                value={age}
                onChange={(e) => setAge(e.target.value)}
              />
            </FormGroup>
            <FormGroup>
              <Label htmlFor="blood-type" required>
                Blood Type
              </Label>
              <Select
                id="blood-type"
                placeholder="Select blood type"
                options={BLOOD_OPTIONS}
                value={bloodType}
                onChange={(e) => setBloodType(e.target.value)}
              />
            </FormGroup>
            <FormGroup>
              <Label htmlFor="contact" required>
                Contact No.
              </Label>
              <Input
                id="contact"
                placeholder="Contact number"
                value={contactNo}
                onChange={(e) => setContactNo(e.target.value)}
              />
            </FormGroup>
          </div>
          <FormGroup>
            <Label htmlFor="address" required>
              Address
            </Label>
            <Textarea
              id="address"
              placeholder="Address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows={2}
            />
          </FormGroup>
        </Card>
      </div>

      <div className="form-page__section">
        <Card title="2. Documents">
          {DOC_FIELDS.map(({ label, numberKey, fileKey }) => {
            const refs = {
              nationalIdFileKey: nationalIdRef,
              houseRegistrationFileKey: houseRegRef,
              birthCertificateFileKey: birthCertRef,
            }
            const fileRef = refs[fileKey]

            const numberVal =
              fileKey === 'nationalIdFileKey'
                ? nationalIdNumber
                : fileKey === 'houseRegistrationFileKey'
                  ? houseRegNumber
                  : birthCertNumber

            const setNumberVal =
              fileKey === 'nationalIdFileKey'
                ? setNationalIdNumber
                : fileKey === 'houseRegistrationFileKey'
                  ? setHouseRegNumber
                  : setBirthCertNumber

            // Track existing keys to know if an old file exists
            const existingKeyVal =
              fileKey === 'nationalIdFileKey'
                ? nationalIdFileKey
                : fileKey === 'houseRegistrationFileKey'
                  ? houseRegFileKey
                  : birthCertFileKey

            // Track newly selected pending files
            const pendingFile =
              fileKey === 'nationalIdFileKey'
                ? nationalIdFile
                : fileKey === 'houseRegistrationFileKey'
                  ? houseRegFile
                  : birthCertFile

            const setPendingFile =
              fileKey === 'nationalIdFileKey'
                ? setNationalIdFile
                : fileKey === 'houseRegistrationFileKey'
                  ? setHouseRegFile
                  : setBirthCertFile

            // Display pending file name if it exists, otherwise fall back to the existing DB key
            const displayFileName = pendingFile
              ? pendingFile.name
              : existingKeyVal
                ? existingKeyVal.split('/').pop()
                : ''

            return (
              <div key={fileKey} className="form-page__grid" style={{ marginBottom: '16px' }}>
                <FormGroup>
                  <Label htmlFor={numberKey}>{label} Number</Label>
                  <Input
                    id={numberKey}
                    type="number"
                    placeholder={`${label} number`}
                    value={numberVal}
                    onChange={(e) => setNumberVal(e.target.value)}
                  />
                </FormGroup>
                <FormGroup>
                  <Label>{label} File</Label>
                  <input
                    ref={fileRef}
                    type="file"
                    style={{ display: 'none' }}
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) setPendingFile(file)
                    }}
                  />
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => fileRef.current?.click()}
                    >
                      {displayFileName ? 'Change File' : 'Select File'}
                    </Button>
                    {displayFileName && (
                      <span
                        style={{
                          fontSize: '12px',
                          color: 'var(--color-text-muted)',
                          wordBreak: 'break-all',
                        }}
                      >
                        {displayFileName}
                      </span>
                    )}
                  </div>
                </FormGroup>
              </div>
            )
          })}
        </Card>
      </div>

      <div className="form-page__actions">
        <Button
          type="button"
          variant="secondary"
          onClick={() => navigate('/person')}
          disabled={submitting}
        >
          Cancel
        </Button>
        <Button loading={submitting} onClick={handleSubmit}>
          {isEdit ? 'Save Changes' : 'Create Person'}
        </Button>
      </div>
    </>
  )
}
