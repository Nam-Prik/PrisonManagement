import type {
  CreateMaintainanceDto,
  MaintainanceDetail,
  MaintainanceListItem,
  UpdateMaintainanceDto,
} from '../types/dto/maintainance.dto'
import type { ApiResponse } from '../types/response'
import http from './http'

export const getMaintainanceTasks = async (): Promise<MaintainanceListItem[]> => {
  const { data } = await http.get<ApiResponse<MaintainanceListItem[]>>('/maintainance')
  return data.data
}

export const getMaintainanceById = async (id: number): Promise<MaintainanceDetail> => {
  const { data } = await http.get<ApiResponse<MaintainanceDetail>>(`/maintainance/${id}`)
  return data.data
}

export const createMaintainance = async (
  dto: CreateMaintainanceDto
): Promise<MaintainanceDetail> => {
  const { data } = await http.post<ApiResponse<MaintainanceDetail>>('/maintainance', dto)
  return data.data
}

export const updateMaintainance = async (
  id: number,
  dto: UpdateMaintainanceDto
): Promise<MaintainanceDetail> => {
  const { data } = await http.put<ApiResponse<MaintainanceDetail>>(`/maintainance/${id}`, dto)
  return data.data
}

export const deleteMaintainance = async (id: number): Promise<void> => {
  await http.delete(`/maintainance/${id}`)
}
