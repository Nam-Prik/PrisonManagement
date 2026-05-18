import { z } from 'zod'

export const ConfiscatedItemInputSchema = z.object({
  itemName: z.string().min(1, 'Item name is required'),
  quantity: z.number().int().positive('Quantity must be positive'),
  remarks: z.string().optional(),
})

export type ConfiscatedItemInput = z.infer<typeof ConfiscatedItemInputSchema>

export const CreatePrisonerIntakeSchema = z.object({
  prisonerId: z.number().int().positive('Prisoner ID is required'),
  intakeDate: z.string().min(1, 'Intake date is required'),
  initialHealthStatus: z.enum([
    'Cleared',
    'Routine Follow-up',
    'Observation',
    'Quarantined',
    'Hospitalized',
    'Critical',
    'Deceased',
  ]),
  confiscatedItems: z.array(ConfiscatedItemInputSchema).default([]),
})

export type CreatePrisonerIntakeDto = z.infer<typeof CreatePrisonerIntakeSchema>

export const UpdatePrisonerIntakeSchema = z.object({
  intakeDate: z.string().optional(),
  initialHealthStatus: z
    .enum([
      'Cleared',
      'Routine Follow-up',
      'Observation',
      'Quarantined',
      'Hospitalized',
      'Critical',
      'Deceased',
    ])
    .optional(),
  confiscatedItems: z.array(ConfiscatedItemInputSchema).optional(),
})

export type UpdatePrisonerIntakeDto = z.infer<typeof UpdatePrisonerIntakeSchema>

export interface ConfiscatedItemDetail {
  id: number
  itemName: string
  quantity: number
  remarks: string | null
}

export interface PrisonerIntakeListItem {
  id: number
  prisonerId: number | null
  prisonerCode: string | null
  prisonerName: string | null
  intakeDate: string
  initialHealthStatus: string
  itemCount: number
}

export interface PrisonerIntakeDetail {
  id: number
  prisonerId: number | null
  prisonerCode: string | null
  prisonerName: string | null
  prisonerPersonId: number | null
  intakeDate: string
  initialHealthStatus: string
  confiscatedItems: ConfiscatedItemDetail[]
}

export const HEALTH_STATUSES = [
  'Cleared',
  'Routine Follow-up',
  'Observation',
  'Quarantined',
  'Hospitalized',
  'Critical',
  'Deceased',
]
