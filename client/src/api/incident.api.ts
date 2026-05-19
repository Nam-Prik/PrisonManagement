import type {
  CreateIncidentDto,
  IncidentDetail,
  IncidentListItem,
  UpdateIncidentDto,
} from '../types/dto/incident.dto'
import type { ApiResponse } from '../types/response'
import http from './http'

export const getIncidents = async (): Promise<IncidentListItem[]> => {
  const { data } = await http.get<ApiResponse<IncidentListItem[]>>('/incident')
  return data.data
}

export const getIncidentById = async (id: number): Promise<IncidentDetail> => {
  const { data } = await http.get<ApiResponse<IncidentDetail>>(`/incident/${id}`)
  return data.data
}

export const createIncident = async (dto: CreateIncidentDto): Promise<IncidentDetail> => {
  const { data } = await http.post<ApiResponse<IncidentDetail>>('/incident', dto)
  return data.data
}

export const updateIncident = async (
  id: number,
  dto: UpdateIncidentDto
): Promise<IncidentDetail> => {
  const { data } = await http.put<ApiResponse<IncidentDetail>>(`/incident/${id}`, dto)
  return data.data
}

export const deleteIncident = async (id: number): Promise<void> => {
  await http.delete(`/incident/${id}`)
}
