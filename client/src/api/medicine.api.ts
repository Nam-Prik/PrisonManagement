import type { CreateMedicineDto, Medicine, UpdateMedicineDto } from '../types/dto/medicine.dto'
import type { ApiResponse } from '../types/response'
import http from './http'

export const getMedicines = async (): Promise<Medicine[]> => {
  const { data } = await http.get<ApiResponse<Medicine[]>>('/medicine')
  return data.data
}

export const getMedicineById = async (id: number): Promise<Medicine> => {
  const { data } = await http.get<ApiResponse<Medicine>>(`/medicine/${id}`)
  return data.data
}

export const createMedicine = async (dto: CreateMedicineDto): Promise<Medicine> => {
  const { data } = await http.post<ApiResponse<Medicine>>('/medicine', dto)
  return data.data
}

export const updateMedicine = async (id: number, dto: UpdateMedicineDto): Promise<Medicine> => {
  const { data } = await http.put<ApiResponse<Medicine>>(`/medicine/${id}`, dto)
  return data.data
}

export const deleteMedicine = async (id: number): Promise<void> => {
  await http.delete(`/medicine/${id}`)
}
