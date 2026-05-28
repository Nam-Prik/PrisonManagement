export interface RoutineListRow {
  id: number
  routine_name: string
  location_name: string
  routines_schedule_date: Date
  type: string
  officer_count: number
}

export interface RoutineDetailRow {
  id: number
  routine_name: string
  prison_location_id: number
  routines_schedule_date: Date
  type: string
}

export interface RoutineOfficerRow {
  officer_id: number
  officer_name: string
  officer_code: number
}

export interface RoutineInspectionHeadRow {
  id: number
  code: string
  reason: string
}

export interface RoutineInspectionLineRow {
  found_irregularity_id: number
  result_description: string
  irregularity_type: string
  severity: string
}

export interface RoutineListItem {
  id: number
  routineName: string
  locationName: string
  scheduleDate: string
  type: string
  officerCount: number
}

export interface RoutineDetail {
  id: number
  routineName: string
  prisonLocationId: number
  scheduleDate: string
  type: string
  officers: {
    officerId: number
    officerName: string
    officerCode: number
  }[]
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

export function toRoutineListItem(row: RoutineListRow): RoutineListItem {
  return {
    id: row.id,
    routineName: row.routine_name,
    locationName: row.location_name,
    scheduleDate: row.routines_schedule_date.toISOString().split('T')[0],
    type: row.type,
    officerCount: row.officer_count,
  }
}

export function toRoutineDetail(
  head: RoutineDetailRow,
  lines: RoutineOfficerRow[],
  insHead?: RoutineInspectionHeadRow,
  insLines?: RoutineInspectionLineRow[]
): RoutineDetail {
  const detail: RoutineDetail = {
    id: head.id,
    routineName: head.routine_name,
    prisonLocationId: head.prison_location_id,
    scheduleDate: head.routines_schedule_date.toISOString().split('T')[0],
    type: head.type,
    officers: lines.map((l) => ({
      officerId: l.officer_id,
      officerName: l.officer_name,
      officerCode: l.officer_code,
    })),
  }

  if (insHead) {
    detail.inspection = {
      id: insHead.id,
      code: insHead.code,
      reason: insHead.reason,
      results: (insLines || []).map((l) => ({
        foundIrregularityId: l.found_irregularity_id,
        irregularityType: l.irregularity_type,
        severity: l.severity,
        resultDescription: l.result_description,
      })),
    }
  }

  return detail
}
