export interface IrregularityListItem {
  inspectionDate: string
  locationName: string
  irregularityType: string
  irregularityDescription: string
  specificFindings: string
  inspectionReasons: string
}

export interface IrregularitySummaryItem {
  inspectionYear: number
  inspectionMonth: number
  irregularityType: string
  totalIncidents: number
}

export interface OfficerRoutineItem {
  officerCode: string
  officerName: string
  scheduleDate: string
  routineName: string
  routineType: string
  locationName: string
}
