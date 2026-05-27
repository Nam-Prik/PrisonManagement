import pool from '../db/pool.js'
import type {
  CreatePrisonLocationDto,
  UpdatePrisonLocationDto,
} from '../dto/prison-location.dto.js'
import type { PrisonLocationRow } from '../models/prison-location.model.js'

export const prisonLocationRepository = {
  async findAll(): Promise<PrisonLocationRow[]> {
    const result = await pool.query<PrisonLocationRow>(
      'SELECT id, name, code, purpose, max_capacity FROM prisonlocation ORDER BY name'
    )
    return result.rows
  },

  async findById(id: number): Promise<PrisonLocationRow | null> {
    const result = await pool.query<PrisonLocationRow>(
      'SELECT id, name, code, purpose, max_capacity FROM prisonlocation WHERE id = $1',
      [id]
    )
    return result.rows[0] ?? null
  },

  async create(dto: CreatePrisonLocationDto): Promise<PrisonLocationRow> {
    const result = await pool.query<PrisonLocationRow>(
      `INSERT INTO prisonlocation (name, code, purpose, max_capacity)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, code, purpose, max_capacity`,
      [dto.name, dto.code, dto.purpose, dto.maxCapacity]
    )
    return result.rows[0]
  },

  async update(id: number, dto: UpdatePrisonLocationDto): Promise<PrisonLocationRow | null> {
    const fields: string[] = []
    const values: unknown[] = []
    let i = 1
    if (dto.name !== undefined) {
      fields.push(`name = $${i++}`)
      values.push(dto.name)
    }
    if (dto.code !== undefined) {
      fields.push(`code = $${i++}`)
      values.push(dto.code)
    }
    if (dto.purpose !== undefined) {
      fields.push(`purpose = $${i++}`)
      values.push(dto.purpose)
    }
    if (dto.maxCapacity !== undefined) {
      fields.push(`max_capacity = $${i++}`)
      values.push(dto.maxCapacity)
    }
    if (fields.length === 0) return this.findById(id)
    values.push(id)
    const result = await pool.query<PrisonLocationRow>(
      `UPDATE prisonlocation SET ${fields.join(', ')} WHERE id = $${i} RETURNING id, name, code, purpose, max_capacity`,
      values
    )
    return result.rows[0] ?? null
  },

  async delete(id: number): Promise<boolean> {
    const result = await pool.query('DELETE FROM prisonlocation WHERE id = $1', [id])
    return (result.rowCount ?? 0) > 0
  },
}
