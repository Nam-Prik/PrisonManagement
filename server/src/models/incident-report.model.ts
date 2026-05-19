// ── DB row types ─────────────────────────────────────────────

export interface IncidentByOfficerRow {
  incident_id: number
  incident_datetime: string
  description: string
  days_since_incident: number
  location_name: string
  prisoner_code: string | null
  prisoner_first_name: string | null
  prisoner_last_name: string | null
}

export interface InvolvedPrisonerByLocationRow {
  prisoner_code: string
  prisoner_first_name: string
  prisoner_last_name: string
  incident_datetime: string
  evaluation_score: number
  risk_alert: string
  days_ago: number
}

export interface TopPrisonerIncidentRow {
  location_name: string
  prisoner_code: string | null
  prisoner_first_name: string | null
  prisoner_last_name: string | null
  total_actions_taken: number
}

// ── Clean API types ───────────────────────────────────────────

export interface IncidentByOfficer {
  incidentId: number
  incidentDatetime: string
  description: string
  daysSinceIncident: number
  locationName: string
  prisonerCode: string | null
  prisonerFirstName: string | null
  prisonerLastName: string | null
}

export interface InvolvedPrisonerByLocation {
  prisonerCode: string
  prisonerFirstName: string
  prisonerLastName: string
  incidentDatetime: string
  evaluationScore: number
  riskAlert: string
  daysAgo: number
}

export interface TopPrisonerIncident {
  locationName: string
  prisonerCode: string | null
  prisonerFirstName: string | null
  prisonerLastName: string | null
  totalActionsTaken: number
}

// ── Mappers ──────────────────────────────────────────────────

export const toIncidentByOfficer = (row: IncidentByOfficerRow): IncidentByOfficer => ({
  incidentId: row.incident_id,
  incidentDatetime: row.incident_datetime,
  description: row.description,
  daysSinceIncident: Number(row.days_since_incident),
  locationName: row.location_name,
  prisonerCode: row.prisoner_code,
  prisonerFirstName: row.prisoner_first_name,
  prisonerLastName: row.prisoner_last_name,
})

export const toInvolvedPrisonerByLocation = (
  row: InvolvedPrisonerByLocationRow
): InvolvedPrisonerByLocation => ({
  prisonerCode: row.prisoner_code,
  prisonerFirstName: row.prisoner_first_name,
  prisonerLastName: row.prisoner_last_name,
  incidentDatetime: row.incident_datetime,
  evaluationScore: Number(row.evaluation_score),
  riskAlert: row.risk_alert,
  daysAgo: Number(row.days_ago),
})

export const toTopPrisonerIncident = (row: TopPrisonerIncidentRow): TopPrisonerIncident => ({
  locationName: row.location_name,
  prisonerCode: row.prisoner_code,
  prisonerFirstName: row.prisoner_first_name,
  prisonerLastName: row.prisoner_last_name,
  totalActionsTaken: Number(row.total_actions_taken),
})
