import type {
  CreateRoutineDto,
  RoutineDetail,
  RoutineListItem,
  RoutineOption,
  UpdateRoutineDto,
} from '../types/dto/routine.dto'
import type { ApiResponse } from '../types/response'
import http from './http'

export const getRoutineOptions = async (): Promise<RoutineOption[]> => {
  const { data } = await http.get<ApiResponse<RoutineOption[]>>('/routine/options')
  return data.data
}

export const getRoutines = async (): Promise<RoutineListItem[]> => {
  const { data } = await http.get<ApiResponse<RoutineListItem[]>>('/routine')
  return data.data
}

export const getRoutineById = async (id: number): Promise<RoutineDetail> => {
  const { data } = await http.get<ApiResponse<RoutineDetail>>(`/routine/${id}`)
  return data.data
}

export const createRoutine = async (dto: CreateRoutineDto): Promise<RoutineDetail> => {
  const { data } = await http.post<ApiResponse<RoutineDetail>>('/routine', dto)
  return data.data
}

export const updateRoutine = async (id: number, dto: UpdateRoutineDto): Promise<RoutineDetail> => {
  const { data } = await http.put<ApiResponse<RoutineDetail>>(`/routine/${id}`, dto)
  return data.data
}

export const deleteRoutine = async (id: number): Promise<void> => {
  await http.delete(`/routine/${id}`)
}
