export type MaintStatus =
  | 'Reported'
  | 'Pending Approval'
  | 'Scheduled'
  | 'In progress'
  | 'On Hold'
  | 'Done'
  | 'Cancelled'

export const MAINT_STATUSES: MaintStatus[] = [
  'Reported',
  'Pending Approval',
  'Scheduled',
  'In progress',
  'On Hold',
  'Done',
  'Cancelled',
]

export interface LaborItem {
  maintainerId: number
  laborTask: string
  maintainerFirstName: string
  maintainerLastName: string
  maintenanceSkill: string
  skillDescription: string | null
  companyName: string
  specialization: string
}

export interface MaintainanceListItem {
  id: number
  prisonLocationId: number
  locationName: string
  locationCode: string
  maintainanceDate: string // ISO string from JSON
  maintainanceCost: number
  status: MaintStatus
  laborCount: number
}

export interface MaintainanceDetail {
  id: number
  prisonLocationId: number
  locationName: string
  maintainanceDate: string // ISO string from JSON
  maintainanceCost: number
  status: MaintStatus
  laborItems: LaborItem[]
}

export interface CreateMaintainanceDto {
  prisonLocationId: number
  maintainanceDate: string // YYYY-MM-DD
  maintainanceCost: number
  status: MaintStatus
  laborItems: Array<{ maintainerId: number; laborTask: string }>
}

export type UpdateMaintainanceDto = CreateMaintainanceDto
