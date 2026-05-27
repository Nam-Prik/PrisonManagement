export type Gender = 'M' | 'F' | 'Other' | 'Undisclosed'

export interface NurseRow {
  id: number
  code: string
  gender: Gender
  person_id: number
  first_name: string
  last_name: string
}

export interface Nurse {
  id: number
  code: string
  gender: Gender
  personId: number
  firstName: string
  lastName: string
}

export const toNurse = (row: NurseRow): Nurse => ({
  id: row.id,
  code: row.code,
  gender: row.gender,
  personId: row.person_id,
  firstName: row.first_name,
  lastName: row.last_name,
})
