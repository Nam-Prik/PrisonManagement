import pool from '../db/pool.js'
import type { CreateTreatmentDto, UpdateTreatmentDto } from '../dto/treatment.dto.js'
import type {
  NurseOptionRow,
  TreatmentDetail,
  TreatmentDetailRow,
  TreatmentListItem,
  TreatmentListRow,
} from '../models/treatment.model.js'
import { toNurseOption, toTreatmentDetail, toTreatmentListItem } from '../models/treatment.model.js'

export const treatmentRepository = {
  async findById(id: number): Promise<TreatmentDetail | null> {
    const result = await pool.query<TreatmentDetailRow>(
      `SELECT id, prisoner_id, nurse_id, description, diagnose_date
       FROM treatment
       WHERE id = $1`,
      [id]
    )

    if (!result.rows[0]) return null
    return toTreatmentDetail(result.rows[0])
  },

  async findNurses(): Promise<NurseOptionRow[]> {
    const result = await pool.query<NurseOptionRow>(
      `SELECT n.id, n.code, p.first_name, p.last_name
       FROM nurse n
       JOIN person p ON p.id = n.person_id
       ORDER BY p.last_name, p.first_name`
    )
    return result.rows
  },

  async create(dto: CreateTreatmentDto): Promise<TreatmentDetail | null> {
    const client = await pool.connect()
    try {
      await client.query('BEGIN')
      await client.query(
        `SELECT setval(pg_get_serial_sequence('treatment', 'id'), COALESCE(MAX(id), 0)) FROM treatment`
      )

      const result = await client.query<{ id: number }>(
        `INSERT INTO treatment (prisoner_id, nurse_id, description, diagnose_date)
         VALUES ($1, $2, $3, $4)
         RETURNING id`,
        [dto.prisonerId, dto.nurseId, dto.description || null, dto.diagnoseDate]
      )

      const createdId = result.rows[0]?.id
      await client.query('COMMIT')
      if (!createdId) return null
      return this.findById(createdId)
    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }
  },

  async delete(id: number): Promise<boolean> {
    const result = await pool.query('DELETE FROM treatment WHERE id = $1', [id])
    return (result.rowCount ?? 0) > 0
  },

  async findAll(): Promise<TreatmentListItem[]> {
    const result = await pool.query<TreatmentListRow>(
      `SELECT
         t.id,
         t.prisoner_id,
         p.code AS prisoner_code,
         pp.first_name AS prisoner_first_name,
         pp.last_name AS prisoner_last_name,
         t.nurse_id,
         n.code AS nurse_code,
         pn.first_name AS nurse_first_name,
         pn.last_name AS nurse_last_name,
         t.diagnose_date,
         t.description
       FROM treatment t
       JOIN prisoner p ON p.id = t.prisoner_id
       JOIN person pp ON pp.id = p.person_id
       JOIN nurse n ON n.id = t.nurse_id
       JOIN person pn ON pn.id = n.person_id
       ORDER BY t.diagnose_date DESC`
    )

    return result.rows.map(toTreatmentListItem)
  },

  async update(id: number, dto: UpdateTreatmentDto): Promise<TreatmentDetail | null> {
    const client = await pool.connect()
    try {
      await client.query('BEGIN')
      const existing = await client.query<{ id: number }>('SELECT id FROM treatment WHERE id = $1', [id])
      if (!existing.rows[0]) {
        await client.query('ROLLBACK')
        return null
      }

      await client.query(
        `UPDATE treatment
         SET prisoner_id = $1, nurse_id = $2, description = $3, diagnose_date = $4
         WHERE id = $5`,
        [dto.prisonerId, dto.nurseId, dto.description || null, dto.diagnoseDate, id]
      )

      await client.query('COMMIT')
      return this.findById(id)
    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }
  },
}
