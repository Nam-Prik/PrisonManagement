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
    const query = `
      SELECT
          rs.routines_schedule_date AS "Inspection Date",
          pl.name AS "Location Name",
          ir.type::text AS "Irregularity Type",
          ir.description AS "Irregularity Description",
          isr.result_description AS "Specific Findings",
          ins.reason AS "Inspection Reasons"
      FROM inspectionresult isr
      JOIN inspection ins ON ins.id = isr.inspection_id
      JOIN irregularity ir ON ir.id = isr.found_irregularity_id
      JOIN routinesschedule rs ON rs.id = ins.routine_id
      JOIN prisonlocation pl ON pl.id = rs.prison_location_id
      WHERE rs.routines_schedule_date >= $1::date
        AND rs.routines_schedule_date <= $2::date
      ORDER BY rs.routines_schedule_date DESC
    `
    const result = await pool.query<IrregularityRow>(query, [startDate, endDate])
    return result.rows.map(toIrregularityListItem)
  },

  async getOfficerRoutines(officerCode: string = '*'): Promise<OfficerRoutineItem[]> {
    const query = `
      SELECT
          o.code::text AS "Officer Code",
          CONCAT(p.first_name, ' ', p.last_name) AS "Officer Name",
          rs.routines_schedule_date AS "Schedule Date",
          rs.routine_name AS "Routine Name",
          rs.type AS "Routine Type",
          pl.name AS "Location Name"
      FROM officer o
      JOIN person p ON p.id = o.person_id
      JOIN routinesofficer ro ON ro.officer_id = o.id
      JOIN routinesschedule rs ON rs.id = ro.routine_id
      JOIN prisonlocation pl ON pl.id = rs.prison_location_id
      WHERE $1 = '*' OR o.code::text = $1
      ORDER BY "Officer Code", "Schedule Date"
    `
    const result = await pool.query<OfficerRoutineRow>(query, [officerCode])
    return result.rows.map(toOfficerRoutineItem)
  },

  async getIrregularitiesSummary(
    startDate: string,
    endDate: string
  ): Promise<IrregularitySummaryItem[]> {
    const query = `
      SELECT
          EXTRACT(YEAR FROM rs.routines_schedule_date)::int AS "Inspection Year",
          EXTRACT(MONTH FROM rs.routines_schedule_date)::int AS "Inspection Month",
          ir.type::text AS "Irregularity Type",
          COUNT(isr.found_irregularity_id)::int AS "Total Incidents"
      FROM inspectionresult isr
      JOIN inspection ins ON ins.id = isr.inspection_id
      JOIN irregularity ir ON ir.id = isr.found_irregularity_id
      JOIN routinesschedule rs ON rs.id = ins.routine_id
      WHERE rs.routines_schedule_date >= $1::date
        AND rs.routines_schedule_date <= $2::date
      GROUP BY
          EXTRACT(YEAR FROM rs.routines_schedule_date),
          EXTRACT(MONTH FROM rs.routines_schedule_date),
          ir.type
      ORDER BY
          "Inspection Year" DESC,
          "Inspection Month" DESC,
          "Total Incidents" DESC
    `
    const result = await pool.query<IrregularitySummaryRow>(query, [startDate, endDate])
    return result.rows.map(toIrregularitySummaryItem)
  },
}
