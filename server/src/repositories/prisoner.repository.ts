import pool from '../db/pool.js'
import type { CreatePrisonerDto, UpdatePrisonerDto } from '../dto/prisoner.dto.js'
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

  async findById(id: number): Promise<PrisonerDetailRow | null> {
    const result = await pool.query<PrisonerDetailRow>(
      `SELECT pr.id, pr.code, pr.person_id, pr.mugshot_img_key,
              pr.evaluation, pr.evaluation_score, pr.prison_intake_id,
              p.first_name, p.last_name
       FROM prisoner pr
       JOIN person p ON pr.person_id = p.id
       WHERE pr.id = $1`,
      [id]
    )
    return result.rows[0] ?? null
  },

  async create(dto: CreatePrisonerDto): Promise<PrisonerDetailRow> {
    const result = await pool.query<{ id: number }>(
      `INSERT INTO prisoner (person_id, prison_intake_id, code, mugshot_img_key, evaluation, evaluation_score)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      [
        dto.personId,
        dto.prisonIntakeId,
        dto.code,
        dto.mugshotImgKey ?? null,
        dto.evaluation ?? null,
        dto.evaluationScore ?? null,
      ]
    )
    const id = result.rows[0].id
    const full = await this.findById(id)
    if (!full) throw new Error('Prisoner not found after insert')
    return full
  },

  async update(id: number, dto: UpdatePrisonerDto): Promise<PrisonerDetailRow | null> {
    const fields: string[] = []
    const values: unknown[] = []
    let i = 1
    if (dto.code !== undefined) {
      fields.push(`code = $${i++}`)
      values.push(dto.code)
    }
    if (dto.mugshotImgKey !== undefined) {
      fields.push(`mugshot_img_key = $${i++}`)
      values.push(dto.mugshotImgKey)
    }
    if (dto.evaluation !== undefined) {
      fields.push(`evaluation = $${i++}`)
      values.push(dto.evaluation)
    }
    if (dto.evaluationScore !== undefined) {
      fields.push(`evaluation_score = $${i++}`)
      values.push(dto.evaluationScore)
    }
    if (fields.length === 0) return this.findById(id)
    values.push(id)
    const result = await pool.query<{ id: number }>(
      `UPDATE prisoner SET ${fields.join(', ')} WHERE id = $${i} RETURNING id`,
      values
    )
    if (!result.rows[0]) return null
    return this.findById(id)
  },

  async delete(id: number): Promise<boolean> {
    const result = await pool.query('DELETE FROM prisoner WHERE id = $1', [id])
    return (result.rowCount ?? 0) > 0
  },
}

export interface PrisonerDetailRow {
  id: number
  code: string
  person_id: number
  mugshot_img_key: string | null
  evaluation: string | null
  evaluation_score: number | null
  prison_intake_id: number
  first_name: string
  last_name: string
}
