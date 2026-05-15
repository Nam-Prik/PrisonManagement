export type MaintenanceSkill =
  | 'Plumbing'
  | 'Electrical'
  | 'HVAC'
  | 'Carpentry'
  | 'Masonry'
  | 'Welding'
  | 'Locksmithing'
  | 'Painting'
  | 'General Maintenance'

export type Specialization =
  | 'K9 Handler'
  | 'Riot Control'
  | 'Crisis Negotiator'
  | 'Transport Officer'
  | 'Gang Intelligence'
  | 'Armory Manager'
  | 'Narcotics Detection'
  | 'First Aid Responder'

export type Gender = 'M' | 'F' | 'Other' | 'Undisclosed'

export type BloodType = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | 'Unknown'

// Raw DB row from JOIN on person
export interface MaintainerRow {
  id: number
  person_id: number
  maintainance_skill: MaintenanceSkill // DB column has typo — preserved as-is
  skill_description: string | null
  company_name: string
  specialization: Specialization
  first_name: string
  last_name: string
  identification_no: string | null
  gender: Gender
  address: string
  contact_no: string
  age: number
  date_of_birth: Date
  blood_type: BloodType
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
  dateOfBirth: Date
  bloodType: BloodType
}

export const toMaintainer = (row: MaintainerRow): Maintainer => ({
  id: row.id,
  personId: row.person_id,
  maintenanceSkill: row.maintainance_skill,
  skillDescription: row.skill_description,
  companyName: row.company_name,
  specialization: row.specialization,
  firstName: row.first_name,
  lastName: row.last_name,
  identificationNo: row.identification_no,
  gender: row.gender,
  address: row.address,
  contactNo: row.contact_no,
  age: row.age,
  dateOfBirth: row.date_of_birth,
  bloodType: row.blood_type,
})
