// ── DB row types ─────────────────────────────────────────────

export interface TreatmentExperienceRow {
  id: number
  prisoner_id: number
  nurse_id: number
  diagnose_date: string
  prisoner_first_name: string
  prisoner_last_name: string
  nurse_first_name: string
  nurse_last_name: string
  description: string
}

export interface MedicinePrescriptionExperienceRow {
  code: string
  name: string
  generic_name: string | null
  usage_count: string
  caution: string
}

export interface NurseWorkloadPercentageRow {
  first_name: string
  last_name: string
  workload_percentage: string
}

// ── Clean API types ───────────────────────────────────────────

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

// ── Mappers ──────────────────────────────────────────────────

export const toTreatmentExperience = (row: TreatmentExperienceRow): TreatmentExperience => ({
  id: row.id,
  prisonerId: row.prisoner_id,
  nurseId: row.nurse_id,
  diagnoseDate: row.diagnose_date,
  prisonerFirstName: row.prisoner_first_name,
  prisonerLastName: row.prisoner_last_name,
  nurseFirstName: row.nurse_first_name,
  nurseLastName: row.nurse_last_name,
  description: row.description,
})

export const toMedicinePrescriptionExperience = (
  row: MedicinePrescriptionExperienceRow
): MedicinePrescriptionExperience => ({
  code: row.code,
  name: row.name,
  genericName: row.generic_name,
  usageCount: Number(row.usage_count),
  caution: row.caution,
})

export const toNurseWorkloadPercentage = (
  row: NurseWorkloadPercentageRow
): NurseWorkloadPercentage => ({
  firstName: row.first_name,
  lastName: row.last_name,
  workloadPercentage: Number(row.workload_percentage),
})
