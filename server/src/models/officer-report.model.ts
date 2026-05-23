// ── Raw DB row types ────────

export interface IrregularityRow {
  'Inspection Date': Date
  'Location Name': string
  'Irregularity Type': string
  'Irregularity Description': string
  'Specific Findings': string
  'Inspection Reasons': string
}

export interface IrregularitySummaryRow {
  'Inspection Year': string | number // pg numeric/extract often returns as string
  'Inspection Month': string | number
  'Irregularity Type': string
  'Total Incidents': string | number // pg count returns as string
}

export interface OfficerRoutineRow {
  'Officer Code': string
  'Officer Name': string
  'Schedule Date': Date
  'Routine Name': string
  'Routine Type': string
  'Location Name': string
}

// ── Clean API types (JSON wire format for React) ────────────────

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

// ── Mappers ──────────────────────────────────────────────────────

export const toIrregularityListItem = (row: IrregularityRow): IrregularityListItem => ({
  inspectionDate: row['Inspection Date'].toISOString().split('T')[0], // format as YYYY-MM-DD
  locationName: row['Location Name'],
  irregularityType: row['Irregularity Type'],
  irregularityDescription: row['Irregularity Description'],
  specificFindings: row['Specific Findings'],
  inspectionReasons: row['Inspection Reasons'],
})

export const toIrregularitySummaryItem = (
  row: IrregularitySummaryRow
): IrregularitySummaryItem => ({
  inspectionYear: Number(row['Inspection Year']),
  inspectionMonth: Number(row['Inspection Month']),
  irregularityType: row['Irregularity Type'],
  totalIncidents: Number(row['Total Incidents']),
})

export const toOfficerRoutineItem = (row: OfficerRoutineRow): OfficerRoutineItem => ({
  officerCode: row['Officer Code'],
  officerName: row['Officer Name'],
  scheduleDate: row['Schedule Date'].toISOString().split('T')[0],
  routineName: row['Routine Name'],
  routineType: row['Routine Type'],
  locationName: row['Location Name'],
})
