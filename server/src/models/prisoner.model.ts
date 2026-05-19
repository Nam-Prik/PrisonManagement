export interface PrisonerRow {
  id: number
  code: string
  first_name: string
  last_name: string
  evaluation_score: number | null
}

export interface PrisonerOption {
  id: number
  code: string
  firstName: string
  lastName: string
  evaluationScore: number | null
}

export const toPrisonerOption = (row: PrisonerRow): PrisonerOption => ({
  id: row.id,
  code: row.code,
  firstName: row.first_name,
  lastName: row.last_name,
  evaluationScore: row.evaluation_score != null ? Number(row.evaluation_score) : null,
})
