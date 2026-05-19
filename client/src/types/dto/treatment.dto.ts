export interface NurseOption {
  id: number
  code: string
  firstName: string
  lastName: string
}

export interface TreatmentDetail {
  id: number
  prisonerId: number
  nurseId: number
  description: string
  diagnoseDate: string
}

export interface TreatmentListItem {
  id: number
  prisonerId: number
  prisonerCode: string
  prisonerFirstName: string
  prisonerLastName: string
  nurseId: number
  nurseCode: string
  nurseFirstName: string
  nurseLastName: string
  diagnoseDate: string
  description: string
}

export interface CreateTreatmentDto {
  prisonerId: number
  nurseId: number
  description: string
  diagnoseDate: string
}

export type UpdateTreatmentDto = CreateTreatmentDto

export interface TreatmentFormData extends TreatmentDetail {}
