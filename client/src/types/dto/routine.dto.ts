export const ROUTINE_TYPES = [
  'Patrol',
  'Guard Post',
  'Inspection',
  'Inmate Escort',
  'Cell Search',
  'Tower Watch',
  'Recreation Supervision',
  'Cafeteria Duty',
  'Perimeter Check',
] as const

export type RoutineType = (typeof ROUTINE_TYPES)[number]

export interface RoutineOption {
  id: number
  routineName: string
  type: string
  locationName: string
}

export interface RoutineListItem {
  id: number
  routineName: string
  locationName: string
  scheduleDate: string
  type: string
  officerCount: number
}

export interface RoutineOfficer {
  officerId: number
  officerName: string
  officerCode: number
}

export interface RoutineDetail {
  id: number
  routineName: string
  prisonLocationId: number
  scheduleDate: string
  type: string
  officers: RoutineOfficer[]
}

export interface CreateRoutineDto {
  routineName: string
  prisonLocationId: number
  routinesScheduleDate: string // YYYY-MM-DD
  type: RoutineType
  officerIds: number[]
}

export type UpdateRoutineDto = Partial<CreateRoutineDto>
