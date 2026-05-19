// ── DB row types ─────────────────────────────────────────────

export interface IncidentListRow {
  id: number
  incident_datetime: Date
  description: string | null
  location_name: string
  location_code: string
  officer_first_name: string
  officer_last_name: string
  officer_code: number
  involved_count: number
}

export interface IncidentDetailRow {
  id: number
  incident_datetime: Date
  description: string | null
  prison_location_id: number
  location_name: string
  reporting_officer_id: number
  officer_first_name: string
  officer_last_name: string
  officer_code: number
}

export interface InvolvedPrisonerRow {
  prisoner_id: number
  prisoner_code: string
  first_name: string
  last_name: string
}

// ── Clean API types ───────────────────────────────────────────

export interface InvolvedPrisonerItem {
  prisonerId: number
  prisonerCode: string
  firstName: string
  lastName: string
}

export interface IncidentListItem {
  id: number
  incidentDatetime: string
  description: string | null
  locationName: string
  locationCode: string
  officerFirstName: string
  officerLastName: string
  officerCode: number
  involvedCount: number
}

export interface IncidentDetail {
  id: number
  incidentDatetime: string
  description: string | null
  prisonLocationId: number
  locationName: string
  reportingOfficerId: number
  officerFirstName: string
  officerLastName: string
  officerCode: number
  involvedPrisoners: InvolvedPrisonerItem[]
}

// ── Mappers ──────────────────────────────────────────────────

export const toIncidentListItem = (row: IncidentListRow): IncidentListItem => ({
  id: row.id,
  incidentDatetime: row.incident_datetime.toISOString(),
  description: row.description,
  locationName: row.location_name,
  locationCode: row.location_code,
  officerFirstName: row.officer_first_name,
  officerLastName: row.officer_last_name,
  officerCode: row.officer_code,
  involvedCount: Number(row.involved_count),
})

export const toInvolvedPrisonerItem = (row: InvolvedPrisonerRow): InvolvedPrisonerItem => ({
  prisonerId: row.prisoner_id,
  prisonerCode: row.prisoner_code,
  firstName: row.first_name,
  lastName: row.last_name,
})

export const toIncidentDetail = (
  row: IncidentDetailRow,
  involvedPrisoners: InvolvedPrisonerItem[]
): IncidentDetail => ({
  id: row.id,
  incidentDatetime: row.incident_datetime.toISOString(),
  description: row.description,
  prisonLocationId: row.prison_location_id,
  locationName: row.location_name,
  reportingOfficerId: row.reporting_officer_id,
  officerFirstName: row.officer_first_name,
  officerLastName: row.officer_last_name,
  officerCode: row.officer_code,
  involvedPrisoners,
})
