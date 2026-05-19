import pool from '../db/pool.js'
import type { PrisonerRow } from '../models/prisoner.model.js'

export const prisonerRepository = {
  async findAll(): Promise<PrisonerRow[]> {
    const result = await pool.query<PrisonerRow>(
      `SELECT pr.id, pr.code, p.first_name, p.last_name, pr.evaluation_score
       FROM Prisoner pr
       JOIN Person p ON pr.person_id = p.id
       ORDER BY p.last_name, p.first_name`
    )
    return result.rows
  },
}
