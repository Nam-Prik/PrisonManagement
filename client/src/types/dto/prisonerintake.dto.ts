export const HEALTH_STATUSES = [
  'Cleared',
  'Routine Follow-up',
  'Observation',
  'Quarantined',
  'Hospitalized',
  'Critical',
  'Deceased',
] as const

export type HealthStatus = (typeof HEALTH_STATUSES)[number]

export const GENDERS = ['M', 'F', 'Other', 'Undisclosed'] as const
export type Gender = (typeof GENDERS)[number]

export const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'] as const
export type BloodType = (typeof BLOOD_TYPES)[number]

export interface ConfiscatedItemInput {
  itemName: string
  quantity: number
  remarks?: string
}

export interface CreatePrisonerIntakeDto {
  intakeDate: string
  initialHealthStatus: HealthStatus
  confiscatedItems: ConfiscatedItemInput[]
}

export interface UpdatePrisonerIntakeDto {
  intakeDate?: string
  initialHealthStatus?: HealthStatus
  mugshotImgKey?: string
  confiscatedItems?: ConfiscatedItemInput[]
}

export interface ConfiscatedItemDetail {
  id: number
  itemName: string
  quantity: number
  remarks: string | null
}

export interface PrisonerIntakeListItem {
  id: number
  prisonerCode: string | null
  firstName: string | null
  lastName: string | null
  intakeDate: string
  initialHealthStatus: string
  itemCount: number
}

export interface PrisonerIntakeDetail {
  id: number
  prisonerId: number | null
  prisonerCode: string | null
  firstName: string | null
  lastName: string | null
  intakeDate: string
  initialHealthStatus: string
  mugshotImgKey: string | null
  mugshotSignedUrl: string | null
  confiscatedItems: ConfiscatedItemDetail[]
}

export interface IntakeByDateRange {
  prisonerCode: string
  prisonerName: string
  intakeDate: string
  initialHealthStatus: string
}

export interface ConfiscatedItemReport {
  prisonerCode: string
  intakeDate: string
  itemName: string
  quantity: number
  remarks: string | null
}

export interface TotalItemsPerIntake {
  intakeId: number
  prisonerCode: string
  intakeDate: string
  totalItems: number
}
