export interface VisitmentRow {
  id: number
  prisoner_id: number
  visitment_date: Date
  description?: string
  status: 'scheduled' | 'completed' | 'cancelled'
  duration: number
  visitor_count?: string | number
  // Joined fields
  prisoner_code?: string
  prisoner_name?: string
}

export interface VisitmentVisitorRow {
  visitment_id: number
  person_id: number
  relation: string
  // Joined fields
  first_name?: string
  last_name?: string
  gender?: string
  identification_no?: string
}

// ── Clean API types (camelCase) ─────────────────────────────

export interface VisitmentVisitor {
  personId: number
  relation: string
  firstName?: string
  lastName?: string
  gender?: string
  identificationNo?: string
}

export interface VisitmentDetail {
  id: number
  prisonerId: number
  prisonerCode: string
  prisonerName: string
  visitmentDate: string
  duration: number
  status: 'scheduled' | 'completed' | 'cancelled'
  description?: string
  visitors: VisitmentVisitor[]
}

// ── Mappers ──────────────────────────────────────────────────

export const toVisitmentVisitor = (row: VisitmentVisitorRow): VisitmentVisitor => ({
  personId: row.person_id,
  relation: row.relation,
  firstName: row.first_name,
  lastName: row.last_name,
  gender: row.gender,
  identificationNo: row.identification_no,
})

export const toVisitmentDetail = (
  header: VisitmentRow,
  visitors: VisitmentVisitor[]
): VisitmentDetail => ({
  id: header.id,
  prisonerId: header.prisoner_id,
  prisonerCode: header.prisoner_code || '',
  prisonerName: header.prisoner_name || '',
  visitmentDate: header.visitment_date.toISOString(),
  duration: header.duration,
  status: header.status,
  description: header.description,
  visitors,
})

export const toVisitmentListItem = (row: VisitmentRow) => ({
  id: row.id,
  prisonerId: row.prisoner_id,
  prisonerCode: row.prisoner_code || '',
  prisonerName: row.prisoner_name || '',
  visitmentDate:
    typeof row.visitment_date === 'string' ? row.visitment_date : row.visitment_date.toISOString(),
  duration: row.duration,
  status: row.status,
  description: row.description,
  visitorCount: Number(row.visitor_count ?? 0),
})
