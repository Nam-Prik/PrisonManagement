import type { CostByLocation, LaborByCost, MaintainerBySkill } from '../types/dto/labor-report.dto'
import type { ApiResponse } from '../types/response'
import http from './http'

export const getMaintainersBySkill = async (skill: string): Promise<MaintainerBySkill[]> => {
  const { data } = await http.get<ApiResponse<MaintainerBySkill[]>>(
    '/labor-reports/maintainers-by-skill',
    { params: { skill } }
  )
  return data.data
}

export const getLaborByCost = async (minCost: number, maxCost?: number): Promise<LaborByCost[]> => {
  const params: Record<string, string> = { minCost: String(minCost) }
  if (maxCost !== undefined) params.maxCost = String(maxCost)
  const { data } = await http.get<ApiResponse<LaborByCost[]>>('/labor-reports/labor-by-cost', {
    params,
  })
  return data.data
}

// Pass empty string to get all statuses
export const getCostByLocation = async (status = ''): Promise<CostByLocation[]> => {
  const { data } = await http.get<ApiResponse<CostByLocation[]>>(
    '/labor-reports/cost-by-location',
    status ? { params: { status } } : undefined
  )
  return data.data
}
