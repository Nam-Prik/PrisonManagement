export const MAINTENANCE_SKILLS = [
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

export type MaintenanceSkill = (typeof MAINTENANCE_SKILLS)[number]

export const SPECIALIZATIONS = [
  'K9 Handler',
  'Riot Control',
  'Crisis Negotiator',
  'Transport Officer',
  'Gang Intelligence',
  'Armory Manager',
  'Narcotics Detection',
  'First Aid Responder',
] as const

export type Specialization = (typeof SPECIALIZATIONS)[number]

export const GENDERS = ['M', 'F', 'Other', 'Undisclosed'] as const
export type Gender = (typeof GENDERS)[number]

export const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'] as const
export type BloodType = (typeof BLOOD_TYPES)[number]

export interface MaintainerOption {
  id: number
  firstName: string
  lastName: string
  maintenanceSkill: string
  skillDescription: string | null
  companyName: string
  specialization: string
}

export interface Maintainer {
  id: number
  personId: number
  maintenanceSkill: MaintenanceSkill
  skillDescription: string | null
  companyName: string
  specialization: Specialization
  firstName: string
  lastName: string
  identificationNo: string | null
  gender: Gender
  address: string
  contactNo: string
  age: number
  dateOfBirth: string
  bloodType: BloodType
}

export interface CreateMaintainerDto {
  personId: number
  maintenanceSkill: MaintenanceSkill
  skillDescription?: string
  companyName: string
  specialization: Specialization
}

export type UpdateMaintainerDto = Partial<CreateMaintainerDto>
