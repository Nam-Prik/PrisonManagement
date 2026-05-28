export interface InspectionListItem {
  id: number
  code: string
  reason: string
  routineName: string
  irregularityCount: number
}

export interface InspectionDetailResult {
  foundIrregularityId: number
  irregularityDescription: string
  irregularityType: string
  severity: string
  resultDescription: string
}

export interface InspectionDetail {
  id: number
  code: string
  reason: string
  routineId: number
  routineName: string
  results: InspectionDetailResult[]
}

export interface CreateInspectionDto {
  code: string
  reason: string
  routineId: number
  results: {
    foundIrregularityId: number
    resultDescription: string
  }[]
}

export interface UpdateInspectionDto {
  code?: string
  reason?: string
  routineId?: number
  results?: {
    foundIrregularityId: number
    resultDescription: string
  }[]
}
