export interface NurseOption {
  id: number
  code: string
  firstName: string
  lastName: string
}

export interface Prescription {
  id: number
  medicineId: number
  medicineName: string
  medicineCode: number
  dosage: number
  frequency: number
  duration: number
}

export interface PrescriptionDraft {
  medicineId: number
  medicineName: string
  medicineCode: number
  dosage: number
  frequency: number
  duration: number
}

export interface TreatmentDetail {
  id: number
  prisonerId: number
  nurseId: number
  description: string
  diagnoseDate: string
  prescriptions: Prescription[]
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
  prescriptions: PrescriptionDraft[]
}

export type UpdateTreatmentDto = CreateTreatmentDto

export interface TreatmentFormData extends TreatmentDetail {}
