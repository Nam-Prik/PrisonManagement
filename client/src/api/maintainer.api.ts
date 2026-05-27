import type {
  CreateMaintainerDto,
  Maintainer,
  MaintainerOption,
  UpdateMaintainerDto,
} from '../types/dto/maintainer.dto'
import type { ApiResponse } from '../types/response'
import http from './http'

export const getMaintainerOptions = async (): Promise<MaintainerOption[]> => {
  const { data } = await http.get<ApiResponse<MaintainerOption[]>>('/maintainer')
  return data.data
}

export const getMaintainers = getMaintainerOptions

export const getMaintainerById = async (id: number): Promise<Maintainer> => {
  const { data } = await http.get<ApiResponse<Maintainer>>(`/maintainer/${id}`)
  return data.data
}

export const createMaintainer = async (dto: CreateMaintainerDto): Promise<Maintainer> => {
  const { data } = await http.post<ApiResponse<Maintainer>>('/maintainer', dto)
  return data.data
}

export const updateMaintainer = async (
  id: number,
  dto: UpdateMaintainerDto
): Promise<Maintainer> => {
  const { data } = await http.put<ApiResponse<Maintainer>>(`/maintainer/${id}`, dto)
  return data.data
}

export const deleteMaintainer = async (id: number): Promise<void> => {
  await http.delete(`/maintainer/${id}`)
}
