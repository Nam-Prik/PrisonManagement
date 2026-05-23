import pool from '../db/pool.js'
import type {
  IrregularityListItem,
  IrregularityRow,
  IrregularitySummaryItem,
  IrregularitySummaryRow,
  OfficerRoutineItem,
  OfficerRoutineRow,
} from '../models/officer-report.model.js'
import {
  toIrregularityListItem,
  toIrregularitySummaryItem,
  toOfficerRoutineItem,
} from '../models/officer-report.model.js'

export const officerReportRepository = {
  async listIrregularities(startDate: string, endDate: string): Promise<IrregularityListItem[]> {
    const result = await pool.query<IrregularityRow>(`SELECT * FROM list_irregularities($1, $2)`, [
      startDate,
      endDate,
    ])

    return result.rows.map(toIrregularityListItem)
  },

  async getOfficerRoutines(officerCode: string = '*'): Promise<OfficerRoutineItem[]> {
    const result = await pool.query<OfficerRoutineRow>(`SELECT * FROM get_officer_routines($1)`, [
      officerCode,
    ])

    return result.rows.map(toOfficerRoutineItem)
  },

  async getIrregularitiesSummary(
    startDate: string,
    endDate: string
  ): Promise<IrregularitySummaryItem[]> {
    const result = await pool.query<IrregularitySummaryRow>(
      `SELECT * FROM irregularities_summary($1, $2)`,
      [startDate, endDate]
    )

    return result.rows.map(toIrregularitySummaryItem)
  },
}
