import { ArrowLeftIcon, ArrowRightIcon, PersonIcon, TrashIcon } from '@radix-ui/react-icons'
import { useEffect, useRef, useState } from 'react'
import './PrisonerIntakeForm.css'
import { Link, useNavigate } from 'react-router'
import { createPrisonerIntake, uploadMugshot } from '../../api/prisonerintake.api'
import { Button, Card, FormGroup, Input, Label, Modal, Select, Textarea } from '../../components/ui'
import { useToast } from '../../context/ToastContext'
import type {
  ConfiscatedItemInput,
  CreatePrisonerIntakeDto,
} from '../../types/dto/prisonerintake.dto'
import { BLOOD_TYPES, GENDERS, HEALTH_STATUSES } from '../../types/dto/prisonerintake.dto'

type ConfiscatedEntry = ConfiscatedItemInput & { uid: string }

const GENDER_OPTIONS = GENDERS.map((g) => ({
  value: g,
  label: g === 'M' ? 'Male' : g === 'F' ? 'Female' : g,
}))

const BLOOD_TYPE_OPTIONS = BLOOD_TYPES.map((b) => ({ value: b, label: b }))

const HEALTH_STATUS_OPTIONS = HEALTH_STATUSES.map((s) => ({ value: s, label: s }))

function calcAge(dob: string): string {
  if (!dob) return ''
  const today = new Date()
  const birth = new Date(dob)
  let age = today.getFullYear() - birth.getFullYear()
  if (
    today.getMonth() < birth.getMonth() ||
    (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())
  ) {
    age--
  }
  return String(age)
}

export default function PrisonerIntakeForm() {
  const navigate = useNavigate()
  const toast = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [step, setStep] = useState<1 | 2>(1)
  const [submitting, setSubmitting] = useState(false)

  const [mugshotFile, setMugshotFile] = useState<File | null>(null)
  const [mugshotPreview, setMugshotPreview] = useState<string | null>(null)

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [identificationNo, setIdentificationNo] = useState('')
  const [gender, setGender] = useState('')
  const [address, setAddress] = useState('')
  const [contactNo, setContactNo] = useState('')
  const [age, setAge] = useState('')
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [bloodType, setBloodType] = useState('')
  const [evaluation, setEvaluation] = useState('')

  const [intakeDate, setIntakeDate] = useState('')
  const [initialHealthStatus, setInitialHealthStatus] = useState('')
  const [confiscatedItems, setConfiscatedItems] = useState<ConfiscatedEntry[]>([])

  const [newItemName, setNewItemName] = useState('')
  const [newItemQty, setNewItemQty] = useState('1')
  const [newItemRemarks, setNewItemRemarks] = useState('')

  const [deleteModal, setDeleteModal] = useState<number | null>(null)
  const [confirmModal, setConfirmModal] = useState(false)

  useEffect(() => {
    return () => {
      if (mugshotPreview) URL.revokeObjectURL(mugshotPreview)
    }
  }, [mugshotPreview])

  const handleMugshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File exceeds 5 MB limit')
      return
    }
    if (mugshotPreview) URL.revokeObjectURL(mugshotPreview)
    setMugshotFile(file)
    setMugshotPreview(URL.createObjectURL(file))
  }

  const clearMugshot = () => {
    if (mugshotPreview) URL.revokeObjectURL(mugshotPreview)
    setMugshotFile(null)
    setMugshotPreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const validateStep1 = (): boolean => {
    if (!identificationNo.trim()) {
      toast.error('Identification number is required')
      return false
    }
    if (!firstName.trim()) {
      toast.error('First name is required')
      return false
    }
    if (!lastName.trim()) {
      toast.error('Last name is required')
      return false
    }
    if (!gender) {
      toast.error('Gender is required')
      return false
    }
    if (!address.trim()) {
      toast.error('Address is required')
      return false
    }
    if (!contactNo.trim()) {
      toast.error('Contact number is required')
      return false
    }
    if (!age || Number(age) <= 0) {
      toast.error('Valid age is required')
      return false
    }
    if (!dateOfBirth) {
      toast.error('Date of birth is required')
      return false
    }
    if (!bloodType) {
      toast.error('Blood type is required')
      return false
    }
    return true
  }

  const validateStep2 = (): boolean => {
    if (!intakeDate) {
      toast.error('Intake date is required')
      return false
    }
    if (!initialHealthStatus) {
      toast.error('Health status is required')
      return false
    }
    return true
  }

  const handleAddItem = () => {
    if (!newItemName.trim()) {
      toast.error('Item name is required')
      return
    }
    const qty = parseInt(newItemQty, 10)
    if (Number.isNaN(qty) || qty <= 0) {
      toast.error('Quantity must be a positive number')
      return
    }
    setConfiscatedItems((prev) => [
      ...prev,
      {
        itemName: newItemName.trim(),
        quantity: qty,
        remarks: newItemRemarks.trim() || undefined,
        uid: crypto.randomUUID(),
      },
    ])
    setNewItemName('')
    setNewItemQty('1')
    setNewItemRemarks('')
  }

  const handleRemoveItem = (index: number) => {
    setConfiscatedItems((prev) => prev.filter((_, i) => i !== index))
    setDeleteModal(null)
  }

  const handleSubmit = async () => {
    if (submitting) return
    setSubmitting(true)
    try {
      let mugshotImgKey: string | undefined
      if (mugshotFile) {
        try {
          mugshotImgKey = await uploadMugshot(mugshotFile)
        } catch (err) {
          toast.error(
            `Mugshot upload failed — ${err instanceof Error ? err.message : 'unknown error'}`
          )
        }
      }
      const dto: CreatePrisonerIntakeDto = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        identificationNo: identificationNo.trim(),
        gender: gender as CreatePrisonerIntakeDto['gender'],
        address: address.trim(),
        contactNo: contactNo.trim(),
        age: Number(age),
        dateOfBirth,
        bloodType: bloodType as CreatePrisonerIntakeDto['bloodType'],
        evaluation: evaluation.trim() || undefined,
        intakeDate,
        initialHealthStatus: initialHealthStatus as CreatePrisonerIntakeDto['initialHealthStatus'],
        mugshotImgKey,
        confiscatedItems: confiscatedItems.map(({ uid: _uid, ...rest }) => rest),
      }
      await createPrisonerIntake(dto)
      toast.success('Prisoner intake created successfully.')
      navigate('/prisoner-intake')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create prisoner intake')
    } finally {
      setSubmitting(false)
      setConfirmModal(false)
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
          Register a new prisoner and record their intake details.
        </p>
      </div>

      <Card>
        <p style={{ marginBottom: '20px', color: 'var(--color-text-muted)', fontSize: '14px' }}>
          Step {step} of 2
        </p>

        {step === 1 && (
          <>
            <div className="form-section">
              <h2 className="form-section__title">1. Prisoner Information</h2>

              <div className="mugshot-upload">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="mugshot-upload__input"
                  onChange={handleMugshotChange}
                />
                <button
                  type="button"
                  className="mugshot-preview"
                  onClick={() => fileInputRef.current?.click()}
                  aria-label="Upload mugshot photo"
                >
                  {mugshotPreview ? (
                    <img src={mugshotPreview} alt="Mugshot preview" />
                  ) : (
                    <div className="mugshot-preview__placeholder">
                      <PersonIcon width={32} height={32} />
                      <span>Upload Photo</span>
                    </div>
                  )}
                </button>
                <div className="mugshot-upload__actions">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {mugshotPreview ? 'Change Photo' : 'Choose Photo'}
                  </Button>
                  {mugshotPreview && (
                    <Button type="button" variant="ghost" size="sm" onClick={clearMugshot}>
                      Clear
                    </Button>
                  )}
                </div>
                <span className="mugshot-upload__hint">
                  JPG, PNG · Max 5 MB · Recommended 300×400 px · Optional
                </span>
              </div>

              <div className="form-grid">
                <FormGroup>
                  <Label htmlFor="id-no" required>
                    Identification No.
                  </Label>
                  <Input
                    id="id-no"
                    placeholder="Enter identification number"
                    value={identificationNo}
                    onChange={(e) => setIdentificationNo(e.target.value)}
                  />
                </FormGroup>

                <FormGroup>
                  <Label htmlFor="first-name" required>
                    First Name
                  </Label>
                  <Input
                    id="first-name"
                    placeholder="Enter first name"
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
                    placeholder="Enter last name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
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
                    options={BLOOD_TYPE_OPTIONS}
                    value={bloodType}
                    onChange={(e) => setBloodType(e.target.value)}
                  />
                </FormGroup>
              </div>

              <div className="form-grid">
                <FormGroup>
                  <Label htmlFor="address" required>
                    Address
                  </Label>
                  <Input
                    id="address"
                    placeholder="Enter address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </FormGroup>

                <FormGroup>
                  <Label htmlFor="contact" required>
                    Contact No.
                  </Label>
                  <Input
                    id="contact"
                    placeholder="Enter contact number"
                    value={contactNo}
                    onChange={(e) => setContactNo(e.target.value)}
                  />
                </FormGroup>
              </div>

              <FormGroup>
                <Label htmlFor="evaluation">Evaluation Notes</Label>
                <Textarea
                  id="evaluation"
                  placeholder="Optional evaluation remarks"
                  value={evaluation}
                  onChange={(e) => setEvaluation(e.target.value)}
                  rows={3}
                />
              </FormGroup>
            </div>

            <div className="form-page__actions">
              <Button
                variant="secondary"
                onClick={() => navigate('/prisoner-intake')}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (validateStep1()) setStep(2)
                }}
              >
                Next <ArrowRightIcon width={14} height={14} />
              </Button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div className="form-section">
              <h2 className="form-section__title">2. Intake Information</h2>

              <div className="form-grid">
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
                    placeholder="Select health status"
                    options={HEALTH_STATUS_OPTIONS}
                    value={initialHealthStatus}
                    onChange={(e) => setInitialHealthStatus(e.target.value)}
                  />
                </FormGroup>
              </div>

              <div style={{ marginTop: '24px' }}>
                <h3 className="form-section__title" style={{ fontSize: '1rem' }}>
                  Confiscated Items
                </h3>

                {confiscatedItems.length > 0 && (
                  <div className="items-list">
                    {confiscatedItems.map((item, index) => (
                      <div key={item.uid} className="item-card">
                        <div className="item-card__content">
                          <span className="item-card__name">{item.itemName}</span>
                          <span className="item-card__meta">
                            Qty: {item.quantity}
                            {item.remarks ? ` — ${item.remarks}` : ''}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          iconOnly
                          title="Remove"
                          className="btn-danger-ghost"
                          onClick={() => setDeleteModal(index)}
                        >
                          <TrashIcon width={14} height={14} />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="form-add-item">
                  <div className="form-grid">
                    <FormGroup>
                      <Label htmlFor="item-name">Item Name</Label>
                      <Input
                        id="item-name"
                        placeholder="e.g. Mobile Phone"
                        value={newItemName}
                        onChange={(e) => setNewItemName(e.target.value)}
                      />
                    </FormGroup>
                    <FormGroup>
                      <Label htmlFor="item-qty">Quantity</Label>
                      <Input
                        id="item-qty"
                        type="number"
                        min="1"
                        value={newItemQty}
                        onChange={(e) => setNewItemQty(e.target.value)}
                        onBlur={() => {
                          const v = parseInt(newItemQty, 10)
                          setNewItemQty(String(!Number.isNaN(v) && v >= 1 ? v : 1))
                        }}
                      />
                    </FormGroup>
                  </div>
                  <FormGroup>
                    <Label htmlFor="item-remarks">Remarks</Label>
                    <Input
                      id="item-remarks"
                      placeholder="Optional remarks"
                      value={newItemRemarks}
                      onChange={(e) => setNewItemRemarks(e.target.value)}
                    />
                  </FormGroup>
                  <Button type="button" variant="secondary" size="sm" onClick={handleAddItem}>
                    + Add Item
                  </Button>
                </div>
              </div>
            </div>

            <div className="form-page__actions">
              <Button variant="secondary" onClick={() => setStep(1)} disabled={submitting}>
                <ArrowLeftIcon width={14} height={14} /> Previous
              </Button>
              <Button
                loading={submitting}
                onClick={() => {
                  if (!validateStep2()) return
                  if (newItemName.trim()) {
                    const qty = Math.max(1, parseInt(newItemQty, 10) || 1)
                    setConfiscatedItems((prev) => [
                      ...prev,
                      {
                        itemName: newItemName.trim(),
                        quantity: qty,
                        remarks: newItemRemarks.trim() || undefined,
                        uid: crypto.randomUUID(),
                      },
                    ])
                    setNewItemName('')
                    setNewItemQty('1')
                    setNewItemRemarks('')
                  }
                  setConfirmModal(true)
                }}
              >
                Create Intake
              </Button>
            </div>
          </>
        )}
      </Card>

      <Modal
        isOpen={deleteModal !== null}
        onClose={() => setDeleteModal(null)}
        title="Remove Item"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleteModal(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                if (deleteModal !== null) handleRemoveItem(deleteModal)
              }}
            >
              Remove
            </Button>
          </>
        }
      >
        <p>
          Remove <strong>{confiscatedItems[deleteModal ?? 0]?.itemName}</strong> from the list?
        </p>
      </Modal>

      <Modal
        isOpen={confirmModal}
        onClose={() => setConfirmModal(false)}
        title="Confirm Intake"
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
            <Button loading={submitting} onClick={handleSubmit}>
              Create
            </Button>
          </>
        }
      >
        <p>
          Register{' '}
          <strong>
            {firstName} {lastName}
          </strong>{' '}
          with intake date <strong>{intakeDate}</strong>?
        </p>
      </Modal>
    </>
  )
}
