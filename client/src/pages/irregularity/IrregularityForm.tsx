import { ArrowLeftIcon } from '@radix-ui/react-icons'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import {
  createIrregularity,
  getIrregularityById,
  updateIrregularity,
} from '../../api/irregularity.api'
import { Button, Card, FormGroup, Label, PageLoader, Select, Textarea } from '../../components/ui'
import { useToast } from '../../context/ToastContext'
import { IRREGULARITY_TYPES, SEVERITIES } from '../../types/dto/irregularity.dto'

const TYPE_OPTIONS = IRREGULARITY_TYPES.map((t) => ({
  value: t,
  label: t.replace(/([A-Z])/g, ' $1').trim(),
}))
const SEVERITY_OPTIONS = SEVERITIES.map((s) => ({ value: s, label: s }))

export default function IrregularityForm() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const toast = useToast()
  const isEdit = id !== undefined

  const [loading, setLoading] = useState(isEdit)
  const [submitting, setSubmitting] = useState(false)
  const [type, setType] = useState('')
  const [severity, setSeverity] = useState('')
  const [description, setDescription] = useState('')

  useEffect(() => {
    if (!isEdit) return
    getIrregularityById(Number(id))
      .then((item) => {
        setType(item.type)
        setSeverity(item.severity)
        setDescription(item.description ?? '')
      })
      .catch((err) => toast.error(err instanceof Error ? err.message : 'Failed to load'))
      .finally(() => setLoading(false))
  }, [id, isEdit, toast])

  const handleSubmit = async () => {
    if (!type) {
      toast.error('Type is required')
      return
    }
    if (!severity) {
      toast.error('Severity is required')
      return
    }
    setSubmitting(true)
    try {
      const dto = {
        type: type as (typeof IRREGULARITY_TYPES)[number],
        severity: severity as (typeof SEVERITIES)[number],
        description: description.trim() || undefined,
      }
      if (isEdit) {
        await updateIrregularity(Number(id), dto)
        toast.success('Irregularity updated.')
      } else {
        await createIrregularity(dto)
        toast.success('Irregularity created.')
      }
      navigate('/irregularity')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <PageLoader />

  return (
    <>
      <Link to="/irregularity" className="form-page-back">
        <ArrowLeftIcon width={14} height={14} /> Back to Irregularities
      </Link>
      <div className="page-header">
        <h1 className="page-header__title">{isEdit ? 'Edit Irregularity' : 'New Irregularity'}</h1>
      </div>
      <Card>
        <div className="form-page__grid">
          <FormGroup>
            <Label htmlFor="type" required>
              Type
            </Label>
            <Select
              id="type"
              placeholder="Select type"
              options={TYPE_OPTIONS}
              value={type}
              onChange={(e) => setType(e.target.value)}
            />
          </FormGroup>
          <FormGroup>
            <Label htmlFor="severity" required>
              Severity
            </Label>
            <Select
              id="severity"
              placeholder="Select severity"
              options={SEVERITY_OPTIONS}
              value={severity}
              onChange={(e) => setSeverity(e.target.value)}
            />
          </FormGroup>
        </div>
        <FormGroup>
          <Label htmlFor="desc">Description</Label>
          <Textarea
            id="desc"
            placeholder="Description of the irregularity"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
        </FormGroup>
      </Card>
      <div className="form-page__actions">
        <Button variant="secondary" onClick={() => navigate('/irregularity')} disabled={submitting}>
          Cancel
        </Button>
        <Button loading={submitting} onClick={handleSubmit}>
          {isEdit ? 'Save Changes' : 'Create Irregularity'}
        </Button>
      </div>
    </>
  )
}
