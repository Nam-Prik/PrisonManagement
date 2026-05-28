export type IrregularityType =
  | 'MissingPrisoner'
  | 'ItemLost'
  | 'ProhibitedItem'
  | 'ContrabandFound'
  | 'Assault'
  | 'RiotAttempt'
  | 'Vandalism'
  | 'EscapeAttempt'
  | 'MedicalEmergency'

export type Severity = 'None' | 'Low' | 'Medium' | 'High' | 'Critical' | 'Fatal'

// ── DB Row Types ─────────────────────────────────────────────

export interface InspectionListRow {
  id: number
  code: string
  reason: string
  routine_name: string
  irregularity_count: number
}

export interface InspectionDetailHeadRow {
  id: number
  code: string
  reason: string
  routine_id: number
  routine_name: string
}

export interface InspectionDetailLineRow {
  found_irregularity_id: number
  irregularity_description: string
  irregularity_type: IrregularityType
  severity: Severity
  result_description: string
}

// ── Clean API Types ──────────────────────────────────────────

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
  irregularityType: IrregularityType
  severity: Severity
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

// ── Mappers ──────────────────────────────────────────────────

export const toInspectionListItem = (row: InspectionListRow): InspectionListItem => ({
  id: row.id,
  code: row.code,
  reason: row.reason,
  routineName: row.routine_name,
  irregularityCount: Number(row.irregularity_count),
})

export const toInspectionDetailResult = (row: InspectionDetailLineRow): InspectionDetailResult => ({
  foundIrregularityId: row.found_irregularity_id,
  irregularityDescription: row.irregularity_description,
  irregularityType: row.irregularity_type,
  severity: row.severity,
  resultDescription: row.result_description,
})

export const toInspectionDetail = (
  head: InspectionDetailHeadRow,
  lines: InspectionDetailLineRow[]
): InspectionDetail => ({
  id: head.id,
  code: head.code,
  reason: head.reason,
  routineId: head.routine_id,
  routineName: head.routine_name,
  results: lines.map(toInspectionDetailResult),
})
