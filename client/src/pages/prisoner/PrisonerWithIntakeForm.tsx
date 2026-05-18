import { ArrowLeftIcon, ArrowRightIcon, TrashIcon } from '@radix-ui/react-icons'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { checkPrisonerExists, createPrisonerWithPerson } from '../../api/prisoner.api'
import { createPrisonerIntake } from '../../api/prisonerintake.api'
import { Button, Card, FormGroup, Input, Label, Modal, Select, Textarea } from '../../components/ui'
import { useToast } from '../../context/ToastContext'
import type { CreatePrisonerWithPersonDto } from '../../types/dto/prisoner.dto'
import type { ConfiscatedItemInput } from '../../types/dto/prisonerintake.dto'
import { HEALTH_STATUSES } from '../../types/dto/prisonerintake.dto'
import './PrisonerForm.css'

type ConfiscatedEntry = ConfiscatedItemInput & { uid: string }

const GENDERS = [
  { value: 'M', label: 'Male' },
  { value: 'F', label: 'Female' },
  { value: 'Other', label: 'Other' },
  { value: 'Undisclosed', label: 'Undisclosed' },
]

const BLOOD_TYPES = [
  { value: 'A+', label: 'A+' },
  { value: 'A-', label: 'A-' },
  { value: 'B+', label: 'B+' },
  { value: 'B-', label: 'B-' },
  { value: 'AB+', label: 'AB+' },
  { value: 'AB-', label: 'AB-' },
  { value: 'O+', label: 'O+' },
  { value: 'O-', label: 'O-' },
  { value: 'Unknown', label: 'Unknown' },
]

function calculateAge(dateOfBirth: string): string {
  if (!dateOfBirth) return ''
  const today = new Date()
  const birthDate = new Date(dateOfBirth)
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  return String(age)
}

export default function PrisonerWithIntakeForm() {
  const navigate = useNavigate()
  const toast = useToast()

  const [submitting, setSubmitting] = useState(false)

  // Prisoner Form state
  const [identificationNo, setIdentificationNo] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [gender, setGender] = useState('')
  const [address, setAddress] = useState('')
  const [contactNo, setContactNo] = useState('')
  const [age, setAge] = useState('')
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [bloodType, setBloodType] = useState('')
  const [evaluation, setEvaluation] = useState('')

  const [intakeDate, setIntakeDate] = useState('')
  const [initialHealthStatus, setInitialHealthStatus] = useState<string>('')
  const [confiscatedItems, setConfiscatedItems] = useState<ConfiscatedEntry[]>([])

  const [newItemName, setNewItemName] = useState('')
  const [newItemQuantity, setNewItemQuantity] = useState('1')
  const [newItemRemarks, setNewItemRemarks] = useState('')

  const [deleteItemModal, setDeleteItemModal] = useState<number | null>(null)
  const [saveConfirmModal, setSaveConfirmModal] = useState(false)

  const [activeSection, setActiveSection] = useState<1 | 2>(1)

  const handleAddItem = () => {
    if (!newItemName.trim()) {
      toast.error('Item name is required')
      return
    }

    const quantity = parseInt(newItemQuantity, 10)
    if (Number.isNaN(quantity) || quantity <= 0) {
      toast.error('Quantity must be a positive number')
      return
    }

    const newItem: ConfiscatedEntry = {
      itemName: newItemName.trim(),
      quantity,
      remarks: newItemRemarks.trim(),
      uid: crypto.randomUUID(),
    }

    setConfiscatedItems([...confiscatedItems, newItem])
    setNewItemName('')
    setNewItemQuantity('1')
    setNewItemRemarks('')
    toast.success('Item added')
  }

  const handleRemoveItem = (index: number) => {
    setConfiscatedItems(confiscatedItems.filter((_, i) => i !== index))
    setDeleteItemModal(null)
    toast.success('Item removed')
  }

  const validateSection1 = (): boolean => {
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
    if (!age) {
      toast.error('Age is required')
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

  const validateSection2 = (): boolean => {
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

  const handleNextSection = () => {
    if (validateSection1()) {
      setActiveSection(2)
    }
  }

  const handlePrevSection = () => {
    setActiveSection(1)
  }

  const validateForm = (): boolean => {
    if (!validateSection1()) {
      return false
    }
    if (!validateSection2()) {
      return false
    }
    return true
  }

  const handleSubmit = async () => {
    if (submitting) return
    setSubmitting(true)

    try {
      // Check if prisoner with the same name already exists
      const prisonerExists = await checkPrisonerExists(firstName.trim(), lastName.trim())
      if (prisonerExists) {
        setSaveConfirmModal(false)
        toast.error(
          `This prisoner (${firstName.trim()} ${lastName.trim()}) has already been enrolled`
        )
        setSubmitting(false)
        return
      }

      // Create prisoner with person data
      const prisonerDto: CreatePrisonerWithPersonDto = {
        identificationNo: identificationNo.trim() || undefined,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        gender,
        address: address.trim(),
        contactNo: contactNo.trim(),
        age: Number(age),
        dateOfBirth,
        bloodType,
        evaluation: evaluation.trim() || undefined,
      }

      const createdPrisoner = await createPrisonerWithPerson(prisonerDto)

      await createPrisonerIntake({
        prisonerId: createdPrisoner.id,
        intakeDate,
        initialHealthStatus,
        confiscatedItems: confiscatedItems.map(({ uid: _uid, ...rest }) => rest),
      })

      toast.success('Prisoner and intake record created successfully')
      navigate('/prisoner-intake')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create prisoner and intake')
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
        <h1 className="page-header__title">New Prisoner with Intake</h1>
        <p className="page-header__subtitle">
          Register a new prisoner and create their intake record in one form.
        </p>
      </div>

      <div className="form-container">
        <Card padding="default">
          {/* SECTION INDICATOR */}
          <div style={{ marginBottom: '24px', textAlign: 'center' }}>
            <span
              style={{
                display: 'inline-block',
                fontSize: '14px',
                color: '#666',
                fontWeight: '500',
              }}
            >
              Step {activeSection} of 2
            </span>
          </div>

          {/* SECTION 1: PRISONER INFORMATION */}
          {activeSection === 1 && (
            <>
              <div className="form-section">
                <h2 className="form-section__title">1. Prisoner Information</h2>

                <div className="form-grid">
                  <FormGroup>
                    <Label htmlFor="id-no" required={false}>
                      Identification No
                    </Label>
                    <Input
                      id="id-no"
                      placeholder="Optional"
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
                      options={GENDERS}
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                    />
                  </FormGroup>

                  <FormGroup>
                    <Label htmlFor="age" required>
                      Age
                    </Label>
                    <Input
                      id="age"
                      type="number"
                      placeholder="Enter age"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      min="1"
                      max="120"
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
                        setAge(calculateAge(e.target.value))
                      }}
                    />
                  </FormGroup>

                  <FormGroup>
                    <Label htmlFor="blood-type" required>
                      Blood Type
                    </Label>
                    <Select
                      id="blood-type"
                      placeholder="Select blood type"
                      options={BLOOD_TYPES}
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
                      Contact No
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
                    placeholder="Enter evaluation notes or remarks"
                    value={evaluation}
                    onChange={(e) => setEvaluation(e.target.value)}
                    rows={3}
                  />
                </FormGroup>
              </div>

              {/* Section 1 Navigation Buttons */}
              <div className="form-actions">
                <Button
                  variant="secondary"
                  onClick={() => navigate('/prisoner-intake')}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button onClick={handleNextSection} variant="secondary">
                  Next <ArrowRightIcon width={16} height={16} style={{ marginLeft: '8px' }} />
                </Button>
              </div>
            </>
          )}

          {/* SECTION 2: PRISONER INTAKE INFORMATION */}
          {activeSection === 2 && (
            <>
              <div className="form-section">
                <h2 className="form-section__title">2. Prisoner Intake Information</h2>

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
                      Health Status
                    </Label>
                    <Select
                      id="health-status"
                      placeholder="Select health status"
                      options={HEALTH_STATUSES.map((s) => ({ value: s, label: s }))}
                      value={initialHealthStatus}
                      onChange={(e) => setInitialHealthStatus(e.target.value)}
                    />
                  </FormGroup>
                </div>

                <div className="form-section" style={{ marginTop: '20px' }}>
                  <h3 className="form-section__title" style={{ fontSize: '1rem' }}>
                    Confiscated Items
                  </h3>

                  {confiscatedItems.length > 0 && (
                    <div className="items-list">
                      {confiscatedItems.map((item, index) => (
                        <div key={item.uid} className="item-card">
                          <div className="item-card__content">
                            <div className="item-card__name">{item.itemName}</div>
                            <div className="item-card__meta">
                              <span>Qty: {item.quantity}</span>
                              {item.remarks && <span>•</span>}
                              {item.remarks && <span>{item.remarks}</span>}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteItemModal(index)}
                            className="item-card__delete"
                          >
                            <TrashIcon width={15} height={15} />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="form-add-item">
                    <h3 className="form-add-item__title">Add Item</h3>

                    <div className="form-grid">
                      <FormGroup>
                        <Label htmlFor="item-name">Item Name</Label>
                        <Input
                          id="item-name"
                          placeholder="e.g., Mobile Phone, Keys"
                          value={newItemName}
                          onChange={(e) => setNewItemName(e.target.value)}
                        />
                      </FormGroup>

                      <FormGroup>
                        <Label htmlFor="item-quantity">Quantity</Label>
                        <Input
                          id="item-quantity"
                          type="number"
                          placeholder="1"
                          value={newItemQuantity}
                          onChange={(e) => setNewItemQuantity(e.target.value)}
                          min="1"
                        />
                      </FormGroup>
                    </div>

                    <FormGroup>
                      <Label htmlFor="item-remarks">Remarks</Label>
                      <Textarea
                        id="item-remarks"
                        placeholder="Additional notes about the item (optional)"
                        value={newItemRemarks}
                        onChange={(e) => setNewItemRemarks(e.target.value)}
                        rows={2}
                      />
                    </FormGroup>

                    <Button
                      onClick={handleAddItem}
                      variant="secondary"
                      className="form-add-item__btn"
                    >
                      + Add Item
                    </Button>
                  </div>
                </div>
              </div>

              {/* Section 2 Navigation Buttons */}
              <div className="form-actions">
                <Button variant="secondary" onClick={handlePrevSection} disabled={submitting}>
                  <ArrowLeftIcon width={16} height={16} style={{ marginRight: '8px' }} /> Previous
                </Button>
                <Button
                  loading={submitting}
                  onClick={() => {
                    if (validateForm()) {
                      setSaveConfirmModal(true)
                    }
                  }}
                >
                  Create Prisoner & Intake
                </Button>
              </div>
            </>
          )}
        </Card>
      </div>

      <Modal
        isOpen={deleteItemModal !== null}
        onClose={() => setDeleteItemModal(null)}
        title="Remove Item"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleteItemModal(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                if (deleteItemModal !== null) handleRemoveItem(deleteItemModal)
              }}
            >
              Remove
            </Button>
          </>
        }
      >
        <p>
          Remove <strong>{confiscatedItems[deleteItemModal ?? 0]?.itemName}</strong> from
          confiscated items?
        </p>
      </Modal>

      <Modal
        isOpen={saveConfirmModal}
        onClose={() => setSaveConfirmModal(false)}
        title="Create Prisoner & Intake"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setSaveConfirmModal(false)}>
              Cancel
            </Button>
            <Button loading={submitting} onClick={handleSubmit}>
              Create
            </Button>
          </>
        }
      >
        <p>
          Create new prisoner{' '}
          <strong>
            {firstName} {lastName}
          </strong>{' '}
          with intake record on <strong>{intakeDate}</strong>?
        </p>
      </Modal>
    </>
  )
}
