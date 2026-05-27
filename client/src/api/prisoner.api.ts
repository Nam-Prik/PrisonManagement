import type {
  CreatePrisonerDto,
  PrisonerDetail,
  PrisonerOption,
  UpdatePrisonerDto,
} from '../types/dto/prisoner.dto'
import type { ApiResponse } from '../types/response'
import http from './http'

export const getPrisonerOptions = async (): Promise<PrisonerOption[]> => {
  const { data } = await http.get<ApiResponse<PrisonerOption[]>>('/prisoner')
  return data.data
}

export const getPrisonerById = async (id: number): Promise<PrisonerDetail> => {
  const { data } = await http.get<ApiResponse<PrisonerDetail>>(`/prisoner/${id}`)
  return data.data
}

export const createPrisoner = async (dto: CreatePrisonerDto): Promise<PrisonerDetail> => {
  const { data } = await http.post<ApiResponse<PrisonerDetail>>('/prisoner', dto)
  return data.data
}

export const updatePrisoner = async (
  id: number,
  dto: UpdatePrisonerDto
): Promise<PrisonerDetail> => {
  const { data } = await http.put<ApiResponse<PrisonerDetail>>(`/prisoner/${id}`, dto)
  return data.data
}

export const deletePrisoner = async (id: number): Promise<void> => {
  await http.delete(`/prisoner/${id}`)
}
