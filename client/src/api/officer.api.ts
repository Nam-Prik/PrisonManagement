import type { OfficerOption } from '../types/dto/officer.dto'
import type { ApiResponse } from '../types/response'
import http from './http'

export const getOfficerOptions = async (): Promise<OfficerOption[]> => {
  const { data } = await http.get<ApiResponse<OfficerOption[]>>('/officer')
  return data.data
}
