import { z } from 'zod'

export const CreatePrisonerSchema = z.object({
  personId: z.number().int().positive('Person ID is required'),
  evaluation: z.string().optional().default(''),
})
export type CreatePrisonerDto = z.infer<typeof CreatePrisonerSchema>

export const UpdatePrisonerSchema = z.object({
  evaluation: z.string().optional().default(''),
})
export type UpdatePrisonerDto = z.infer<typeof UpdatePrisonerSchema>

export const CreatePrisonerWithPersonSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  identificationNo: z.string().optional(),
  gender: z.enum(['M', 'F', 'Other', 'Undisclosed'], { message: 'Invalid gender' }),
  address: z.string().min(1, 'Address is required'),
  contactNo: z.string().min(1, 'Contact number is required'),
  age: z.number().int().positive('Age must be a positive number'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  bloodType: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'], {
    message: 'Invalid blood type',
  }),
  evaluation: z.string().optional().default(''),
})

export interface PrisonerListItem {
  id: number
  code: string
  identificationNo: string | null
  firstName: string
  lastName: string
  age: number
  evaluation: string | null
  evaluationScore: number | null
  hasMugshot: boolean
}

export interface PrisonerDetail {
  id: number
  code: string
  personId: number
  identificationNo: string | null
  firstName: string
  lastName: string
  gender: string
  address: string
  contactNo: string
  age: number
  dateOfBirth: string
  bloodType: string
  evaluation: string | null
  evaluationScore: number | null
  mugshotImgKey: string | null
  prisonIntakeId: number | null
}

export interface CreatePrisonerWithPersonDto {
  firstName: string
  lastName: string
  identificationNo?: string
  gender: string
  address: string
  contactNo: string
  age: number
  dateOfBirth: string
  bloodType: string
  evaluation?: string
}
