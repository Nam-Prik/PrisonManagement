import pool from '../db/pool.js'
import type { CreateMaintainerDto, UpdateMaintainerDto } from '../dto/maintainer.dto.js'
import type { MaintainerRow } from '../models/maintainer.model.js'

const SELECT_MAINTAINER = `
  SELECT
    m.id, m.person_id, m.maintainance_skill, m.skill_description, m.company_name, m.specialization,
    p.first_name, p.last_name, p.identification_no, p.gender,
    p.address, p.contact_no, p.age, p.date_of_birth, p.blood_type
  FROM maintainer m
  JOIN person p ON m.person_id = p.id
`

export const maintainerRepository = {
  async findAll(): Promise<MaintainerRow[]> {
    const result = await pool.query<MaintainerRow>(`${SELECT_MAINTAINER} ORDER BY m.id`)
    return result.rows
  },

  async findById(id: number): Promise<MaintainerRow | null> {
    const result = await pool.query<MaintainerRow>(`${SELECT_MAINTAINER} WHERE m.id = $1`, [id])
    return result.rows[0] ?? null
  },

  async create(dto: CreateMaintainerDto): Promise<MaintainerRow> {
    const result = await pool.query<{ id: number }>(
      `INSERT INTO maintainer (person_id, maintainance_skill, skill_description, company_name, specialization)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      [
        dto.personId,
        dto.maintenanceSkill,
        dto.skillDescription ?? null,
        dto.companyName,
        dto.specialization,
      ]
    )
    const id = result.rows[0].id
    const full = await pool.query<MaintainerRow>(`${SELECT_MAINTAINER} WHERE m.id = $1`, [id])
    return full.rows[0]
  },

  async update(id: number, dto: UpdateMaintainerDto): Promise<MaintainerRow | null> {
    const fields: string[] = []
    const values: unknown[] = []
    let i = 1
    if (dto.personId !== undefined) {
      fields.push(`person_id = $${i++}`)
      values.push(dto.personId)
    }
    if (dto.maintenanceSkill !== undefined) {
      fields.push(`maintainance_skill = $${i++}`)
      values.push(dto.maintenanceSkill)
    }
    if (dto.skillDescription !== undefined) {
      fields.push(`skill_description = $${i++}`)
      values.push(dto.skillDescription)
    }
    if (dto.companyName !== undefined) {
      fields.push(`company_name = $${i++}`)
      values.push(dto.companyName)
    }
    if (dto.specialization !== undefined) {
      fields.push(`specialization = $${i++}`)
      values.push(dto.specialization)
    }
    if (fields.length === 0) return this.findById(id)
    values.push(id)
    const result = await pool.query<{ id: number }>(
      `UPDATE maintainer SET ${fields.join(', ')} WHERE id = $${i} RETURNING id`,
      values
    )
    if (!result.rows[0]) return null
    const full = await pool.query<MaintainerRow>(`${SELECT_MAINTAINER} WHERE m.id = $1`, [id])
    return full.rows[0] ?? null
  },

  async delete(id: number): Promise<boolean> {
    const result = await pool.query('DELETE FROM maintainer WHERE id = $1', [id])
    return (result.rowCount ?? 0) > 0
  },
}
