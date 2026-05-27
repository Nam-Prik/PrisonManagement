export type Rank =
  | 'Warden'
  | 'Deputy Warden'
  | 'Chief Jailer'
  | 'Captain'
  | 'Lieutenant'
  | 'Sergeant'
  | 'Corporal'
  | 'Guard'
  | 'Trainee'

export type Gender = 'M' | 'F' | 'Other' | 'Undisclosed'

export interface OfficerRow {
  id: number
  code: number
  rank: Rank
  gender: Gender
  person_id: number
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

export interface Officer {
  id: number
  code: number
  rank: Rank
  gender: Gender
  personId: number
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

export const toOfficer = (row: OfficerRow): Officer => ({
  id: row.id,
  code: row.code,
  rank: row.rank,
  gender: row.gender,
  personId: row.person_id,
  firstName: row.first_name,
  lastName: row.last_name,
})
