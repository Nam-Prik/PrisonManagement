import { ArrowLeftIcon } from '@radix-ui/react-icons'
import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { getPersons } from '../../api/person.api'
import { createPrisoner, getPrisonerById, updatePrisoner } from '../../api/prisoner.api'
import { uploadMugshot } from '../../api/prisonerintake.api'
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
import type { Person } from '../../types/dto/person.dto'

export default function PrisonerForm() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const toast = useToast()
  const isEdit = id !== undefined
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [persons, setPersons] = useState<Person[]>([])

  const [personId, setPersonId] = useState('')
  const [prisonIntakeId, setPrisonIntakeId] = useState('')
  const [code, setCode] = useState('')
  const [evaluation, setEvaluation] = useState('')
  const [evaluationScore, setEvaluationScore] = useState('')
  const [mugshotImgKey, setMugshotImgKey] = useState('')
  const [mugshotFile, setMugshotFile] = useState<File | null>(null)
  const [mugshotPreview, setMugshotPreview] = useState<string | null>(null)

  useEffect(() => {
    return () => {
      if (mugshotPreview) URL.revokeObjectURL(mugshotPreview)
    }
  }, [mugshotPreview])

  useEffect(() => {
    const loads: Promise<unknown>[] = [getPersons().then(setPersons)]
    if (isEdit) {
      loads.push(
        getPrisonerById(Number(id)).then((p) => {
          setPersonId(String(p.personId))
          setPrisonIntakeId(String(p.prisonIntakeId))
          setCode(p.code)
          setEvaluation(p.evaluation ?? '')
          setEvaluationScore(p.evaluationScore != null ? String(p.evaluationScore) : '')
          setMugshotImgKey(p.mugshotImgKey ?? '')
        })
      )
    }
    Promise.all(loads)
      .catch((err) => toast.error(err instanceof Error ? err.message : 'Failed to load'))
      .finally(() => setLoading(false))
  }, [id, isEdit, toast])

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

  const handleSubmit = async () => {
    if (!isEdit && !personId) {
      toast.error('Person is required')
      return
    }
    if (!isEdit && !prisonIntakeId) {
      toast.error('Prison intake ID is required')
      return
    }
    if (!code.trim()) {
      toast.error('Code is required')
      return
    }
    setSubmitting(true)
    try {
      let imgKey = mugshotImgKey
      if (mugshotFile) {
        try {
          imgKey = await uploadMugshot(mugshotFile)
        } catch (err) {
          toast.error(
            `Mugshot upload failed — ${err instanceof Error ? err.message : 'unknown error'}`
          )
        }
      }
      if (isEdit) {
        await updatePrisoner(Number(id), {
          code: code.trim(),
          mugshotImgKey: imgKey || undefined,
          evaluation: evaluation.trim() || undefined,
          evaluationScore: evaluationScore ? Number(evaluationScore) : undefined,
        })
        toast.success('Prisoner updated.')
      } else {
        await createPrisoner({
          personId: Number(personId),
          prisonIntakeId: Number(prisonIntakeId),
          code: code.trim(),
          mugshotImgKey: imgKey || undefined,
          evaluation: evaluation.trim() || undefined,
          evaluationScore: evaluationScore ? Number(evaluationScore) : undefined,
        })
        toast.success('Prisoner created.')
      }
      navigate('/prisoner')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSubmitting(false)
    }
  }

  const personOptions = persons.map((p) => ({
    value: String(p.id),
    label: `[#${p.id}] ${p.firstName} ${p.lastName}`,
  }))

  if (loading) return <PageLoader />

  return (
    <>
      <Link to="/prisoner" className="form-page-back">
        <ArrowLeftIcon width={14} height={14} /> Back to Prisoners
      </Link>
      <div className="page-header">
        <h1 className="page-header__title">{isEdit ? 'Edit Prisoner' : 'New Prisoner'}</h1>
      </div>
      <Card>
        <div className="form-page__grid">
          {!isEdit && (
            <>
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
                <Label htmlFor="intake-id" required>
                  Prison Intake ID
                </Label>
                <Input
                  id="intake-id"
                  type="number"
                  placeholder="Prison intake record ID"
                  value={prisonIntakeId}
                  onChange={(e) => setPrisonIntakeId(e.target.value)}
                />
              </FormGroup>
            </>
          )}
          <FormGroup>
            <Label htmlFor="code" required>
              Code
            </Label>
            <Input
              id="code"
              placeholder="Prisoner code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
          </FormGroup>
          <FormGroup>
            <Label htmlFor="eval-score">Evaluation Score</Label>
            <Input
              id="eval-score"
              type="number"
              min="0"
              max="100"
              placeholder="0–100"
              value={evaluationScore}
              onChange={(e) => setEvaluationScore(e.target.value)}
            />
          </FormGroup>
        </div>

        <FormGroup>
          <Label htmlFor="eval">Evaluation Notes</Label>
          <Textarea
            id="eval"
            placeholder="Optional evaluation remarks"
            value={evaluation}
            onChange={(e) => setEvaluation(e.target.value)}
            rows={3}
          />
        </FormGroup>

        <FormGroup>
          <Label>Mugshot</Label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleMugshotChange}
          />
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            {mugshotPreview && (
              <img
                src={mugshotPreview}
                alt="Mugshot preview"
                style={{ width: 80, height: 100, objectFit: 'cover', borderRadius: 4 }}
              />
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                {mugshotPreview || mugshotImgKey ? 'Change Photo' : 'Upload Photo'}
              </Button>
              {mugshotImgKey && !mugshotPreview && (
                <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                  Photo on file
                </span>
              )}
            </div>
          </div>
        </FormGroup>
      </Card>
      <div className="form-page__actions">
        <Button variant="secondary" onClick={() => navigate('/prisoner')} disabled={submitting}>
          Cancel
        </Button>
        <Button loading={submitting} onClick={handleSubmit}>
          {isEdit ? 'Save Changes' : 'Create Prisoner'}
        </Button>
      </div>
    </>
  )
}
