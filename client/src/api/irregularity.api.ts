import type {
  CreateIrregularityDto,
  Irregularity,
  UpdateIrregularityDto,
} from '../types/dto/irregularity.dto'
import type { ApiResponse } from '../types/response'
import http from './http'

export const getIrregularities = async (): Promise<Irregularity[]> => {
  const { data } = await http.get<ApiResponse<Irregularity[]>>('/irregularity')
  return data.data
}

export const getIrregularityById = async (id: number): Promise<Irregularity> => {
  const { data } = await http.get<ApiResponse<Irregularity>>(`/irregularity/${id}`)
  return data.data
}

export const createIrregularity = async (dto: CreateIrregularityDto): Promise<Irregularity> => {
  const { data } = await http.post<ApiResponse<Irregularity>>('/irregularity', dto)
  return data.data
}

export const updateIrregularity = async (
  id: number,
  dto: UpdateIrregularityDto
): Promise<Irregularity> => {
  const { data } = await http.put<ApiResponse<Irregularity>>(`/irregularity/${id}`, dto)
  return data.data
}

export const deleteIrregularity = async (id: number): Promise<void> => {
  await http.delete(`/irregularity/${id}`)
}
