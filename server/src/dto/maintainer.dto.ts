import { z } from 'zod'

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
  personId: z.number().int().positive('Person ID is required'),
  maintenanceSkill: z.enum(maintenanceSkillValues),
  skillDescription: z.string().optional(),
  companyName: z.string().min(1, 'Company name is required'),
  specialization: z.enum(specializationValues),
})

export type CreateMaintainerDto = z.infer<typeof CreateMaintainerSchema>

export const UpdateMaintainerSchema = z.object({
  personId: z.number().int().positive('Person ID is required').optional(),
  maintenanceSkill: z.enum(maintenanceSkillValues).optional(),
  skillDescription: z.string().optional(),
  companyName: z.string().min(1).optional(),
  specialization: z.enum(specializationValues).optional(),
})

export type UpdateMaintainerDto = z.infer<typeof UpdateMaintainerSchema>
