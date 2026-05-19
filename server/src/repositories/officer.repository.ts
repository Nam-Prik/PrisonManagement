import pool from '../db/pool.js'
import type { OfficerRow } from '../models/officer.model.js'

export const officerRepository = {
  async findAll(): Promise<OfficerRow[]> {
    const result = await pool.query<OfficerRow>(
      `SELECT o.id, o.code, o.rank, p.first_name, p.last_name
       FROM Officer o
       JOIN Person p ON o.person_id = p.id
       ORDER BY p.last_name, p.first_name`
    )
    return result.rows
  },
}
