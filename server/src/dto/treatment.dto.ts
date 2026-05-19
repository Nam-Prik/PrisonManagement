import { z } from 'zod'

export const CreateTreatmentSchema = z.object({
  prisonerId: z.number().int().positive('Prisoner is required'),
  nurseId: z.number().int().positive('Nurse is required'),
  description: z.string().max(255).optional(),
  diagnoseDate: z.string().date('Expected YYYY-MM-DD'),
})

export type CreateTreatmentDto = z.infer<typeof CreateTreatmentSchema>

export const UpdateTreatmentSchema = CreateTreatmentSchema
export type UpdateTreatmentDto = CreateTreatmentDto
