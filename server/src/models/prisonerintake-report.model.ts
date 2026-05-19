export interface IntakeByDateRangeRow {
  prisoner_code: string
  prisoner_name: string
  intake_date: Date
  initial_health_status: string
}

export interface ConfiscatedItemsRow {
  prisoner_code: string
  intake_date: Date
  item_name: string
  quantity: number
  remarks: string | null
}

export interface TotalItemsPerIntakeRow {
  intake_id: number
  prisoner_code: string
  intake_date: Date
  total_items: number
}

export interface IntakeByDateRange {
  prisonerCode: string
  prisonerName: string
  intakeDate: string
  initialHealthStatus: string
}

export interface ConfiscatedItemReport {
  prisonerCode: string
  intakeDate: string
  itemName: string
  quantity: number
  remarks: string | null
}

export interface TotalItemsPerIntake {
  intakeId: number
  prisonerCode: string
  intakeDate: string
  totalItems: number
}

export const toIntakeByDateRange = (row: IntakeByDateRangeRow): IntakeByDateRange => ({
  prisonerCode: row.prisoner_code,
  prisonerName: row.prisoner_name,
  intakeDate: row.intake_date.toISOString(),
  initialHealthStatus: row.initial_health_status,
})

export const toConfiscatedItemReport = (row: ConfiscatedItemsRow): ConfiscatedItemReport => ({
  prisonerCode: row.prisoner_code,
  intakeDate: row.intake_date.toISOString(),
  itemName: row.item_name,
  quantity: Number(row.quantity),
  remarks: row.remarks,
})

export const toTotalItemsPerIntake = (row: TotalItemsPerIntakeRow): TotalItemsPerIntake => ({
  intakeId: row.intake_id,
  prisonerCode: row.prisoner_code,
  intakeDate: row.intake_date.toISOString(),
  totalItems: Number(row.total_items),
})
