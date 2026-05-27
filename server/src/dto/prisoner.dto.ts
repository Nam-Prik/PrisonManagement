import { z } from 'zod'

export const CreatePrisonerSchema = z.object({
  personId: z.number().int().positive('Person ID is required'),
  prisonIntakeId: z.number().int().positive('Prison intake ID is required'),
  code: z.string().min(1, 'Code is required'),
  mugshotImgKey: z.string().optional(),
  evaluation: z.string().max(255).optional(),
  evaluationScore: z.number().int().min(0).max(100).optional(),
})

export type CreatePrisonerDto = z.infer<typeof CreatePrisonerSchema>

export const UpdatePrisonerSchema = z.object({
  code: z.string().min(1).optional(),
  mugshotImgKey: z.string().optional(),
  evaluation: z.string().max(255).optional(),
  evaluationScore: z.number().int().min(0).max(100).optional(),
})

export type UpdatePrisonerDto = z.infer<typeof UpdatePrisonerSchema>
