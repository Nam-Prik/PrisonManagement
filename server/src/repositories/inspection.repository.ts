import pool from '../db/pool.js'
import type { CreateInspectionDto, UpdateInspectionDto } from '../dto/inspection.dto.js'
import type {
  InspectionDetailHeadRow,
  InspectionDetailLineRow,
  InspectionListRow,
} from '../models/inspection.model.js'
import { toInspectionDetail, toInspectionListItem } from '../models/inspection.model.js'

export const inspectionRepository = {
  async findAll() {
    const query = `
      SELECT 
        i.id, 
        i.code, 
        i.reason, 
        rs.routine_name,
        COUNT(isr.found_irregularity_id)::int AS irregularity_count
      FROM inspection i
      JOIN routinesschedule rs ON i.routine_id = rs.id
      LEFT JOIN inspectionresult isr ON i.id = isr.inspection_id
      GROUP BY i.id, i.code, i.reason, rs.routine_name
      ORDER BY i.id DESC
    `
    const result = await pool.query<InspectionListRow>(query)
    return result.rows.map(toInspectionListItem)
  },

  async findById(id: number) {
    const headQuery = `
      SELECT i.id, i.code, i.reason, i.routine_id, rs.routine_name
      FROM inspection i
      JOIN routinesschedule rs ON i.routine_id = rs.id
      WHERE i.id = $1
    `
    const headResult = await pool.query<InspectionDetailHeadRow>(headQuery, [id])
    if (headResult.rows.length === 0) return null

    const linesQuery = `
      SELECT 
        isr.found_irregularity_id,
        ir.description AS irregularity_description,
        ir.type::text AS irregularity_type,
        ir.severity::text AS severity,
        isr.result_description
      FROM inspectionresult isr
      JOIN irregularity ir ON isr.found_irregularity_id = ir.id
      WHERE isr.inspection_id = $1
    `
    const linesResult = await pool.query<InspectionDetailLineRow>(linesQuery, [id])

    return toInspectionDetail(headResult.rows[0], linesResult.rows)
  },

  async create(dto: CreateInspectionDto) {
    const client = await pool.connect()
    try {
      await client.query('BEGIN')

      // Insert Parent
      const headResult = await client.query<{ id: number }>(
        `INSERT INTO inspection (code, reason, routine_id) VALUES ($1, $2, $3) RETURNING id`,
        [dto.code, dto.reason, dto.routineId]
      )
      const newId = headResult.rows[0].id

      // Insert Line Items
      if (dto.results && dto.results.length > 0) {
        for (const item of dto.results) {
          await client.query(
            `INSERT INTO inspectionresult (inspection_id, found_irregularity_id, result_description)
             VALUES ($1, $2, $3)`,
            [newId, item.foundIrregularityId, item.resultDescription]
          )
        }
      }

      await client.query('COMMIT')
      return this.findById(newId)
    } catch (err) {
      await client.query('ROLLBACK')
      throw err
    } finally {
      client.release()
    }
  },

  async update(id: number, dto: UpdateInspectionDto) {
    const client = await pool.connect()
    try {
      await client.query('BEGIN')

      // Dynamic UPDATE query build for the parent (matching the Maintainer pattern)
      const fields: string[] = []
      const values: unknown[] = []
      let i = 1

      if (dto.code !== undefined) {
        fields.push(`code = $${i++}`)
        values.push(dto.code)
      }
      if (dto.reason !== undefined) {
        fields.push(`reason = $${i++}`)
        values.push(dto.reason)
      }
      if (dto.routineId !== undefined) {
        fields.push(`routine_id = $${i++}`)
        values.push(dto.routineId)
      }

      if (fields.length > 0) {
        values.push(id)
        const headResult = await client.query(
          `UPDATE inspection SET ${fields.join(', ')} WHERE id = $${i}`,
          values
        )
        if (headResult.rowCount === 0) {
          await client.query('ROLLBACK')
          return null
        }
      }

      // If line items were provided, wipe and replace
      if (dto.results !== undefined) {
        await client.query(`DELETE FROM inspectionresult WHERE inspection_id = $1`, [id])

        for (const item of dto.results) {
          await client.query(
            `INSERT INTO inspectionresult (inspection_id, found_irregularity_id, result_description)
             VALUES ($1, $2, $3)`,
            [id, item.foundIrregularityId, item.resultDescription]
          )
        }
      }

      await client.query('COMMIT')
      return this.findById(id)
    } catch (err) {
      await client.query('ROLLBACK')
      throw err
    } finally {
      client.release()
    }
  },

  async delete(id: number) {
    const client = await pool.connect()
    try {
      await client.query('BEGIN')

      // Delete children first to satisfy foreign key constraints
      await client.query(`DELETE FROM inspectionresult WHERE inspection_id = $1`, [id])
      const res = await client.query(`DELETE FROM inspection WHERE id = $1`, [id])

      await client.query('COMMIT')
      return (res.rowCount ?? 0) > 0
    } catch (err) {
      await client.query('ROLLBACK')
      throw err
    } finally {
      client.release()
    }
  },
}
