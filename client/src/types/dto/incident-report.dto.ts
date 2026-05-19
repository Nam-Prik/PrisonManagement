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
