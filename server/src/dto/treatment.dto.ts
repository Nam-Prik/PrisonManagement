import { z } from 'zod'

const PrescriptionInputSchema = z.object({
  medicineId: z.number().int().positive(),
  dosage: z.number().int().min(1),
  frequency: z.number().int().min(1),
  duration: z.number().int().min(1),
})

export type PrescriptionInput = z.infer<typeof PrescriptionInputSchema>

export const CreateTreatmentSchema = z.object({
  prisonerId: z.number().int().positive('Prisoner is required'),
  nurseId: z.number().int().positive('Nurse is required'),
  description: z.string().max(255).optional(),
  diagnoseDate: z.string().date('Expected YYYY-MM-DD'),
  prescriptions: z.array(PrescriptionInputSchema).default([]),
})

export type CreateTreatmentDto = z.infer<typeof CreateTreatmentSchema>

export const UpdateTreatmentSchema = CreateTreatmentSchema
export type UpdateTreatmentDto = CreateTreatmentDto
