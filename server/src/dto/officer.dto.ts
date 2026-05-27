import { z } from 'zod'

const genderValues = ['M', 'F', 'Other', 'Undisclosed'] as const
const rankValues = [
  'Warden',
  'Deputy Warden',
  'Chief Jailer',
  'Captain',
  'Lieutenant',
  'Sergeant',
  'Corporal',
  'Guard',
  'Trainee',
] as const

export const CreateOfficerSchema = z.object({
  personId: z.number().int().positive('Person ID is required'),
  code: z.number().int().positive('Code must be a positive integer'),
  rank: z.enum(rankValues),
  gender: z.enum(genderValues),
})

export type CreateOfficerDto = z.infer<typeof CreateOfficerSchema>

export const UpdateOfficerSchema = CreateOfficerSchema.partial()

export type UpdateOfficerDto = z.infer<typeof UpdateOfficerSchema>
