import type {
  CreateInspectionDto,
  InspectionDetail,
  InspectionListItem,
  UpdateInspectionDto,
} from '../types/dto/inspection.dto'
import type { ApiResponse } from '../types/response'
import http from './http'

export const getInspections = async (): Promise<InspectionListItem[]> => {
  const { data } = await http.get<ApiResponse<InspectionListItem[]>>('/inspection')
  return data.data
}

export const getInspectionById = async (id: number): Promise<InspectionDetail> => {
  const { data } = await http.get<ApiResponse<InspectionDetail>>(`/inspection/${id}`)
  return data.data
}

export const createInspection = async (dto: CreateInspectionDto): Promise<InspectionDetail> => {
  const { data } = await http.post<ApiResponse<InspectionDetail>>('/inspection', dto)
  return data.data
}

export const updateInspection = async (
  id: number,
  dto: UpdateInspectionDto
): Promise<InspectionDetail> => {
  const { data } = await http.put<ApiResponse<InspectionDetail>>(`/inspection/${id}`, dto)
  return data.data
}

export const deleteInspection = async (id: number): Promise<void> => {
  await http.delete(`/inspection/${id}`)
}
