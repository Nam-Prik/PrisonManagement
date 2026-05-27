import { z } from 'zod'

export const CreatePrisonLocationSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  code: z.string().min(1, 'Code is required'),
  purpose: z.string().min(1, 'Purpose is required'),
  maxCapacity: z.number().int().positive('Max capacity must be a positive integer'),
})

export type CreatePrisonLocationDto = z.infer<typeof CreatePrisonLocationSchema>

export const UpdatePrisonLocationSchema = CreatePrisonLocationSchema.partial()

export type UpdatePrisonLocationDto = z.infer<typeof UpdatePrisonLocationSchema>
