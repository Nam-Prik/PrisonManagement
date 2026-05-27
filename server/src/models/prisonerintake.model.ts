export interface PrisonerIntakeListRow {
  id: number
  prisoner_code: string | null
  first_name: string | null
  last_name: string | null
  intake_date: Date
  initial_health_status: string
  item_count: number
}

export interface PrisonerIntakeDetailRow {
  id: number
  prisoner_id: number | null
  prisoner_code: string | null
  first_name: string | null
  last_name: string | null
  intake_date: Date
  initial_health_status: string
  mugshot_img_key: string | null
}

export interface ConfiscatedItemRow {
  id: number
  item_name: string
  quantity: number
  remarks: string | null
}

export interface PrisonerIntakeListItem {
  id: number
  prisonerCode: string | null
  firstName: string | null
  lastName: string | null
  intakeDate: string
  initialHealthStatus: string
  itemCount: number
}

export interface ConfiscatedItemDetail {
  id: number
  itemName: string
  quantity: number
  remarks: string | null
}

export interface PrisonerIntakeDetail {
  id: number
  prisonerId: number | null
  prisonerCode: string | null
  firstName: string | null
  lastName: string | null
  intakeDate: string
  initialHealthStatus: string
  mugshotImgKey: string | null
  mugshotSignedUrl: string | null
  confiscatedItems: ConfiscatedItemDetail[]
}

export const toPrisonerIntakeListItem = (row: PrisonerIntakeListRow): PrisonerIntakeListItem => ({
  id: row.id,
  prisonerCode: row.prisoner_code,
  firstName: row.first_name,
  lastName: row.last_name,
  intakeDate: row.intake_date.toISOString(),
  initialHealthStatus: row.initial_health_status,
  itemCount: Number(row.item_count),
})

export const toConfiscatedItemDetail = (row: ConfiscatedItemRow): ConfiscatedItemDetail => ({
  id: row.id,
  itemName: row.item_name,
  quantity: Number(row.quantity),
  remarks: row.remarks,
})

export const toPrisonerIntakeDetail = (
  row: PrisonerIntakeDetailRow,
  items: ConfiscatedItemDetail[]
): PrisonerIntakeDetail => ({
  id: row.id,
  prisonerId: row.prisoner_id,
  prisonerCode: row.prisoner_code,
  firstName: row.first_name,
  lastName: row.last_name,
  intakeDate: row.intake_date.toISOString(),
  initialHealthStatus: row.initial_health_status,
  mugshotImgKey: row.mugshot_img_key,
  mugshotSignedUrl: null,
  confiscatedItems: items,
})
