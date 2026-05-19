import type { ApiResponse } from '../types/response'
import type {
  CreateTreatmentDto,
  NurseOption,
  TreatmentDetail,
  TreatmentListItem,
  UpdateTreatmentDto,
} from '../types/dto/treatment.dto'
import http from './http'

export const getTreatments = async (): Promise<TreatmentListItem[]> => {
  const { data } = await http.get<ApiResponse<TreatmentListItem[]>>('/treatment')
  return data.data
}

export const getTreatmentById = async (id: number): Promise<TreatmentDetail> => {
  const { data } = await http.get<ApiResponse<TreatmentDetail>>(`/treatment/${id}`)
  return data.data
}

export const getNurseOptions = async (): Promise<NurseOption[]> => {
  const { data } = await http.get<ApiResponse<NurseOption[]>>('/treatment/nurses')
  return data.data
}

export const createTreatment = async (
  dto: CreateTreatmentDto
): Promise<TreatmentDetail> => {
  const { data } = await http.post<ApiResponse<TreatmentDetail>>('/treatment', dto)
  return data.data
}

export const updateTreatment = async (
  id: number,
  dto: UpdateTreatmentDto
): Promise<TreatmentDetail> => {
  const { data } = await http.put<ApiResponse<TreatmentDetail>>(`/treatment/${id}`, dto)
  return data.data
}

export const deleteTreatment = async (id: number): Promise<void> => {
  await http.delete(`/treatment/${id}`)
}
