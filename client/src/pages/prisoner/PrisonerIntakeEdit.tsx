import { ArrowLeftIcon, PersonIcon, TrashIcon } from '@radix-ui/react-icons'
import { useEffect, useRef, useState } from 'react'
import './PrisonerIntakeForm.css'
import { Link, useNavigate, useParams } from 'react-router'
import {
  getPrisonerIntakeById,
  updatePrisonerIntake,
  uploadMugshot,
} from '../../api/prisonerintake.api'
import {
  Button,
  Card,
  FormGroup,
  Input,
  Label,
  Modal,
  PageLoader,
  Select,
} from '../../components/ui'
import { useToast } from '../../context/ToastContext'
import type { ConfiscatedItemInput } from '../../types/dto/prisonerintake.dto'
import { HEALTH_STATUSES } from '../../types/dto/prisonerintake.dto'

type ConfiscatedEntry = ConfiscatedItemInput & { uid: string }

const HEALTH_STATUS_OPTIONS = HEALTH_STATUSES.map((s) => ({ value: s, label: s }))

export default function PrisonerIntakeEdit() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const toast = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const [prisonerCode, setPrisonerCode] = useState('')
  const [prisonerName, setPrisonerName] = useState('')

  const [mugshotFile, setMugshotFile] = useState<File | null>(null)
  const [mugshotPreview, setMugshotPreview] = useState<string | null>(null)
  const [existingMugshotUrl, setExistingMugshotUrl] = useState<string | null>(null)

  const [intakeDate, setIntakeDate] = useState('')
  const [initialHealthStatus, setInitialHealthStatus] = useState('')
  const [confiscatedItems, setConfiscatedItems] = useState<ConfiscatedEntry[]>([])

  const [newItemName, setNewItemName] = useState('')
  const [newItemQty, setNewItemQty] = useState('1')
  const [newItemRemarks, setNewItemRemarks] = useState('')

  const [deleteModal, setDeleteModal] = useState<number | null>(null)
  const [confirmModal, setConfirmModal] = useState(false)

  useEffect(() => {
    if (!id) return
    getPrisonerIntakeById(Number(id))
      .then((detail) => {
        setPrisonerCode(detail.prisonerCode)
        setPrisonerName(`${detail.firstName} ${detail.lastName}`)
        setIntakeDate(detail.intakeDate.slice(0, 10))
        setInitialHealthStatus(detail.initialHealthStatus)
        setExistingMugshotUrl(detail.mugshotSignedUrl)
        setConfiscatedItems(
          detail.confiscatedItems.map((item) => ({
            itemName: item.itemName,
            quantity: item.quantity,
            remarks: item.remarks ?? undefined,
            uid: crypto.randomUUID(),
          }))
        )
      })
      .catch(() => toast.error('Failed to load prisoner intake'))
      .finally(() => setLoading(false))
  }, [id, toast])

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

  const clearNewMugshot = () => {
    if (mugshotPreview) URL.revokeObjectURL(mugshotPreview)
    setMugshotFile(null)
    setMugshotPreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
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

  const handleSave = async () => {
    if (!intakeDate) {
      toast.error('Intake date is required')
      return
    }
    if (!initialHealthStatus) {
      toast.error('Health status is required')
      return
    }
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
      await updatePrisonerIntake(Number(id), {
        intakeDate,
        initialHealthStatus: initialHealthStatus as (typeof HEALTH_STATUSES)[number],
        mugshotImgKey,
        confiscatedItems: confiscatedItems.map(({ uid: _uid, ...rest }) => rest),
      })
      toast.success('Prisoner intake updated successfully.')
      navigate('/prisoner-intake')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update prisoner intake')
    } finally {
      setSubmitting(false)
      setConfirmModal(false)
    }
  }

  if (loading) return <PageLoader />

  const displayedMugshot = mugshotPreview ?? existingMugshotUrl

  return (
    <>
      <Link to="/prisoner-intake" className="form-page-back">
        <ArrowLeftIcon width={14} height={14} /> Back to Prisoner Intake
      </Link>

      <div className="page-header">
        <h1 className="page-header__title">Edit Prisoner Intake</h1>
        <p className="page-header__subtitle">
          {prisonerCode} — {prisonerName}
        </p>
      </div>

      <Card>
        <div className="form-section">
          <h2 className="form-section__title">Mugshot</h2>
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
              {displayedMugshot ? (
                <img src={displayedMugshot} alt="Mugshot preview" />
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
                {displayedMugshot ? 'Change Photo' : 'Choose Photo'}
              </Button>
              {mugshotFile && (
                <Button type="button" variant="ghost" size="sm" onClick={clearNewMugshot}>
                  Revert
                </Button>
              )}
            </div>
            <span className="mugshot-upload__hint">
              JPG, PNG · Max 5 MB · Recommended 300×400 px · Optional
            </span>
          </div>
        </div>

        <div className="form-section">
          <h2 className="form-section__title">Intake Information</h2>
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
        </div>

        <div className="form-section">
          <h2 className="form-section__title">Confiscated Items</h2>

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

        <div className="form-page__actions">
          <Button
            variant="secondary"
            onClick={() => navigate('/prisoner-intake')}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            loading={submitting}
            onClick={() => {
              if (!intakeDate) {
                toast.error('Intake date is required')
                return
              }
              if (!initialHealthStatus) {
                toast.error('Health status is required')
                return
              }
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
            Save Changes
          </Button>
        </div>
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
        title="Save Changes"
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
            <Button loading={submitting} onClick={handleSave}>
              Save
            </Button>
          </>
        }
      >
        <p>
          Save changes to intake record for{' '}
          <strong>
            {prisonerCode} — {prisonerName}
          </strong>
          ?
        </p>
      </Modal>
    </>
  )
}
