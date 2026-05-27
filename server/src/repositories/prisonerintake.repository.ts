import pool from '../db/pool.js'
import type { CreatePrisonerIntakeDto, UpdatePrisonerIntakeDto } from '../dto/prisonerintake.dto.js'
import type {
  ConfiscatedItemRow,
  PrisonerIntakeDetail,
  PrisonerIntakeDetailRow,
  PrisonerIntakeListRow,
} from '../models/prisonerintake.model.js'
import {
  toConfiscatedItemDetail,
  toPrisonerIntakeDetail,
  toPrisonerIntakeListItem,
} from '../models/prisonerintake.model.js'

export const prisonerIntakeRepository = {
  async findAll() {
    const result = await pool.query<PrisonerIntakeListRow>(`
      SELECT
        pi.id,
        pr.code AS prisoner_code,
        pe.first_name,
        pe.last_name,
        pi.intake_date,
        pi.initial_health_status,
        (SELECT COUNT(*)::int FROM ConfiscatedItem ci WHERE ci.PrisonerIntake_id = pi.id) AS item_count
      FROM PrisonerIntake pi
      JOIN Prisoner pr ON pr.prison_intake_id = pi.id
      JOIN Person pe   ON pe.id = pr.person_id
      ORDER BY pi.intake_date DESC
    `)
    return result.rows.map(toPrisonerIntakeListItem)
  },

  async findById(id: number): Promise<PrisonerIntakeDetail | null> {
    const headerResult = await pool.query<PrisonerIntakeDetailRow>(
      `SELECT
         pi.id,
         pr.id AS prisoner_id,
         pr.code AS prisoner_code,
         pe.first_name,
         pe.last_name,
         pi.intake_date,
         pi.initial_health_status,
         pr.mugshot_img_key
       FROM PrisonerIntake pi
       JOIN Prisoner pr ON pr.prison_intake_id = pi.id
       JOIN Person pe   ON pe.id = pr.person_id
       WHERE pi.id = $1`,
      [id]
    )
    if (!headerResult.rows[0]) return null

    const itemsResult = await pool.query<ConfiscatedItemRow>(
      `SELECT id, item_name, quantity, remarks
       FROM ConfiscatedItem
       WHERE PrisonerIntake_id = $1
       ORDER BY id`,
      [id]
    )

    return toPrisonerIntakeDetail(
      headerResult.rows[0],
      itemsResult.rows.map(toConfiscatedItemDetail)
    )
  },

  async create(dto: CreatePrisonerIntakeDto): Promise<PrisonerIntakeDetail | null> {
    const client = await pool.connect()
    try {
      await client.query('BEGIN')

      const prisonerCheck = await client.query<{ id: number }>(
        'SELECT id FROM Prisoner WHERE id = $1',
        [dto.prisonerId]
      )
      if (!prisonerCheck.rows[0]) {
        await client.query('ROLLBACK')
        return null
      }

      const intakeResult = await client.query<{ id: number }>(
        `INSERT INTO PrisonerIntake (intake_date, initial_health_status)
         VALUES ($1, $2) RETURNING id`,
        [new Date(dto.intakeDate), dto.initialHealthStatus]
      )
      const intakeId = intakeResult.rows[0].id

      await client.query(`UPDATE Prisoner SET prison_intake_id = $1 WHERE id = $2`, [
        intakeId,
        dto.prisonerId,
      ])

      for (const item of dto.confiscatedItems) {
        await client.query(
          `INSERT INTO ConfiscatedItem (item_name, quantity, remarks, PrisonerIntake_id)
           VALUES ($1, $2, $3, $4)`,
          [item.itemName, item.quantity, item.remarks ?? '', intakeId]
        )
      }

      await client.query('COMMIT')
      return this.findById(intakeId)
    } catch (err) {
      await client.query('ROLLBACK')
      throw err
    } finally {
      client.release()
    }
  },

  async update(id: number, dto: UpdatePrisonerIntakeDto): Promise<PrisonerIntakeDetail | null> {
    const client = await pool.connect()
    try {
      await client.query('BEGIN')

      const check = await client.query<{ id: number }>(
        'SELECT id FROM PrisonerIntake WHERE id = $1',
        [id]
      )
      if (!check.rows[0]) {
        await client.query('ROLLBACK')
        return null
      }

      if (dto.intakeDate !== undefined || dto.initialHealthStatus !== undefined) {
        const fields: string[] = []
        const values: unknown[] = []
        let p = 1
        if (dto.intakeDate !== undefined) {
          fields.push(`intake_date = $${p++}`)
          values.push(new Date(dto.intakeDate))
        }
        if (dto.initialHealthStatus !== undefined) {
          fields.push(`initial_health_status = $${p++}`)
          values.push(dto.initialHealthStatus)
        }
        values.push(id)
        await client.query(
          `UPDATE PrisonerIntake SET ${fields.join(', ')} WHERE id = $${p}`,
          values
        )
      }

      if (dto.mugshotImgKey !== undefined) {
        await client.query(`UPDATE Prisoner SET mugshot_img_key = $1 WHERE prison_intake_id = $2`, [
          dto.mugshotImgKey,
          id,
        ])
      }

      if (dto.confiscatedItems !== undefined) {
        await client.query('DELETE FROM ConfiscatedItem WHERE PrisonerIntake_id = $1', [id])
        for (const item of dto.confiscatedItems) {
          await client.query(
            `INSERT INTO ConfiscatedItem (item_name, quantity, remarks, PrisonerIntake_id)
             VALUES ($1, $2, $3, $4)`,
            [item.itemName, item.quantity, item.remarks ?? '', id]
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

      const check = await client.query<{ id: number; prisoner_id: number; person_id: number }>(
        `SELECT pi.id, pr.id AS prisoner_id, pr.person_id
         FROM PrisonerIntake pi
         JOIN Prisoner pr ON pr.prison_intake_id = pi.id
         WHERE pi.id = $1`,
        [id]
      )
      if (!check.rows[0]) {
        await client.query('ROLLBACK')
        return false
      }
      await client.query('DELETE FROM ConfiscatedItem WHERE PrisonerIntake_id = $1', [id])
      await client.query('DELETE FROM Prisoner WHERE id = $1', [check.rows[0].prisoner_id])
      await client.query('DELETE FROM Person WHERE id = $1', [check.rows[0].person_id])
      await client.query('DELETE FROM PrisonerIntake WHERE id = $1', [id])

      await client.query('COMMIT')
      return true
    } catch (err) {
      await client.query('ROLLBACK')
      throw err
    } finally {
      client.release()
    }
  },
}
