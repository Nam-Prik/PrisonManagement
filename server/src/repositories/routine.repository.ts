import pool from '../db/pool.js'
import type { CreateRoutineDto, UpdateRoutineDto } from '../dto/routine.dto.js'
import type {
  RoutineDetailRow,
  RoutineListRow,
  RoutineOfficerRow,
} from '../models/routine.model.js'

export const routineRepository = {
  async getOptions() {
    const query = `
      SELECT rs.id, rs.routine_name AS "routineName", rs.type::text AS "type", pl.name AS "locationName"
      FROM routinesschedule rs
      JOIN prisonlocation pl ON rs.prison_location_id = pl.id
      ORDER BY rs.routines_schedule_date DESC, rs.id DESC
    `
    const result = await pool.query(query)
    return result.rows
  },

  async findAll(): Promise<RoutineListRow[]> {
    const query = `
      SELECT 
        rs.id, rs.routine_name, pl.name AS location_name, rs.routines_schedule_date, rs.type::text,
        COUNT(ro.officer_id)::int AS officer_count
      FROM routinesschedule rs
      JOIN prisonlocation pl ON rs.prison_location_id = pl.id
      LEFT JOIN routinesofficer ro ON rs.id = ro.routine_id
      GROUP BY rs.id, rs.routine_name, pl.name, rs.routines_schedule_date, rs.type
      ORDER BY rs.routines_schedule_date DESC, rs.id DESC
    `
    const result = await pool.query<RoutineListRow>(query)
    return result.rows
  },

  async findById(
    id: number
  ): Promise<{ head: RoutineDetailRow; lines: RoutineOfficerRow[] } | null> {
    const headResult = await pool.query<RoutineDetailRow>(
      `SELECT id, routine_name, prison_location_id, routines_schedule_date, type::text FROM routinesschedule WHERE id = $1`,
      [id]
    )
    if (headResult.rows.length === 0) return null

    const linesResult = await pool.query<RoutineOfficerRow>(
      `SELECT ro.officer_id, (p.first_name || ' ' || p.last_name) AS officer_name, o.code AS officer_code
       FROM routinesofficer ro
       JOIN officer o ON ro.officer_id = o.id
       JOIN person p ON o.person_id = p.id
       WHERE ro.routine_id = $1`,
      [id]
    )

    return { head: headResult.rows[0], lines: linesResult.rows }
  },

  async create(dto: CreateRoutineDto) {
    const client = await pool.connect()
    try {
      await client.query('BEGIN')
      const headResult = await client.query<{ id: number }>(
        `INSERT INTO routinesschedule (routine_name, prison_location_id, routines_schedule_date, type) 
         VALUES ($1, $2, $3, $4) RETURNING id`,
        [dto.routineName, dto.prisonLocationId, dto.routinesScheduleDate, dto.type]
      )
      const newId = headResult.rows[0].id

      if (dto.officerIds && dto.officerIds.length > 0) {
        for (const officerId of dto.officerIds) {
          await client.query(
            `INSERT INTO routinesofficer (routine_id, officer_id) VALUES ($1, $2)`,
            [newId, officerId]
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

  async update(id: number, dto: UpdateRoutineDto) {
    const client = await pool.connect()
    try {
      await client.query('BEGIN')

      const fields: string[] = []
      const values: unknown[] = []
      let i = 1

      if (dto.routineName !== undefined) {
        fields.push(`routine_name = $${i++}`)
        values.push(dto.routineName)
      }
      if (dto.prisonLocationId !== undefined) {
        fields.push(`prison_location_id = $${i++}`)
        values.push(dto.prisonLocationId)
      }
      if (dto.routinesScheduleDate !== undefined) {
        fields.push(`routines_schedule_date = $${i++}`)
        values.push(dto.routinesScheduleDate)
      }
      if (dto.type !== undefined) {
        fields.push(`type = $${i++}`)
        values.push(dto.type)
      }

      if (fields.length > 0) {
        values.push(id)
        await client.query(
          `UPDATE routinesschedule SET ${fields.join(', ')} WHERE id = $${i}`,
          values
        )
      }

      if (dto.officerIds !== undefined) {
        await client.query(`DELETE FROM routinesofficer WHERE routine_id = $1`, [id])
        for (const officerId of dto.officerIds) {
          await client.query(
            `INSERT INTO routinesofficer (routine_id, officer_id) VALUES ($1, $2)`,
            [id, officerId]
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

  async delete(id: number): Promise<boolean> {
    const client = await pool.connect()
    try {
      await client.query('BEGIN')
      await client.query(
        `DELETE FROM inspectionresult WHERE inspection_id IN (SELECT id FROM inspection WHERE routine_id = $1)`,
        [id]
      )
      await client.query(`DELETE FROM inspection WHERE routine_id = $1`, [id])
      await client.query(`DELETE FROM routinesofficer WHERE routine_id = $1`, [id])
      const res = await client.query(`DELETE FROM routinesschedule WHERE id = $1`, [id])
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
