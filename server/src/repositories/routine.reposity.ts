import pool from '../db/pool.js'

export const routineRepository = {
  async getOptions() {
    const query = `
      SELECT 
        rs.id, 
        rs.routine_name AS "routineName", 
        rs.type::text AS "type", 
        pl.name AS "locationName"
      FROM routinesschedule rs
      JOIN prisonlocation pl ON rs.prison_location_id = pl.id
      ORDER BY rs.routines_schedule_date DESC, rs.id DESC
    `
    const result = await pool.query(query)
    return result.rows
  },
}
