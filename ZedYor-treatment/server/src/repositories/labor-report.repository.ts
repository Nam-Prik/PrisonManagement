import pool from '../db/pool.js'
import type {
  CostByLocationRow,
  LaborByCostRow,
  MaintainerBySkillRow,
} from '../models/labor-report.model.js'

export const laborReportRepository = {
  // Report 1: maintainers' personal info filtered by skill
  async findMaintainersBySkill(skill: string): Promise<MaintainerBySkillRow[]> {
    const result = await pool.query<MaintainerBySkillRow>(
      `SELECT p.first_name, p.last_name, p.age
       FROM maintainer m
       JOIN person p ON p.id = m.person_id
       WHERE m.maintainance_skill = $1
       ORDER BY p.last_name, p.first_name`,
      [skill]
    )
    return result.rows
  },

  // Report 2: labor tasks + cost + maintainer name where cost > threshold
  async findLaborByCost(minCost: number): Promise<LaborByCostRow[]> {
    const result = await pool.query<LaborByCostRow>(
      `SELECT
         l.labor_task,
         ma.maintainance_cost,
         p.first_name,
         p.last_name
       FROM labor l
       JOIN maintainance ma ON ma.id = l.maintainance_id
       JOIN maintainer m ON m.id = l.maintainer_id
       JOIN person p ON p.id = m.person_id
       WHERE ma.maintainance_cost > $1
       ORDER BY ma.maintainance_cost DESC`,
      [minCost]
    )
    return result.rows
  },

  // Report 3: total cost + task count per prison location, filterable by status
  // Pass empty string to include all statuses
  async findCostByLocation(status: string): Promise<CostByLocationRow[]> {
    const hasFilter = status.length > 0
    const result = await pool.query<CostByLocationRow>(
      `WITH total_maintainance AS (
         SELECT
           ma.prison_location_id,
           SUM(ma.maintainance_cost) AS total_cost,
           COUNT(l.labor_task)        AS total_tasks
         FROM maintainance ma
         JOIN labor l ON ma.id = l.maintainance_id
         ${hasFilter ? 'WHERE ma.status = $1' : ''}
         GROUP BY ma.prison_location_id
       )
       SELECT
         pl.name AS location_name,
         pl.code AS location_code,
         tm.total_cost,
         tm.total_tasks
       FROM total_maintainance tm
       JOIN prisonlocation pl ON pl.id = tm.prison_location_id
       ORDER BY tm.total_cost DESC`,
      hasFilter ? [status] : []
    )
    return result.rows
  },
}
