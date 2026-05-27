import pool from '../db/pool.js'
import type { CreatePersonDto, UpdatePersonDto } from '../dto/person.dto.js'
import type { PersonRow } from '../models/person.model.js'

const SELECT_PERSON = `
  SELECT
    p.id, p.first_name, p.last_name, p.identification_no, p.gender,
    p.address, p.contact_no, p.age, p.date_of_birth, p.blood_type,
    d.national_id_number, d.national_id_file_key,
    d.house_registration_number, d.house_registration_file_key,
    d.birth_certificate_number, d.birth_certificate_file_key
  FROM person p
  LEFT JOIN document d ON d.person_id = p.id
`

export const personRepository = {
  async findAll(): Promise<PersonRow[]> {
    const result = await pool.query<PersonRow>(
      `${SELECT_PERSON} ORDER BY p.last_name, p.first_name`
    )
    return result.rows
  },

  async findById(id: number): Promise<PersonRow | null> {
    const result = await pool.query<PersonRow>(`${SELECT_PERSON} WHERE p.id = $1`, [id])
    return result.rows[0] ?? null
  },

  async create(dto: CreatePersonDto): Promise<PersonRow> {
    const client = await pool.connect()
    try {
      await client.query('BEGIN')

      const personResult = await client.query<{ id: number }>(
        `INSERT INTO person (first_name, last_name, identification_no, gender, address, contact_no, age, date_of_birth, blood_type)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
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

      const hasDoc =
        dto.nationalIdNumber != null ||
        dto.nationalIdFileKey != null ||
        dto.houseRegistrationNumber != null ||
        dto.houseRegistrationFileKey != null ||
        dto.birthCertificateNumber != null ||
        dto.birthCertificateFileKey != null

      if (hasDoc) {
        await client.query(
          `INSERT INTO document
             (person_id, national_id_number, national_id_file_key,
              house_registration_number, house_registration_file_key,
              birth_certificate_number, birth_certificate_file_key)
           VALUES ($1,$2,$3,$4,$5,$6,$7)`,
          [
            personId,
            dto.nationalIdNumber ?? null,
            dto.nationalIdFileKey ?? null,
            dto.houseRegistrationNumber ?? null,
            dto.houseRegistrationFileKey ?? null,
            dto.birthCertificateNumber ?? null,
            dto.birthCertificateFileKey ?? null,
          ]
        )
      }

      await client.query('COMMIT')

      const full = await pool.query<PersonRow>(`${SELECT_PERSON} WHERE p.id = $1`, [personId])
      return full.rows[0]
    } catch (err) {
      await client.query('ROLLBACK')
      throw err
    } finally {
      client.release()
    }
  },

  async update(id: number, dto: UpdatePersonDto): Promise<PersonRow | null> {
    const client = await pool.connect()
    try {
      await client.query('BEGIN')

      const check = await client.query<{ id: number }>('SELECT id FROM person WHERE id = $1', [id])
      if (!check.rows[0]) {
        await client.query('ROLLBACK')
        return null
      }

      const pFields: string[] = []
      const pValues: unknown[] = []
      let pi = 1
      const personMap: [keyof UpdatePersonDto, string][] = [
        ['firstName', 'first_name'],
        ['lastName', 'last_name'],
        ['identificationNo', 'identification_no'],
        ['gender', 'gender'],
        ['address', 'address'],
        ['contactNo', 'contact_no'],
        ['age', 'age'],
        ['dateOfBirth', 'date_of_birth'],
        ['bloodType', 'blood_type'],
      ]
      for (const [key, col] of personMap) {
        if (dto[key] !== undefined) {
          pFields.push(`${col} = $${pi++}`)
          pValues.push(dto[key])
        }
      }
      if (pFields.length > 0) {
        pValues.push(id)
        await client.query(`UPDATE person SET ${pFields.join(', ')} WHERE id = $${pi}`, pValues)
      }

      const docFields = [
        ['nationalIdNumber', 'national_id_number'],
        ['nationalIdFileKey', 'national_id_file_key'],
        ['houseRegistrationNumber', 'house_registration_number'],
        ['houseRegistrationFileKey', 'house_registration_file_key'],
        ['birthCertificateNumber', 'birth_certificate_number'],
        ['birthCertificateFileKey', 'birth_certificate_file_key'],
      ] as const

      const dFields: string[] = []
      const dValues: unknown[] = []
      let di = 1
      for (const [key, col] of docFields) {
        if ((dto as Record<string, unknown>)[key] !== undefined) {
          dFields.push(`${col} = $${di++}`)
          dValues.push((dto as Record<string, unknown>)[key])
        }
      }
      if (dFields.length > 0) {
        dValues.push(id)
        const existing = await client.query('SELECT id FROM document WHERE person_id = $1', [id])
        if (existing.rows[0]) {
          await client.query(
            `UPDATE document SET ${dFields.join(', ')} WHERE person_id = $${di}`,
            dValues
          )
        } else {
          const insertCols = docFields
            .filter(([key]) => (dto as Record<string, unknown>)[key] !== undefined)
            .map(([, col]) => col)
          const insertVals = docFields
            .filter(([key]) => (dto as Record<string, unknown>)[key] !== undefined)
            .map(([key]) => (dto as Record<string, unknown>)[key])
          const placeholders = insertVals.map((_, i) => `$${i + 2}`)
          await client.query(
            `INSERT INTO document (person_id, ${insertCols.join(', ')}) VALUES ($1, ${placeholders.join(', ')})`,
            [id, ...insertVals]
          )
        }
      }

      await client.query('COMMIT')

      const full = await pool.query<PersonRow>(`${SELECT_PERSON} WHERE p.id = $1`, [id])
      return full.rows[0] ?? null
    } catch (err) {
      await client.query('ROLLBACK')
      throw err
    } finally {
      client.release()
    }
  },

  async delete(id: number): Promise<boolean> {
    const result = await pool.query('DELETE FROM person WHERE id = $1', [id])
    return (result.rowCount ?? 0) > 0
  },
}
