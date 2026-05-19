import type { PrisonerOption } from '../types/dto/prisoner.dto'
import type { ApiResponse } from '../types/response'
import http from './http'

export const getPrisonerOptions = async (): Promise<PrisonerOption[]> => {
  const { data } = await http.get<ApiResponse<PrisonerOption[]>>('/prisoner')
  return data.data
}
