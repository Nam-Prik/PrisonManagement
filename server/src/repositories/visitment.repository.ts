import pool from '../db/pool.js'
import type { CreateVisitmentDto, UpdateVisitmentDto } from '../dto/visitment.dto.js'
import type {
  VisitmentDetail,
  VisitmentRow,
  VisitmentVisitorRow,
} from '../models/visitment.model.js'
import {
  toVisitmentDetail,
  toVisitmentListItem,
  toVisitmentVisitor,
} from '../models/visitment.model.js'

export const visitmentRepository = {
  async findAll() {
    const result = await pool.query<VisitmentRow>(`
      SELECT 
        v.id, v.prisoner_id, v.visitment_date, v.status, v.duration, v.description,
        COUNT(vl.person_id) AS visitor_count,
        p.code as prisoner_code,
        pers.first_name || ' ' || pers.last_name as prisoner_name
      FROM visitment v
      JOIN prisoner p ON p.id = v.prisoner_id
      JOIN person pers ON pers.id = p.person_id
      LEFT JOIN visitmentlineitem vl ON vl.visitment_id = v.id
      GROUP BY v.id, v.prisoner_id, v.visitment_date, v.status, v.duration, v.description, p.code, pers.first_name, pers.last_name
      ORDER BY v.visitment_date DESC
    `)
    return result.rows.map(toVisitmentListItem)
  },

  async findById(id: number): Promise<VisitmentDetail | null> {
    const headerResult = await pool.query<VisitmentRow>(
      `
      SELECT 
        v.id, v.prisoner_id, v.visitment_date, v.status, v.duration, v.description,
        p.code as prisoner_code,
        pers.first_name || ' ' || pers.last_name as prisoner_name
      FROM visitment v
      JOIN prisoner p ON p.id = v.prisoner_id
      JOIN person pers ON pers.id = p.person_id
      WHERE v.id = $1
    `,
      [id]
    )

    if (!headerResult.rows[0]) return null

    const visitorsResult = await pool.query<VisitmentVisitorRow>(
      `
      SELECT 
        vl.visitment_id, vl.person_id, vl.relation,
        p.first_name, p.last_name, p.gender, p.identification_no
      FROM visitmentlineitem vl
      JOIN person p ON p.id = vl.person_id
      WHERE vl.visitment_id = $1
    `,
      [id]
    )

    return toVisitmentDetail(headerResult.rows[0], visitorsResult.rows.map(toVisitmentVisitor))
  },

  async create(dto: CreateVisitmentDto): Promise<VisitmentDetail | null> {
    const client = await pool.connect()
    try {
      await client.query('BEGIN')

      const result = await client.query<{ id: number }>(
        `
        INSERT INTO visitment (prisoner_id, visitment_date, duration, status, description)
        VALUES ($1, $2, $3, $4, $5) RETURNING id
      `,
        [dto.prisonerId, dto.visitmentDate, dto.duration, dto.status, dto.description]
      )

      const id = result.rows[0].id

      for (const visitor of dto.visitors) {
        await client.query(
          `
          INSERT INTO visitmentlineitem (visitment_id, person_id, relation)
          VALUES ($1, $2, $3)
        `,
          [id, visitor.personId, visitor.relation]
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

  async update(id: number, dto: UpdateVisitmentDto): Promise<VisitmentDetail | null> {
    const client = await pool.connect()
    try {
      await client.query('BEGIN')

      const check = await client.query('SELECT id FROM visitment WHERE id = $1', [id])
      if (!check.rows[0]) {
        await client.query('ROLLBACK')
        return null
      }

      await client.query(
        `
        UPDATE visitment 
        SET prisoner_id = $1, visitment_date = $2, duration = $3, status = $4, description = $5
        WHERE id = $6
      `,
        [dto.prisonerId, dto.visitmentDate, dto.duration, dto.status, dto.description, id]
      )

      await client.query('DELETE FROM visitmentlineitem WHERE visitment_id = $1', [id])
      for (const visitor of dto.visitors ?? []) {
        await client.query(
          `
          INSERT INTO visitmentlineitem (visitment_id, person_id, relation)
          VALUES ($1, $2, $3)
        `,
          [id, visitor.personId, visitor.relation]
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
      await client.query('DELETE FROM visitmentlineitem WHERE visitment_id = $1', [id])
      const result = await client.query('DELETE FROM visitment WHERE id = $1', [id])
      await client.query('COMMIT')
      return (result.rowCount ?? 0) > 0
    } catch (err) {
      await client.query('ROLLBACK')
      throw err
    } finally {
      client.release()
    }
  },

  async findPrisonerByCode(code: string) {
    const result = await pool.query(
      `
      SELECT p.id, p.code, pers.first_name, pers.last_name
      FROM prisoner p
      JOIN person pers ON pers.id = p.person_id
      WHERE p.code = $1
    `,
      [code]
    )
    if (!result.rows[0]) return null
    const row = result.rows[0]
    return {
      id: row.id,
      code: row.code,
      firstName: row.first_name,
      lastName: row.last_name,
    }
  },

  async findPersonById(id: number) {
    const result = await pool.query(
      `
      SELECT id, first_name, last_name, gender
      FROM person
      WHERE id = $1
    `,
      [id]
    )
    if (!result.rows[0]) return null
    const row = result.rows[0]
    return {
      id: row.id,
      firstName: row.first_name,
      lastName: row.last_name,
      gender: row.gender,
    }
  },

  async listAllPrisoners() {
    const result = await pool.query(`
      SELECT p.id, p.code, pers.first_name, pers.last_name
      FROM prisoner p
      JOIN person pers ON pers.id = p.person_id
      ORDER BY p.code
    `)
    return result.rows.map((row) => ({
      id: row.id,
      code: row.code,
      firstName: row.first_name,
      lastName: row.last_name,
    }))
  },

  async listAllPersons() {
    const result = await pool.query(`
      SELECT id, first_name, last_name, gender, identification_no
      FROM person
      ORDER BY first_name, last_name
    `)
    return result.rows.map((row) => ({
      id: row.id,
      firstName: row.first_name,
      lastName: row.last_name,
      gender: row.gender,
      identificationNo: row.identification_no,
    }))
  },
}
