import pool from '../db/pool.js'
import type {
  ConfiscatedItemsRow,
  IntakeByDateRangeRow,
  TotalItemsPerIntakeRow,
} from '../models/prisonerintake-report.model.js'
import {
  toConfiscatedItemReport,
  toIntakeByDateRange,
  toTotalItemsPerIntake,
} from '../models/prisonerintake-report.model.js'

export const prisonerIntakeReportRepository = {
  async findIntakesByDateRange(fromDate: string, toDate: string, prisonerCode?: string) {
    const result = await pool.query<IntakeByDateRangeRow>(
      `SELECT
         p.code AS prisoner_code,
         pe.first_name || ' ' || pe.last_name AS prisoner_name,
         pi.intake_date,
         pi.initial_health_status
       FROM Prisoner p
       JOIN Person pe ON p.person_id = pe.id
       JOIN PrisonerIntake pi ON p.prison_intake_id = pi.id
       WHERE pi.intake_date BETWEEN $1 AND $2
         AND ($3::text IS NULL OR p.code = $3)
       ORDER BY pi.intake_date DESC`,
      [fromDate, toDate, prisonerCode ?? null]
    )
    return result.rows.map(toIntakeByDateRange)
  },

  async findConfiscatedItems(fromDate: string, toDate: string, itemFilter?: string) {
    const result = await pool.query<ConfiscatedItemsRow>(
      `SELECT
         p.code AS prisoner_code,
         pi.intake_date,
         ci.item_name,
         ci.quantity,
         ci.remarks
       FROM ConfiscatedItem ci
       JOIN PrisonerIntake pi ON ci.PrisonerIntake_id = pi.id
       JOIN Prisoner p ON p.prison_intake_id = pi.id
       WHERE pi.intake_date BETWEEN $1 AND $2
         AND ($3::text IS NULL OR ci.item_name = $3)
       ORDER BY pi.intake_date DESC, ci.item_name`,
      [fromDate, toDate, itemFilter ?? null]
    )
    return result.rows.map(toConfiscatedItemReport)
  },

  async findTotalItemsPerIntake(fromDate: string, toDate: string, topN: number) {
    const result = await pool.query<TotalItemsPerIntakeRow>(
      `SELECT
         pi.id AS intake_id,
         p.code AS prisoner_code,
         pi.intake_date,
         SUM(ci.quantity)::int AS total_items
       FROM ConfiscatedItem ci
       JOIN PrisonerIntake pi ON ci.PrisonerIntake_id = pi.id
       JOIN Prisoner p ON p.prison_intake_id = pi.id
       WHERE pi.intake_date BETWEEN $1 AND $2
       GROUP BY pi.id, p.code, pi.intake_date
       ORDER BY total_items DESC
       LIMIT $3`,
      [fromDate, toDate, topN]
    )
    return result.rows.map(toTotalItemsPerIntake)
  },
}
