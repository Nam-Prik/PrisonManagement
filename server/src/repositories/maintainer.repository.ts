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
    const client = await pool.connect()
    try {
      await client.query('BEGIN')

      const personResult = await client.query<{ id: number }>(
        `INSERT INTO person
           (first_name, last_name, identification_no, gender, address, contact_no, age, date_of_birth, blood_type)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING id`,
        [
          dto.firstName,
          dto.lastName,
          dto.identificationNo ?? null,
          dto.gender,
          dto.address,
          dto.contactNo,
          dto.age,
          dto.dateOfBirth,
          dto.bloodType,
        ]
      )
      const personId = personResult.rows[0].id

      const maintainerResult = await client.query<{ id: number }>(
        `INSERT INTO maintainer (person_id, maintainance_skill, skill_description, company_name, specialization)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id`,
        [
          personId,
          dto.maintenanceSkill,
          dto.skillDescription ?? null,
          dto.companyName,
          dto.specialization,
        ]
      )
      const maintainerId = maintainerResult.rows[0].id

      await client.query('COMMIT')

      const full = await pool.query<MaintainerRow>(`${SELECT_MAINTAINER} WHERE m.id = $1`, [
        maintainerId,
      ])
      return full.rows[0]
    } catch (err) {
      await client.query('ROLLBACK')
      throw err
    } finally {
      client.release()
    }
  },

  async update(id: number, dto: UpdateMaintainerDto): Promise<MaintainerRow | null> {
    const client = await pool.connect()
    try {
      await client.query('BEGIN')

      const check = await client.query<{ person_id: number }>(
        'SELECT person_id FROM maintainer WHERE id = $1',
        [id]
      )
      if (!check.rows[0]) {
        await client.query('ROLLBACK')
        return null
      }
      const personId = check.rows[0].person_id

      // Build person UPDATE
      const pFields: string[] = []
      const pValues: unknown[] = []
      let pi = 1
      if (dto.firstName !== undefined) {
        pFields.push(`first_name = $${pi++}`)
        pValues.push(dto.firstName)
      }
      if (dto.lastName !== undefined) {
        pFields.push(`last_name = $${pi++}`)
        pValues.push(dto.lastName)
      }
      if (dto.identificationNo !== undefined) {
        pFields.push(`identification_no = $${pi++}`)
        pValues.push(dto.identificationNo)
      }
      if (dto.gender !== undefined) {
        pFields.push(`gender = $${pi++}`)
        pValues.push(dto.gender)
      }
      if (dto.address !== undefined) {
        pFields.push(`address = $${pi++}`)
        pValues.push(dto.address)
      }
      if (dto.contactNo !== undefined) {
        pFields.push(`contact_no = $${pi++}`)
        pValues.push(dto.contactNo)
      }
      if (dto.age !== undefined) {
        pFields.push(`age = $${pi++}`)
        pValues.push(dto.age)
      }
      if (dto.dateOfBirth !== undefined) {
        pFields.push(`date_of_birth = $${pi++}`)
        pValues.push(dto.dateOfBirth)
      }
      if (dto.bloodType !== undefined) {
        pFields.push(`blood_type = $${pi++}`)
        pValues.push(dto.bloodType)
      }

      if (pFields.length > 0) {
        pValues.push(personId)
        await client.query(`UPDATE person SET ${pFields.join(', ')} WHERE id = $${pi}`, pValues)
      }

      // Build maintainer UPDATE
      const mFields: string[] = []
      const mValues: unknown[] = []
      let mi = 1
      if (dto.maintenanceSkill !== undefined) {
        mFields.push(`maintainance_skill = $${mi++}`)
        mValues.push(dto.maintenanceSkill)
      }
      if (dto.skillDescription !== undefined) {
        mFields.push(`skill_description = $${mi++}`)
        mValues.push(dto.skillDescription)
      }
      if (dto.companyName !== undefined) {
        mFields.push(`company_name = $${mi++}`)
        mValues.push(dto.companyName)
      }
      if (dto.specialization !== undefined) {
        mFields.push(`specialization = $${mi++}`)
        mValues.push(dto.specialization)
      }

      if (mFields.length > 0) {
        mValues.push(id)
        await client.query(`UPDATE maintainer SET ${mFields.join(', ')} WHERE id = $${mi}`, mValues)
      }

      await client.query('COMMIT')

      const full = await pool.query<MaintainerRow>(`${SELECT_MAINTAINER} WHERE m.id = $1`, [id])
      return full.rows[0] ?? null
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

      const check = await client.query<{ person_id: number }>(
        'SELECT person_id FROM maintainer WHERE id = $1',
        [id]
      )
      if (!check.rows[0]) {
        await client.query('ROLLBACK')
        return false
      }
      const personId = check.rows[0].person_id

      await client.query('DELETE FROM maintainer WHERE id = $1', [id])
      await client.query('DELETE FROM person WHERE id = $1', [personId])

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
