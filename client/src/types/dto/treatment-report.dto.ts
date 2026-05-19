export interface TreatmentExperience {
  id: number
  prisonerId: number
  nurseId: number
  diagnoseDate: string
  prisonerFirstName: string
  prisonerLastName: string
  nurseFirstName: string
  nurseLastName: string
  description: string
}

export interface MedicinePrescriptionExperience {
  code: string
  name: string
  genericName: string | null
  usageCount: number
  caution: string
}

export interface NurseWorkloadPercentage {
  firstName: string
  lastName: string
  workloadPercentage: number
}
