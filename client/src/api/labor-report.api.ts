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

export const getLaborByCost = async (minCost: number): Promise<LaborByCost[]> => {
  const { data } = await http.get<ApiResponse<LaborByCost[]>>('/labor-reports/labor-by-cost', {
    params: { minCost: String(minCost) },
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
