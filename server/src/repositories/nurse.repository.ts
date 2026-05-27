import pool from '../db/pool.js'
import type { CreateNurseDto, UpdateNurseDto } from '../dto/nurse.dto.js'
import type { NurseRow } from '../models/nurse.model.js'

const SELECT_NURSE = `
  SELECT n.id, n.code, n.gender, n.person_id, p.first_name, p.last_name
  FROM nurse n
  JOIN person p ON n.person_id = p.id
`

export const nurseRepository = {
  async findAll(): Promise<NurseRow[]> {
    const result = await pool.query<NurseRow>(`${SELECT_NURSE} ORDER BY p.last_name, p.first_name`)
    return result.rows
  },

  async findById(id: number): Promise<NurseRow | null> {
    const result = await pool.query<NurseRow>(`${SELECT_NURSE} WHERE n.id = $1`, [id])
    return result.rows[0] ?? null
  },

  async create(dto: CreateNurseDto): Promise<NurseRow> {
    const result = await pool.query<{ id: number }>(
      'INSERT INTO nurse (person_id, code, gender) VALUES ($1, $2, $3) RETURNING id',
      [dto.personId, dto.code, dto.gender]
    )
    const id = result.rows[0].id
    const full = await pool.query<NurseRow>(`${SELECT_NURSE} WHERE n.id = $1`, [id])
    return full.rows[0]
  },

  async update(id: number, dto: UpdateNurseDto): Promise<NurseRow | null> {
    const fields: string[] = []
    const values: unknown[] = []
    let i = 1
    if (dto.personId !== undefined) {
      fields.push(`person_id = $${i++}`)
      values.push(dto.personId)
    }
    if (dto.code !== undefined) {
      fields.push(`code = $${i++}`)
      values.push(dto.code)
    }
    if (dto.gender !== undefined) {
      fields.push(`gender = $${i++}`)
      values.push(dto.gender)
    }
    if (fields.length === 0) return this.findById(id)
    values.push(id)
    const result = await pool.query<{ id: number }>(
      `UPDATE nurse SET ${fields.join(', ')} WHERE id = $${i} RETURNING id`,
      values
    )
    if (!result.rows[0]) return null
    const full = await pool.query<NurseRow>(`${SELECT_NURSE} WHERE n.id = $1`, [id])
    return full.rows[0] ?? null
  },

  async delete(id: number): Promise<boolean> {
    const result = await pool.query('DELETE FROM nurse WHERE id = $1', [id])
    return (result.rowCount ?? 0) > 0
  },
}
