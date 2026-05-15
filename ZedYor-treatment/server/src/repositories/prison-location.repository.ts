import pool from '../db/pool.js'
import type { PrisonLocationRow } from '../models/prison-location.model.js'

export const prisonLocationRepository = {
  async findAll(): Promise<PrisonLocationRow[]> {
    const result = await pool.query<PrisonLocationRow>(
      'SELECT id, name, code, purpose, max_capacity FROM prisonlocation ORDER BY name'
    )
    return result.rows
  },
}
