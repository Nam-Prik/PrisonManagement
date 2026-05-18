import type {
  CreatePrisonerDto,
  CreatePrisonerWithPersonDto,
  PrisonerDetail,
  PrisonerListItem,
  UpdatePrisonerDto,
} from '../types/dto/prisoner.dto'
import type { ApiResponse } from '../types/response'
import http from './http'

export const getPrisoners = async (): Promise<PrisonerListItem[]> => {
  const { data } = await http.get<ApiResponse<PrisonerListItem[]>>('/prisoner')
  return data.data
}

export const searchPrisonerByIdentificationNo = async (
  identificationNo: string
): Promise<PrisonerListItem[]> => {
  const { data } = await http.get<ApiResponse<PrisonerListItem[]>>(
    `/prisoner/search?id=${encodeURIComponent(identificationNo)}`
  )
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

export const createPrisonerWithPerson = async (
  dto: CreatePrisonerWithPersonDto
): Promise<PrisonerDetail> => {
  const { data } = await http.post<ApiResponse<PrisonerDetail>>('/prisoner/with-person', dto)
  return data.data
}

export const updatePrisoner = async (
  id: number,
  dto: UpdatePrisonerDto
): Promise<PrisonerDetail> => {
  const { data } = await http.put<ApiResponse<PrisonerDetail>>(`/prisoner/${id}`, dto)
  return data.data
}

export const updatePrisonerMugshot = async (
  id: number,
  mugshotImgKey: string | null
): Promise<PrisonerDetail> => {
  const { data } = await http.post<ApiResponse<PrisonerDetail>>(`/prisoner/${id}/mugshot`, {
    mugshotImgKey,
  })
  return data.data
}

export const deletePrisoner = async (id: number): Promise<void> => {
  await http.delete(`/prisoner/${id}`)
}

export const copyPrisoner = async (id: number): Promise<PrisonerDetail> => {
  const { data } = await http.post<ApiResponse<PrisonerDetail>>(`/prisoner/${id}/copy`, {})
  return data.data
}

export const checkPrisonerExists = async (
  firstName: string,
  lastName: string
): Promise<boolean> => {
  try {
    const prisoners = await getPrisoners()
    return prisoners.some(
      (p) =>
        p.firstName.toLowerCase() === firstName.toLowerCase() &&
        p.lastName.toLowerCase() === lastName.toLowerCase()
    )
  } catch {
    return false
  }
}
