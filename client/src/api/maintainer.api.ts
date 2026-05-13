import type { MaintainerOption } from '../types/dto/maintainer.dto'
import type { ApiResponse } from '../types/response'
import http from './http'

export const getMaintainerOptions = async (): Promise<MaintainerOption[]> => {
  const { data } = await http.get<ApiResponse<MaintainerOption[]>>('/maintainer')
  return data.data
}
