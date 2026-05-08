import { z } from 'zod'

const genderValues = ['M', 'F', 'Other', 'Undisclosed'] as const
const bloodTypeValues = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'] as const
const maintenanceSkillValues = [
  'Plumbing',
  'Electrical',
  'HVAC',
  'Carpentry',
  'Masonry',
  'Welding',
  'Locksmithing',
  'Painting',
  'General Maintenance',
] as const
const specializationValues = [
  'K9 Handler',
  'Riot Control',
  'Crisis Negotiator',
  'Transport Officer',
  'Gang Intelligence',
  'Armory Manager',
  'Narcotics Detection',
  'First Aid Responder',
] as const

export const CreateMaintainerSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  identificationNo: z.string().optional(),
  gender: z.enum(genderValues),
  address: z.string().min(1, 'Address is required'),
  contactNo: z.string().min(1, 'Contact number is required'),
  age: z.number().int().positive(),
  dateOfBirth: z.string().date('Invalid date format, expected YYYY-MM-DD'),
  bloodType: z.enum(bloodTypeValues),
  maintenanceSkill: z.enum(maintenanceSkillValues),
  skillDescription: z.string().optional(),
  companyName: z.string().min(1, 'Company name is required'),
  specialization: z.enum(specializationValues),
})

export type CreateMaintainerDto = z.infer<typeof CreateMaintainerSchema>

export const UpdateMaintainerSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  identificationNo: z.string().optional(),
  gender: z.enum(genderValues).optional(),
  address: z.string().min(1).optional(),
  contactNo: z.string().min(1).optional(),
  age: z.number().int().positive().optional(),
  dateOfBirth: z.string().date().optional(),
  bloodType: z.enum(bloodTypeValues).optional(),
  maintenanceSkill: z.enum(maintenanceSkillValues).optional(),
  skillDescription: z.string().optional(),
  companyName: z.string().min(1).optional(),
  specialization: z.enum(specializationValues).optional(),
})

export type UpdateMaintainerDto = z.infer<typeof UpdateMaintainerSchema>

export interface Maintainer {
  id: number
  personId: number
  maintenanceSkill: (typeof maintenanceSkillValues)[number]
  skillDescription: string | null
  companyName: string
  specialization: (typeof specializationValues)[number]
  firstName: string
  lastName: string
  identificationNo: string | null
  gender: (typeof genderValues)[number]
  address: string
  contactNo: string
  age: number
  dateOfBirth: string
  bloodType: (typeof bloodTypeValues)[number]
}
