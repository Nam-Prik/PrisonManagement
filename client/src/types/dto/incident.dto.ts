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

export interface CreateIncidentDto {
  incidentDatetime: string
  description?: string
  prisonLocationId: number
  reportingOfficerId: number
  involvedPrisonerIds: number[]
}

export type UpdateIncidentDto = CreateIncidentDto
