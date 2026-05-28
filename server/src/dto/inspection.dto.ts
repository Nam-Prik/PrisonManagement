import { z } from 'zod'

export const InspectionResultInputSchema = z.object({
  foundIrregularityId: z.number().int().positive('Irregularity ID is required'),
  resultDescription: z.string().min(1, 'Result description is required'),
})

export const CreateInspectionSchema = z.object({
  code: z.string().min(1, 'Inspection code is required'),
  reason: z.string().min(1, 'Inspection reason is required'),
  routineId: z.number().int().positive('Routine ID is required'),
  results: z.array(InspectionResultInputSchema).default([]),
})

export type CreateInspectionDto = z.infer<typeof CreateInspectionSchema>

// Making fields optional for the Update DTO, matching the maintainer pattern.
// Note: `results` usually requires a full array payload to wipe-and-replace line items.
export const UpdateInspectionSchema = z.object({
  code: z.string().min(1).optional(),
  reason: z.string().min(1).optional(),
  routineId: z.number().int().positive().optional(),
  results: z.array(InspectionResultInputSchema).optional(),
})

export type UpdateInspectionDto = z.infer<typeof UpdateInspectionSchema>
