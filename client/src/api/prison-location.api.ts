import type {
  CreatePrisonLocationDto,
  PrisonLocation,
  UpdatePrisonLocationDto,
} from '../types/dto/prison-location.dto'
import type { ApiResponse } from '../types/response'
import http from './http'

export const getPrisonLocations = async (): Promise<PrisonLocation[]> => {
  const { data } = await http.get<ApiResponse<PrisonLocation[]>>('/prison-location')
  return data.data
}

export const getPrisonLocationById = async (id: number): Promise<PrisonLocation> => {
  const { data } = await http.get<ApiResponse<PrisonLocation>>(`/prison-location/${id}`)
  return data.data
}

export const createPrisonLocation = async (
  dto: CreatePrisonLocationDto
): Promise<PrisonLocation> => {
  const { data } = await http.post<ApiResponse<PrisonLocation>>('/prison-location', dto)
  return data.data
}

export const updatePrisonLocation = async (
  id: number,
  dto: UpdatePrisonLocationDto
): Promise<PrisonLocation> => {
  const { data } = await http.put<ApiResponse<PrisonLocation>>(`/prison-location/${id}`, dto)
  return data.data
}

export const deletePrisonLocation = async (id: number): Promise<void> => {
  await http.delete(`/prison-location/${id}`)
}
