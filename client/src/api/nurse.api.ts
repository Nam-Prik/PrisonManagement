import type { CreateNurseDto, Nurse, UpdateNurseDto } from '../types/dto/nurse.dto'
import type { ApiResponse } from '../types/response'
import http from './http'

export const getNurses = async (): Promise<Nurse[]> => {
  const { data } = await http.get<ApiResponse<Nurse[]>>('/nurse')
  return data.data
}

export const getNurseById = async (id: number): Promise<Nurse> => {
  const { data } = await http.get<ApiResponse<Nurse>>(`/nurse/${id}`)
  return data.data
}

export const createNurse = async (dto: CreateNurseDto): Promise<Nurse> => {
  const { data } = await http.post<ApiResponse<Nurse>>('/nurse', dto)
  return data.data
}

export const updateNurse = async (id: number, dto: UpdateNurseDto): Promise<Nurse> => {
  const { data } = await http.put<ApiResponse<Nurse>>(`/nurse/${id}`, dto)
  return data.data
}

export const deleteNurse = async (id: number): Promise<void> => {
  await http.delete(`/nurse/${id}`)
}
