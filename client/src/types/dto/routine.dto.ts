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
  officerCode: number | string
  officerName: string
}

export interface RoutineDetail {
  id: number
  routineName: string
  prisonLocationId: number
  scheduleDate: string
  type: string
  officers: RoutineOfficer[]
  inspection?: {
    id: number
    code: string
    reason: string
    results: {
      foundIrregularityId: number
      irregularityType: string
      severity: string
      resultDescription: string
    }[]
  }
}

export interface CreateRoutineDto {
  routineName: string
  prisonLocationId: number
  routinesScheduleDate: string
  type: RoutineType | string
  officerIds: number[]

  inspectionReason?: string
  inspectionResults?: {
    foundIrregularityId: number
    resultDescription: string
  }[]
}

export type UpdateRoutineDto = Partial<CreateRoutineDto>
