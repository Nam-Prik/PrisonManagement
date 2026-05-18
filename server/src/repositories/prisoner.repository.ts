import { db } from '../db/index.js'
import type {
  CreatePrisonerDto,
  CreatePrisonerWithPersonDto,
  PrisonerDetail,
  PrisonerListItem,
  UpdatePrisonerDto,
} from '../dto/prisoner.dto.js'

export class PrisonerRepository {
  /**
   * Fetch all prisoners with their basic info
   */
  async getAll(): Promise<PrisonerListItem[]> {
    const query = `
      SELECT
        p.id,
        p.code,
        pe.identification_no as "identificationNo",
        pe.first_name as "firstName",
        pe.last_name as "lastName",
        pe.age,
        p.evaluation,
        p.evaluation_score as "evaluationScore",
        p.mugshot_img_key IS NOT NULL as "hasMugshot"
      FROM prisoner p
      LEFT JOIN person pe ON p.person_id = pe.id
      ORDER BY p.id DESC
    `
    const result = await db.query(query)
    return result.rows.map((row) => ({
      id: row.id,
      code: row.code,
      identificationNo: row.identificationNo,
      firstName: row.firstName,
      lastName: row.lastName,
      age: row.age,
      evaluation: row.evaluation,
      evaluationScore: row.evaluationScore,
      hasMugshot: row.hasMugshot,
    }))
  }

  /**
   * Search prisoners by identification number
   */
  async searchByIdentificationNo(identificationNo: string): Promise<PrisonerListItem[]> {
    const query = `
      SELECT
        p.id,
        p.code,
        pe.identification_no as "identificationNo",
        pe.first_name as "firstName",
        pe.last_name as "lastName",
        pe.age,
        p.evaluation,
        p.evaluation_score as "evaluationScore",
        p.mugshot_img_key IS NOT NULL as "hasMugshot"
      FROM prisoner p
      LEFT JOIN person pe ON p.person_id = pe.id
      WHERE pe.identification_no ILIKE $1
      ORDER BY p.id DESC
    `
    const result = await db.query(query, [`%${identificationNo}%`])
    return result.rows.map((row) => ({
      id: row.id,
      code: row.code,
      identificationNo: row.identificationNo,
      firstName: row.firstName,
      lastName: row.lastName,
      age: row.age,
      evaluation: row.evaluation,
      evaluationScore: row.evaluationScore,
      hasMugshot: row.hasMugshot,
    }))
  }

  /**
   * Fetch a single prisoner with all details
   */
  async getById(id: number): Promise<PrisonerDetail | null> {
    const query = `
      SELECT
        p.id,
        p.code,
        p.person_id as "personId",
        pe.identification_no as "identificationNo",
        pe.first_name as "firstName",
        pe.last_name as "lastName",
        pe.gender,
        pe.address,
        pe.contact_no as "contactNo",
        pe.age,
        pe.date_of_birth as "dateOfBirth",
        pe.blood_type as "bloodType",
        p.evaluation,
        p.evaluation_score as "evaluationScore",
        p.mugshot_img_key as "mugshotImgKey",
        p.prison_intake_id as "prisonIntakeId"
      FROM prisoner p
      LEFT JOIN person pe ON p.person_id = pe.id
      WHERE p.id = $1
    `
    const result = await db.query(query, [id])
    if (result.rows.length === 0) return null

    const row = result.rows[0]
    return {
      id: row.id,
      code: row.code,
      personId: row.personId,
      identificationNo: row.identificationNo,
      firstName: row.firstName,
      lastName: row.lastName,
      gender: row.gender,
      address: row.address,
      contactNo: row.contactNo,
      age: row.age,
      dateOfBirth: row.dateOfBirth,
      bloodType: row.bloodType,
      evaluation: row.evaluation,
      evaluationScore: row.evaluationScore,
      mugshotImgKey: row.mugshotImgKey,
      prisonIntakeId: row.prisonIntakeId,
    }
  }

  /**
   * Create a new prisoner (requires existing person)
   */
  async create(dto: CreatePrisonerDto): Promise<PrisonerDetail> {
    const client = await db.connect()

    try {
      await client.query('BEGIN')

      // Check if person exists
      const personCheck = await client.query('SELECT id FROM person WHERE id = $1', [dto.personId])
      if (personCheck.rows.length === 0) {
        throw new Error('Person not found')
      }

      // Generate prisoner code
      const codeResult = await client.query(
        `SELECT MAX(CAST(SUBSTRING(code, 2) AS INTEGER)) as max_num FROM prisoner`
      )
      const maxNum = codeResult.rows[0]?.max_num || 0
      const code = `P${String(maxNum + 1).padStart(5, '0')}`

      // Create prisoner
      const prisonerResult = await client.query(
        `INSERT INTO prisoner (code, person_id, evaluation)
         VALUES ($1, $2, $3)
         RETURNING id`,
        [code, dto.personId, dto.evaluation || null]
      )

      await client.query('COMMIT')

      const created = await this.getById(prisonerResult.rows[0].id)
      if (!created) throw new Error('Failed to fetch created prisoner')
      return created
    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }
  }

  /**
   * Create a new prisoner with person data (creates person first, then prisoner)
   */
  async createWithPerson(dto: CreatePrisonerWithPersonDto): Promise<PrisonerDetail> {
    const client = await db.connect()

    try {
      await client.query('BEGIN')
      console.log('[createWithPerson] Transaction started')

      // Create person record
      console.log('[createWithPerson] Inserting person:', {
        firstName: dto.firstName,
        lastName: dto.lastName,
        gender: dto.gender,
      })
      const personResult = await client.query(
        `INSERT INTO person (first_name, last_name, identification_no, gender, address, contact_no, age, date_of_birth, blood_type)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING id`,
        [
          dto.firstName,
          dto.lastName,
          dto.identificationNo || null,
          dto.gender,
          dto.address,
          dto.contactNo,
          dto.age,
          dto.dateOfBirth,
          dto.bloodType,
        ]
      )

      const personId = personResult.rows[0].id
      console.log('[createWithPerson] Person created with ID:', personId)

      // Generate prisoner code
      const codeResult = await client.query(
        `SELECT MAX(CAST(SUBSTRING(code, 2) AS INTEGER)) as max_num FROM prisoner`
      )
      const maxNum = codeResult.rows[0]?.max_num || 0
      const code = `P${String(maxNum + 1).padStart(5, '0')}`
      console.log('[createWithPerson] Generated prisoner code:', code)

      // Create prisoner record
      console.log('[createWithPerson] Inserting prisoner with person_id:', personId)
      const prisonerResult = await client.query(
        `INSERT INTO prisoner (code, person_id, evaluation)
         VALUES ($1, $2, $3)
         RETURNING id`,
        [code, personId, dto.evaluation || null]
      )

      const prisonerId = prisonerResult.rows[0].id
      console.log('[createWithPerson] Prisoner created with ID:', prisonerId)

      await client.query('COMMIT')
      console.log('[createWithPerson] Transaction committed')

      const created = await this.getById(prisonerId)
      if (!created) throw new Error('Failed to fetch created prisoner')
      console.log('[createWithPerson] Successfully fetched created prisoner')
      return created
    } catch (error) {
      console.error('[createWithPerson] Error during transaction:', {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : 'No stack trace',
      })
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }
  }

  /**
   * Update prisoner
   */
  async update(id: number, dto: UpdatePrisonerDto): Promise<PrisonerDetail> {
    const query = `
      UPDATE prisoner
      SET evaluation = COALESCE($1, evaluation)
      WHERE id = $2
      RETURNING id
    `
    await db.query(query, [dto.evaluation || null, id])

    const updated = await this.getById(id)
    if (!updated) throw new Error('Failed to fetch updated prisoner')
    return updated
  }

  /**
   * Update prisoner mugshot
   */
  async updateMugshot(id: number, mugshotImgKey: string | null): Promise<void> {
    const query = `
      UPDATE prisoner
      SET mugshot_img_key = $1
      WHERE id = $2
    `
    await db.query(query, [mugshotImgKey, id])
  }

  /**
   * Delete prisoner
   */
  async delete(id: number): Promise<void> {
    const query = `DELETE FROM prisoner WHERE id = $1`
    await db.query(query, [id])
  }

  /**
   * Copy/duplicate prisoner
   */
  async copy(id: number): Promise<PrisonerDetail> {
    const client = await db.connect()

    try {
      await client.query('BEGIN')

      // Get the original prisoner
      const original = await this.getById(id)
      if (!original) throw new Error('Prisoner not found')

      // Create new person with same data
      const personResult = await client.query(
        `INSERT INTO person (first_name, last_name, identification_no, gender, address, contact_no, age, date_of_birth, blood_type)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING id`,
        [
          original.firstName,
          original.lastName,
          original.identificationNo,
          original.gender,
          original.address,
          original.contactNo,
          original.age,
          original.dateOfBirth,
          original.bloodType,
        ]
      )

      const newPersonId = personResult.rows[0].id

      // Generate new prisoner code
      const codeResult = await client.query(
        `SELECT MAX(CAST(SUBSTRING(code, 2) AS INTEGER)) as max_num FROM prisoner`
      )
      const maxNum = codeResult.rows[0]?.max_num || 0
      const newCode = `P${String(maxNum + 1).padStart(5, '0')}`

      // Create new prisoner
      const prisonerResult = await client.query(
        `INSERT INTO prisoner (code, person_id, evaluation)
         VALUES ($1, $2, $3)
         RETURNING id`,
        [newCode, newPersonId, original.evaluation]
      )

      await client.query('COMMIT')

      const copied = await this.getById(prisonerResult.rows[0].id)
      if (!copied) throw new Error('Failed to fetch copied prisoner')
      return copied
    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }
  }
}

export const prisonerRepository = new PrisonerRepository()
