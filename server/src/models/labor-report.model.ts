// ── DB row types ─────────────────────────────────────────────

export interface MaintainerBySkillRow {
  first_name: string
  last_name: string
  age: number
}

export interface LaborByCostRow {
  labor_task: string
  maintainance_cost: number
  first_name: string
  last_name: string
}

export interface CostByLocationRow {
  location_name: string
  location_code: string
  total_cost: string
  total_tasks: string
}

// ── Clean API types ───────────────────────────────────────────

export interface MaintainerBySkill {
  firstName: string
  lastName: string
  age: number
}

export interface LaborByCost {
  laborTask: string
  maintainanceCost: number
  firstName: string
  lastName: string
}

export interface CostByLocation {
  locationName: string
  locationCode: string
  totalCost: number
  totalTasks: number
}

// ── Mappers ──────────────────────────────────────────────────

export const toMaintainerBySkill = (row: MaintainerBySkillRow): MaintainerBySkill => ({
  firstName: row.first_name,
  lastName: row.last_name,
  age: row.age,
})

export const toLaborByCost = (row: LaborByCostRow): LaborByCost => ({
  laborTask: row.labor_task,
  maintainanceCost: Number(row.maintainance_cost),
  firstName: row.first_name,
  lastName: row.last_name,
})

export const toCostByLocation = (row: CostByLocationRow): CostByLocation => ({
  locationName: row.location_name,
  locationCode: row.location_code,
  totalCost: Number(row.total_cost),
  totalTasks: Number(row.total_tasks),
})
