export interface ConfiscatedItemInput {
  itemName: string
  quantity: number
  remarks?: string
}

export interface CreatePrisonerIntakeDto {
  prisonerId: number
  intakeDate: string
  initialHealthStatus: string
  confiscatedItems: ConfiscatedItemInput[]
}

export interface UpdatePrisonerIntakeDto {
  intakeDate?: string
  initialHealthStatus?: string
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
  prisonerId: number | null
  prisonerCode: string | null
  prisonerName: string | null
  intakeDate: string
  initialHealthStatus: string
  itemCount: number
}

export interface PrisonerIntakeDetail {
  id: number
  prisonerId: number | null
  prisonerCode: string | null
  prisonerName: string | null
  prisonerPersonId: number | null
  intakeDate: string
  initialHealthStatus: string
  confiscatedItems: ConfiscatedItemDetail[]
}

export const HEALTH_STATUSES = [
  'Cleared',
  'Routine Follow-up',
  'Observation',
  'Quarantined',
  'Hospitalized',
  'Critical',
  'Deceased',
]
