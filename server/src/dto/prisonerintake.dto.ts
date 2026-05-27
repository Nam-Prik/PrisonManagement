import { z } from 'zod'

const HEALTH_STATUS_ENUM = z.enum([
  'Cleared',
  'Routine Follow-up',
  'Observation',
  'Quarantined',
  'Hospitalized',
  'Critical',
  'Deceased',
])

const ConfiscatedItemSchema = z.object({
  itemName: z.string().min(1),
  quantity: z.number().int().positive(),
  remarks: z.string().max(255).optional(),
})

export const CreatePrisonerIntakeSchema = z.object({
  intakeDate: z.string().min(1, 'Intake date is required'),
  initialHealthStatus: HEALTH_STATUS_ENUM,
  confiscatedItems: z.array(ConfiscatedItemSchema).default([]),
})

export type CreatePrisonerIntakeDto = z.infer<typeof CreatePrisonerIntakeSchema>

export const UpdatePrisonerIntakeSchema = z.object({
  intakeDate: z.string().min(1).optional(),
  initialHealthStatus: HEALTH_STATUS_ENUM.optional(),
  mugshotImgKey: z.string().optional(),
  confiscatedItems: z.array(ConfiscatedItemSchema).optional(),
})

export type UpdatePrisonerIntakeDto = z.infer<typeof UpdatePrisonerIntakeSchema>
