import type {
  CreatePrisonerIntakeDto,
  PrisonerIntakeDetail,
  PrisonerIntakeListItem,
  UpdatePrisonerIntakeDto,
} from '../types/dto/prisonerintake.dto'
import type { ApiResponse } from '../types/response'
import http from './http'

export const getPrisonerIntakes = async (): Promise<PrisonerIntakeListItem[]> => {
  const { data } = await http.get<ApiResponse<PrisonerIntakeListItem[]>>('/prisoner-intake')
  return data.data
}

export const getPrisonerIntakeById = async (id: number): Promise<PrisonerIntakeDetail> => {
  const { data } = await http.get<ApiResponse<PrisonerIntakeDetail>>(`/prisoner-intake/${id}`)
  return data.data
}

export const createPrisonerIntake = async (
  dto: CreatePrisonerIntakeDto
): Promise<PrisonerIntakeDetail> => {
  const { data } = await http.post<ApiResponse<PrisonerIntakeDetail>>('/prisoner-intake', dto)
  return data.data
}

export const updatePrisonerIntake = async (
  id: number,
  dto: UpdatePrisonerIntakeDto
): Promise<PrisonerIntakeDetail> => {
  const { data } = await http.put<ApiResponse<PrisonerIntakeDetail>>(`/prisoner-intake/${id}`, dto)
  return data.data
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve((reader.result as string).split(',')[1])
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export const uploadMugshot = async (file: File): Promise<string> => {
  const base64 = await fileToBase64(file)
  const { data } = await http.post<ApiResponse<{ key: string }>>('/prisoner-intake/mugshot', {
    base64,
    filename: file.name,
    contentType: file.type,
  })
  return data.data.key
}

export const deletePrisonerIntake = async (id: number): Promise<void> => {
  await http.delete(`/prisoner-intake/${id}`)
}
