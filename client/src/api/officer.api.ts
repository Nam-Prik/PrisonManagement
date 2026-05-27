import type {
  CreateOfficerDto,
  Officer,
  OfficerOption,
  UpdateOfficerDto,
} from '../types/dto/officer.dto'
import type { ApiResponse } from '../types/response'
import http from './http'

export const getOfficerOptions = async (): Promise<OfficerOption[]> => {
  const { data } = await http.get<ApiResponse<OfficerOption[]>>('/officer')
  return data.data
}

export const getOfficerById = async (id: number): Promise<Officer> => {
  const { data } = await http.get<ApiResponse<Officer>>(`/officer/${id}`)
  return data.data
}

export const createOfficer = async (dto: CreateOfficerDto): Promise<Officer> => {
  const { data } = await http.post<ApiResponse<Officer>>('/officer', dto)
  return data.data
}

export const updateOfficer = async (id: number, dto: UpdateOfficerDto): Promise<Officer> => {
  const { data } = await http.put<ApiResponse<Officer>>(`/officer/${id}`, dto)
  return data.data
}

export const deleteOfficer = async (id: number): Promise<void> => {
  await http.delete(`/officer/${id}`)
}
