export interface OfficerRow {
  id: number
  code: number
  rank: string
  first_name: string
  last_name: string
}

export interface OfficerOption {
  id: number
  code: number
  rank: string
  firstName: string
  lastName: string
}

export const toOfficerOption = (row: OfficerRow): OfficerOption => ({
  id: row.id,
  code: row.code,
  rank: row.rank,
  firstName: row.first_name,
  lastName: row.last_name,
})
