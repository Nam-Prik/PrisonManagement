import pool from '../db/pool.js'

export const officerReportRepository = {
  async getOfficerRoutines(officerCode?: string) {
    let query = `
      SELECT 
          o.id::text AS "officerCode",
          p.first_name || ' ' || p.last_name AS "officerName",
          rs.routines_schedule_date AS "scheduleDate",
          rs.routine_name AS "routineName",
          rs.type::text AS "routineType",
          pl.name AS "locationName"
      FROM routinesschedule rs
      JOIN routinesofficer ro ON rs.id = ro.routine_id
      JOIN officer o ON ro.officer_id = o.id
      JOIN person p ON o.person_id = p.id
      JOIN prisonlocation pl ON rs.prison_location_id = pl.id
    `
    const values: unknown[] = []

    if (officerCode && officerCode !== '*' && officerCode.toLowerCase() !== 'all') {
      query += ` WHERE o.id = $1`
      values.push(Number(officerCode))
    }

    query += ` ORDER BY rs.routines_schedule_date DESC`

    const result = await pool.query(query, values)
    return result.rows
  },

  async listIrregularities(startDate: string, endDate: string) {
    const query = `
      SELECT 
          rs.routines_schedule_date AS "inspectionDate",
          pl.name AS "locationName",
          irr.type::text AS "irregularityType",
          irr.description AS "irregularityDescription",
          ir.result_description AS "specificFindings",
          i.reason AS "inspectionReasons"
      FROM inspectionresult ir
      JOIN inspection i ON ir.inspection_id = i.id
      JOIN routinesschedule rs ON i.routine_id = rs.id
      JOIN prisonlocation pl ON rs.prison_location_id = pl.id
      JOIN irregularity irr ON ir.found_irregularity_id = irr.id
      WHERE rs.routines_schedule_date >= $1 
        AND rs.routines_schedule_date <= $2
      ORDER BY rs.routines_schedule_date DESC, i.code ASC
    `
    const result = await pool.query(query, [startDate, endDate])
    return result.rows
  },

  async getIrregularitiesSummary(startDate: string, endDate: string) {
    const query = `
      SELECT 
          TO_CHAR(rs.routines_schedule_date, 'YYYY') AS "inspectionYear",
          TO_CHAR(rs.routines_schedule_date, 'FMMonth') AS "inspectionMonth",
          irr.type::text AS "irregularityType",
          COUNT(ir.found_irregularity_id)::int AS "totalIncidents"
      FROM inspectionresult ir
      JOIN inspection i ON ir.inspection_id = i.id
      JOIN routinesschedule rs ON i.routine_id = rs.id
      JOIN irregularity irr ON ir.found_irregularity_id = irr.id
      WHERE rs.routines_schedule_date >= $1 
        AND rs.routines_schedule_date <= $2
      GROUP BY 
          "inspectionYear", 
          "inspectionMonth", 
          EXTRACT(MONTH FROM rs.routines_schedule_date), 
          irr.type
      ORDER BY 
          "inspectionYear" DESC, 
          EXTRACT(MONTH FROM rs.routines_schedule_date) DESC, 
          "totalIncidents" DESC
    `
    const result = await pool.query(query, [startDate, endDate])
    return result.rows
  },
}
