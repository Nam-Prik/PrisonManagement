import type {
  IncidentByOfficer,
  InvolvedPrisonerByLocation,
  TopPrisonerIncident,
} from '../types/dto/incident-report.dto'
import type { ApiResponse } from '../types/response'
import http from './http'

export const getIncidentsByOfficer = async (officerId: number): Promise<IncidentByOfficer[]> => {
  const { data } = await http.get<ApiResponse<IncidentByOfficer[]>>(
    '/incident-reports/by-officer',
    { params: { officerId: String(officerId) } }
  )
  return data.data
}

export const getInvolvedPrisonersByLocation = async (
  locationId: number
): Promise<InvolvedPrisonerByLocation[]> => {
  const { data } = await http.get<ApiResponse<InvolvedPrisonerByLocation[]>>(
    '/incident-reports/by-location',
    { params: { locationId: String(locationId) } }
  )
  return data.data
}

export const getTopPrisonerIncidentsByLocation = async (
  startDate: string,
  endDate: string
): Promise<TopPrisonerIncident[]> => {
  const { data } = await http.get<ApiResponse<TopPrisonerIncident[]>>(
    '/incident-reports/top-by-location',
    { params: { startDate, endDate } }
  )
  return data.data
}
