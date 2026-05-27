import pool from '../db/pool.js'
import type { CreateIrregularityDto, UpdateIrregularityDto } from '../dto/irregularity.dto.js'
import type { IrregularityRow } from '../models/irregularity.model.js'

export const irregularityRepository = {
  async findAll(): Promise<IrregularityRow[]> {
    const result = await pool.query<IrregularityRow>(
      'SELECT id, description, severity, type FROM irregularity ORDER BY id DESC'
    )
    return result.rows
  },

  async findById(id: number): Promise<IrregularityRow | null> {
    const result = await pool.query<IrregularityRow>(
      'SELECT id, description, severity, type FROM irregularity WHERE id = $1',
      [id]
    )
    return result.rows[0] ?? null
  },

  async create(dto: CreateIrregularityDto): Promise<IrregularityRow> {
    const result = await pool.query<IrregularityRow>(
      `INSERT INTO irregularity (type, description, severity)
       VALUES ($1, $2, $3)
       RETURNING id, description, severity, type`,
      [dto.type, dto.description ?? null, dto.severity]
    )
    return result.rows[0]
  },

  async update(id: number, dto: UpdateIrregularityDto): Promise<IrregularityRow | null> {
    const fields: string[] = []
    const values: unknown[] = []
    let i = 1
    if (dto.type !== undefined) {
      fields.push(`type = $${i++}`)
      values.push(dto.type)
    }
    if (dto.description !== undefined) {
      fields.push(`description = $${i++}`)
      values.push(dto.description)
    }
    if (dto.severity !== undefined) {
      fields.push(`severity = $${i++}`)
      values.push(dto.severity)
    }
    if (fields.length === 0) return this.findById(id)
    values.push(id)
    const result = await pool.query<IrregularityRow>(
      `UPDATE irregularity SET ${fields.join(', ')} WHERE id = $${i} RETURNING id, description, severity, type`,
      values
    )
    return result.rows[0] ?? null
  },

  async delete(id: number): Promise<boolean> {
    const result = await pool.query('DELETE FROM irregularity WHERE id = $1', [id])
    return (result.rowCount ?? 0) > 0
  },
}
