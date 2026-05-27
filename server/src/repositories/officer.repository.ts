import pool from '../db/pool.js'
import type { CreateOfficerDto, UpdateOfficerDto } from '../dto/officer.dto.js'
import type { OfficerRow } from '../models/officer.model.js'

const SELECT_OFFICER = `
  SELECT o.id, o.code, o.rank, o.gender, o.person_id, p.first_name, p.last_name
  FROM officer o
  JOIN person p ON o.person_id = p.id
`

export const officerRepository = {
  async findAll(): Promise<OfficerRow[]> {
    const result = await pool.query<OfficerRow>(
      `${SELECT_OFFICER} ORDER BY p.last_name, p.first_name`
    )
    return result.rows
  },

  async findById(id: number): Promise<OfficerRow | null> {
    const result = await pool.query<OfficerRow>(`${SELECT_OFFICER} WHERE o.id = $1`, [id])
    return result.rows[0] ?? null
  },

  async create(dto: CreateOfficerDto): Promise<OfficerRow> {
    const result = await pool.query<{ id: number }>(
      'INSERT INTO officer (person_id, code, rank, gender) VALUES ($1, $2, $3, $4) RETURNING id',
      [dto.personId, dto.code, dto.rank, dto.gender]
    )
    const id = result.rows[0].id
    const full = await pool.query<OfficerRow>(`${SELECT_OFFICER} WHERE o.id = $1`, [id])
    return full.rows[0]
  },

  async update(id: number, dto: UpdateOfficerDto): Promise<OfficerRow | null> {
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
    if (dto.rank !== undefined) {
      fields.push(`rank = $${i++}`)
      values.push(dto.rank)
    }
    if (dto.gender !== undefined) {
      fields.push(`gender = $${i++}`)
      values.push(dto.gender)
    }
    if (fields.length === 0) return this.findById(id)
    values.push(id)
    const result = await pool.query<{ id: number }>(
      `UPDATE officer SET ${fields.join(', ')} WHERE id = $${i} RETURNING id`,
      values
    )
    if (!result.rows[0]) return null
    const full = await pool.query<OfficerRow>(`${SELECT_OFFICER} WHERE o.id = $1`, [id])
    return full.rows[0] ?? null
  },

  async delete(id: number): Promise<boolean> {
    const result = await pool.query('DELETE FROM officer WHERE id = $1', [id])
    return (result.rowCount ?? 0) > 0
  },
}
