import type {
  CostByLocation,
  LaborByCost,
  MaintainerBySkill,
} from '../models/labor-report.model.js'
import {
  toCostByLocation,
  toLaborByCost,
  toMaintainerBySkill,
} from '../models/labor-report.model.js'
import { laborReportRepository } from '../repositories/labor-report.repository.js'

export const laborReportService = {
  async getMaintainersBySkill(skill: string): Promise<MaintainerBySkill[]> {
    const rows = await laborReportRepository.findMaintainersBySkill(skill)
    return rows.map(toMaintainerBySkill)
  },

  async getLaborByCost(minCost: number, maxCost?: number): Promise<LaborByCost[]> {
    const rows = await laborReportRepository.findLaborByCost(minCost, maxCost)
    return rows.map(toLaborByCost)
  },

  async getCostByLocation(status: string): Promise<CostByLocation[]> {
    const rows = await laborReportRepository.findCostByLocation(status)
    return rows.map(toCostByLocation)
  },
}
