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
  const { data } = await http.get<ApiResponse<LaborByCost[]>>('/labor-reports/labor-by-cost', {
    params: { minCost, maxCost },
  })
  return data.data
}

export const getCostByLocation = async (status = ''): Promise<CostByLocation[]> => {
  const { data } = await http.get<ApiResponse<CostByLocation[]>>(
    '/labor-reports/cost-by-location',
    { params: { status } }
  )
  return data.data
}
