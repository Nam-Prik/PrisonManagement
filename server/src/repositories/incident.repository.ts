import pool from '../db/pool.js'
import type { CreateIncidentDto, UpdateIncidentDto } from '../dto/incident.dto.js'
import type {
  IncidentDetail,
  IncidentDetailRow,
  IncidentListRow,
  InvolvedPrisonerRow,
} from '../models/incident.model.js'
import { toIncidentDetail, toInvolvedPrisonerItem } from '../models/incident.model.js'

export const incidentRepository = {
  async findAll(): Promise<IncidentListRow[]> {
    const result = await pool.query<IncidentListRow>(`
      SELECT
        pi.id,
        pi.incident_datetime,
        pi.description,
        pl.name AS location_name,
        pl.code AS location_code,
        p.first_name AS officer_first_name,
        p.last_name  AS officer_last_name,
        o.code       AS officer_code,
        COUNT(ip.prisoner_id)::int AS involved_count
      FROM PrisonerIncidents pi
      JOIN PrisonLocation pl ON pi.prison_location_id = pl.id
      JOIN Officer o         ON pi.reporting_officer_id = o.id
      JOIN Person p          ON o.person_id = p.id
      LEFT JOIN InvolvedPrisoner ip ON pi.id = ip.prisoner_incicent_id
      GROUP BY pi.id, pi.incident_datetime, pi.description,
               pl.name, pl.code, p.first_name, p.last_name, o.code
      ORDER BY pi.incident_datetime DESC
    `)
    return result.rows
  },

  async findById(id: number): Promise<IncidentDetail | null> {
    const headerResult = await pool.query<IncidentDetailRow>(
      `SELECT
         pi.id,
         pi.incident_datetime,
         pi.description,
         pi.prison_location_id,
         pl.name AS location_name,
         pi.reporting_officer_id,
         p.first_name AS officer_first_name,
         p.last_name  AS officer_last_name,
         o.code       AS officer_code
       FROM PrisonerIncidents pi
       JOIN PrisonLocation pl ON pi.prison_location_id = pl.id
       JOIN Officer o         ON pi.reporting_officer_id = o.id
       JOIN Person p          ON o.person_id = p.id
       WHERE pi.id = $1`,
      [id]
    )
    if (!headerResult.rows[0]) return null

    const involvedResult = await pool.query<InvolvedPrisonerRow>(
      `SELECT
         pr.id   AS prisoner_id,
         pr.code AS prisoner_code,
         pe.first_name,
         pe.last_name
       FROM InvolvedPrisoner ip
       JOIN Prisoner pr ON ip.prisoner_id = pr.id
       JOIN Person pe   ON pr.person_id = pe.id
       WHERE ip.prisoner_incicent_id = $1
       ORDER BY pe.last_name, pe.first_name`,
      [id]
    )

    return toIncidentDetail(headerResult.rows[0], involvedResult.rows.map(toInvolvedPrisonerItem))
  },

  async create(dto: CreateIncidentDto): Promise<IncidentDetail | null> {
    const client = await pool.connect()
    try {
      await client.query('BEGIN')

      const result = await client.query<{ id: number }>(
        `INSERT INTO PrisonerIncidents
           (incident_datetime, description, prison_location_id, reporting_officer_id)
         VALUES ($1, $2, $3, $4) RETURNING id`,
        [
          dto.incidentDatetime,
          dto.description ?? null,
          dto.prisonLocationId,
          dto.reportingOfficerId,
        ]
      )
      const id = result.rows[0].id

      for (const prisonerId of dto.involvedPrisonerIds) {
        await client.query(
          `INSERT INTO InvolvedPrisoner (prisoner_incicent_id, prisoner_id) VALUES ($1, $2)`,
          [id, prisonerId]
        )
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

  async update(id: number, dto: UpdateIncidentDto): Promise<IncidentDetail | null> {
    const client = await pool.connect()
    try {
      await client.query('BEGIN')

      const check = await client.query<{ id: number }>(
        'SELECT id FROM PrisonerIncidents WHERE id = $1',
        [id]
      )
      if (!check.rows[0]) {
        await client.query('ROLLBACK')
        return null
      }

      await client.query(
        `UPDATE PrisonerIncidents
         SET incident_datetime    = $1,
             description          = $2,
             prison_location_id   = $3,
             reporting_officer_id = $4
         WHERE id = $5`,
        [
          dto.incidentDatetime,
          dto.description ?? null,
          dto.prisonLocationId,
          dto.reportingOfficerId,
          id,
        ]
      )

      await client.query('DELETE FROM InvolvedPrisoner WHERE prisoner_incicent_id = $1', [id])
      for (const prisonerId of dto.involvedPrisonerIds) {
        await client.query(
          `INSERT INTO InvolvedPrisoner (prisoner_incicent_id, prisoner_id) VALUES ($1, $2)`,
          [id, prisonerId]
        )
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

      const check = await client.query<{ id: number }>(
        'SELECT id FROM PrisonerIncidents WHERE id = $1',
        [id]
      )
      if (!check.rows[0]) {
        await client.query('ROLLBACK')
        return false
      }

      await client.query('DELETE FROM InvolvedPrisoner WHERE prisoner_incicent_id = $1', [id])
      await client.query('DELETE FROM PrisonerIncidents WHERE id = $1', [id])

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
