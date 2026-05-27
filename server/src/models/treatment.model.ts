export interface TreatmentDetailRow {
  id: number
  prisoner_id: number
  nurse_id: number
  description: string | null
  diagnose_date: string
}

export interface PrescriptionRow {
  id: number
  medicine_id: number
  medicine_name: string
  medicine_code: number
  dosage: number
  frequency: number
  duration: number
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

export interface TreatmentDetail {
  id: number
  prisonerId: number
  nurseId: number
  description: string
  diagnoseDate: string
  prescriptions: Prescription[]
}

export interface TreatmentListRow {
  id: number
  prisoner_id: number
  prisoner_code: string
  prisoner_first_name: string
  prisoner_last_name: string
  nurse_id: number
  nurse_code: string
  nurse_first_name: string
  nurse_last_name: string
  diagnose_date: string
  description: string | null
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

export interface NurseOptionRow {
  id: number
  code: string
  first_name: string
  last_name: string
}

export interface NurseOption {
  id: number
  code: string
  firstName: string
  lastName: string
}

export const toPrescription = (row: PrescriptionRow): Prescription => ({
  id: row.id,
  medicineId: row.medicine_id,
  medicineName: row.medicine_name,
  medicineCode: row.medicine_code,
  dosage: row.dosage,
  frequency: row.frequency,
  duration: row.duration,
})

export const toTreatmentDetail = (
  row: TreatmentDetailRow,
  prescriptions: Prescription[] = []
): TreatmentDetail => ({
  id: row.id,
  prisonerId: row.prisoner_id,
  nurseId: row.nurse_id,
  description: row.description ?? '',
  diagnoseDate: row.diagnose_date,
  prescriptions,
})

export const toTreatmentListItem = (row: TreatmentListRow): TreatmentListItem => ({
  id: row.id,
  prisonerId: row.prisoner_id,
  prisonerCode: row.prisoner_code,
  prisonerFirstName: row.prisoner_first_name,
  prisonerLastName: row.prisoner_last_name,
  nurseId: row.nurse_id,
  nurseCode: row.nurse_code,
  nurseFirstName: row.nurse_first_name,
  nurseLastName: row.nurse_last_name,
  diagnoseDate: row.diagnose_date,
  description: row.description ?? '',
})

export const toNurseOption = (row: NurseOptionRow): NurseOption => ({
  id: row.id,
  code: row.code,
  firstName: row.first_name,
  lastName: row.last_name,
})
