import { ArrowLeftIcon } from '@radix-ui/react-icons'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import {
  createPrisonLocation,
  getPrisonLocationById,
  updatePrisonLocation,
} from '../../api/prison-location.api'
import { Button, Card, FormGroup, Input, Label, PageLoader } from '../../components/ui'
import { useToast } from '../../context/ToastContext'

export default function PrisonLocationForm() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const toast = useToast()
  const isEdit = id !== undefined

  const [loading, setLoading] = useState(isEdit)
  const [submitting, setSubmitting] = useState(false)
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [purpose, setPurpose] = useState('')
  const [maxCapacity, setMaxCapacity] = useState('')

  useEffect(() => {
    if (!isEdit) return
    getPrisonLocationById(Number(id))
      .then((l) => {
        setName(l.name)
        setCode(l.code)
        setPurpose(l.purpose)
        setMaxCapacity(String(l.maxCapacity))
      })
      .catch((err) => toast.error(err instanceof Error ? err.message : 'Failed to load'))
      .finally(() => setLoading(false))
  }, [id, isEdit, toast])

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error('Name is required')
      return
    }
    if (!code.trim()) {
      toast.error('Code is required')
      return
    }
    if (!purpose.trim()) {
      toast.error('Purpose is required')
      return
    }
    if (!maxCapacity || Number(maxCapacity) <= 0) {
      toast.error('Valid capacity is required')
      return
    }
    setSubmitting(true)
    try {
      const dto = {
        name: name.trim(),
        code: code.trim(),
        purpose: purpose.trim(),
        maxCapacity: Number(maxCapacity),
      }
      if (isEdit) {
        await updatePrisonLocation(Number(id), dto)
        toast.success('Location updated.')
      } else {
        await createPrisonLocation(dto)
        toast.success('Location created.')
      }
      navigate('/prison-location')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <PageLoader />

  return (
    <>
      <Link to="/prison-location" className="form-page-back">
        <ArrowLeftIcon width={14} height={14} /> Back to Prison Locations
      </Link>
      <div className="page-header">
        <h1 className="page-header__title">
          {isEdit ? 'Edit Prison Location' : 'New Prison Location'}
        </h1>
      </div>
      <Card>
        <div className="form-page__grid">
          <FormGroup>
            <Label htmlFor="name" required>
              Name
            </Label>
            <Input
              id="name"
              placeholder="Location name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </FormGroup>
          <FormGroup>
            <Label htmlFor="code" required>
              Code
            </Label>
            <Input
              id="code"
              placeholder="Location code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
          </FormGroup>
          <FormGroup>
            <Label htmlFor="purpose" required>
              Purpose
            </Label>
            <Input
              id="purpose"
              placeholder="Purpose"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
            />
          </FormGroup>
          <FormGroup>
            <Label htmlFor="cap" required>
              Max Capacity
            </Label>
            <Input
              id="cap"
              type="number"
              min="1"
              placeholder="0"
              value={maxCapacity}
              onChange={(e) => setMaxCapacity(e.target.value)}
            />
          </FormGroup>
        </div>
      </Card>
      <div className="form-page__actions">
        <Button
          variant="secondary"
          onClick={() => navigate('/prison-location')}
          disabled={submitting}
        >
          Cancel
        </Button>
        <Button loading={submitting} onClick={handleSubmit}>
          {isEdit ? 'Save Changes' : 'Create Location'}
        </Button>
      </div>
    </>
  )
}
