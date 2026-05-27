import { z } from 'zod'

const genderValues = ['M', 'F', 'Other', 'Undisclosed'] as const

export const CreateNurseSchema = z.object({
  personId: z.number().int().positive('Person ID is required'),
  code: z.string().min(1, 'Code is required'),
  gender: z.enum(genderValues),
})

export type CreateNurseDto = z.infer<typeof CreateNurseSchema>

export const UpdateNurseSchema = CreateNurseSchema.partial()

export type UpdateNurseDto = z.infer<typeof UpdateNurseSchema>
