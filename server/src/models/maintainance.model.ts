import type { MaintenanceSkill, Specialization } from './maintainer.model.js'

export type MaintStatus =
  | 'Reported'
  | 'Pending Approval'
  | 'Scheduled'
  | 'In progress'
  | 'On Hold'
  | 'Done'
  | 'Cancelled'

// ── DB row types ─────────────────────────────────────────────

export interface MaintainanceRow {
  id: number
  prison_location_id: number
  location_name: string
  location_code: string
  maintainance_date: Date
  maintainance_cost: number
  status: MaintStatus
  labor_count: string
}

export interface MaintainanceDetailRow {
  id: number
  prison_location_id: number
  location_name: string
  maintainance_date: Date
  maintainance_cost: number
  status: MaintStatus
}

export interface LaborItemRow {
  maintainer_id: number
  labor_task: string
  first_name: string
  last_name: string
  maintainance_skill: MaintenanceSkill
  skill_description: string | null
  company_name: string
  specialization: Specialization
}

// ── Clean API types (JSON wire format) ───────────────────────

export interface LaborItem {
  maintainerId: number
  laborTask: string
  maintainerFirstName: string
  maintainerLastName: string
  maintenanceSkill: MaintenanceSkill
  skillDescription: string | null
  companyName: string
  specialization: Specialization
}

export interface MaintainanceListItem {
  id: number
  prisonLocationId: number
  locationName: string
  locationCode: string
  maintainanceDate: string
  maintainanceCost: number
  status: MaintStatus
  laborCount: number
}

export interface MaintainanceDetail {
  id: number
  prisonLocationId: number
  locationName: string
  maintainanceDate: string
  maintainanceCost: number
  status: MaintStatus
  laborItems: LaborItem[]
}

// ── Mappers ──────────────────────────────────────────────────

export const toMaintainanceListItem = (row: MaintainanceRow): MaintainanceListItem => ({
  id: row.id,
  prisonLocationId: row.prison_location_id,
  locationName: row.location_name,
  locationCode: row.location_code,
  maintainanceDate: row.maintainance_date.toISOString(),
  maintainanceCost: Number(row.maintainance_cost),
  status: row.status,
  laborCount: Number(row.labor_count),
})

export const toLaborItem = (row: LaborItemRow): LaborItem => ({
  maintainerId: row.maintainer_id,
  laborTask: row.labor_task,
  maintainerFirstName: row.first_name,
  maintainerLastName: row.last_name,
  maintenanceSkill: row.maintainance_skill,
  skillDescription: row.skill_description,
  companyName: row.company_name,
  specialization: row.specialization,
})

export const toMaintainanceDetail = (
  row: MaintainanceDetailRow,
  laborItems: LaborItem[]
): MaintainanceDetail => ({
  id: row.id,
  prisonLocationId: row.prison_location_id,
  locationName: row.location_name,
  maintainanceDate: row.maintainance_date.toISOString(),
  maintainanceCost: Number(row.maintainance_cost),
  status: row.status,
  laborItems,
})
