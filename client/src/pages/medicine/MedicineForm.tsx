import { ArrowLeftIcon } from '@radix-ui/react-icons'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { createMedicine, getMedicineById, updateMedicine } from '../../api/medicine.api'
import { Button, Card, FormGroup, Input, Label, PageLoader, Textarea } from '../../components/ui'
import { useToast } from '../../context/ToastContext'

export default function MedicineForm() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const toast = useToast()
  const isEdit = id !== undefined

  const [loading, setLoading] = useState(isEdit)
  const [submitting, setSubmitting] = useState(false)
  const [name, setName] = useState('')
  const [genericName, setGenericName] = useState('')
  const [code, setCode] = useState('')
  const [caution, setCaution] = useState('')

  useEffect(() => {
    if (!isEdit) return
    getMedicineById(Number(id))
      .then((m) => {
        setName(m.name)
        setGenericName(m.genericName ?? '')
        setCode(String(m.code))
        setCaution(m.caution)
      })
      .catch((err) => toast.error(err instanceof Error ? err.message : 'Failed to load'))
      .finally(() => setLoading(false))
  }, [id, isEdit, toast])

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error('Name is required')
      return
    }
    if (!code || Number(code) <= 0) {
      toast.error('Valid code is required')
      return
    }
    if (!caution.trim()) {
      toast.error('Caution is required')
      return
    }
    setSubmitting(true)
    try {
      const dto = {
        name: name.trim(),
        genericName: genericName.trim() || undefined,
        code: Number(code),
        caution: caution.trim(),
      }
      if (isEdit) {
        await updateMedicine(Number(id), dto)
        toast.success('Medicine updated.')
      } else {
        await createMedicine(dto)
        toast.success('Medicine created.')
      }
      navigate('/medicine')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <PageLoader />

  return (
    <>
      <Link to="/medicine" className="form-page-back">
        <ArrowLeftIcon width={14} height={14} /> Back to Medicines
      </Link>
      <div className="page-header">
        <h1 className="page-header__title">{isEdit ? 'Edit Medicine' : 'New Medicine'}</h1>
      </div>
      <Card>
        <div className="form-page__grid">
          <FormGroup>
            <Label htmlFor="name" required>
              Name
            </Label>
            <Input
              id="name"
              placeholder="Medicine name"
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
              type="number"
              placeholder="Code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
          </FormGroup>
          <FormGroup>
            <Label htmlFor="generic">Generic Name</Label>
            <Input
              id="generic"
              placeholder="Generic name"
              value={genericName}
              onChange={(e) => setGenericName(e.target.value)}
            />
          </FormGroup>
        </div>
        <FormGroup>
          <Label htmlFor="caution" required>
            Caution
          </Label>
          <Textarea
            id="caution"
            placeholder="Caution information"
            value={caution}
            onChange={(e) => setCaution(e.target.value)}
            rows={3}
          />
        </FormGroup>
      </Card>
      <div className="form-page__actions">
        <Button variant="secondary" onClick={() => navigate('/medicine')} disabled={submitting}>
          Cancel
        </Button>
        <Button loading={submitting} onClick={handleSubmit}>
          {isEdit ? 'Save Changes' : 'Create Medicine'}
        </Button>
      </div>
    </>
  )
}
