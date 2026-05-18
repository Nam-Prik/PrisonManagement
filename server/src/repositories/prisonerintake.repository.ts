import { db } from '../db/index.js'
import type {
  CreatePrisonerIntakeDto,
  PrisonerIntakeDetail,
  PrisonerIntakeListItem,
  UpdatePrisonerIntakeDto,
} from '../dto/prisonerintake.dto.js'

export class PrisonerIntakeRepository {
  /**
   * Fetch all prisoner intakes with summary info
   */
  async getAll(): Promise<PrisonerIntakeListItem[]> {
    const query = `
      SELECT
        pi.id,
        p.id as prisoner_id,
        p.code as prisoner_code,
        pe.first_name || ' ' || pe.last_name as prisoner_name,
        pi.intake_date,
        pi.initial_health_status,
        COUNT(DISTINCT ci.id) as item_count
      FROM prisonerintake pi
      LEFT JOIN prisoner p ON p.prison_intake_id = pi.id
      LEFT JOIN person pe ON p.person_id = pe.id
      LEFT JOIN confiscateditem ci ON ci.prisonerintake_id = pi.id
      GROUP BY pi.id, p.id, p.code, pe.first_name, pe.last_name, pi.intake_date, pi.initial_health_status
      ORDER BY pi.intake_date DESC
    `
    const result = await db.query(query)
    return result.rows.map((row) => ({
      id: row.id,
      prisonerId: row.prisoner_id,
      prisonerCode: row.prisoner_code,
      prisonerName: row.prisoner_name,
      intakeDate: row.intake_date,
      initialHealthStatus: row.initial_health_status,
      itemCount: parseInt(row.item_count, 10),
    }))
  }

  /**
   * Fetch a single prisoner intake with all details
   */
  async getById(id: number): Promise<PrisonerIntakeDetail | null> {
    const query = `
      SELECT
        pi.id,
        p.id as prisoner_id,
        p.code as prisoner_code,
        pe.first_name || ' ' || pe.last_name as prisoner_name,
        p.person_id as prisoner_person_id,
        pi.intake_date,
        pi.initial_health_status
      FROM prisonerintake pi
      LEFT JOIN prisoner p ON p.prison_intake_id = pi.id
      LEFT JOIN person pe ON p.person_id = pe.id
      WHERE pi.id = $1
    `
    const result = await db.query(query, [id])
    if (result.rows.length === 0) return null

    const intakeRow = result.rows[0]

    // Fetch confiscated items
    const itemsResult = await db.query(
      'SELECT id, item_name, quantity, remarks FROM confiscateditem WHERE prisonerintake_id = $1 ORDER BY id',
      [id]
    )

    return {
      id: intakeRow.id,
      prisonerId: intakeRow.prisoner_id,
      prisonerCode: intakeRow.prisoner_code,
      prisonerName: intakeRow.prisoner_name,
      prisonerPersonId: intakeRow.prisoner_person_id,
      intakeDate: intakeRow.intake_date,
      initialHealthStatus: intakeRow.initial_health_status,
      confiscatedItems: itemsResult.rows.map((row) => ({
        id: row.id,
        itemName: row.item_name,
        quantity: row.quantity,
        remarks: row.remarks,
      })),
    }
  }

  /**
   * Create a new prisoner intake
   */
  async create(dto: CreatePrisonerIntakeDto): Promise<PrisonerIntakeDetail> {
    // Start transaction
    const client = await db.connect()

    try {
      await client.query('BEGIN')
      console.log('[create] Transaction started for prisoner intake')

      // Check if prisoner exists
      console.log('[create] Checking if prisoner exists with ID:', dto.prisonerId)
      const prisonerCheck = await client.query(
        'SELECT prison_intake_id FROM prisoner WHERE id = $1',
        [dto.prisonerId]
      )
      if (prisonerCheck.rows.length === 0) {
        throw new Error('Prisoner not found')
      }
      console.log('[create] Prisoner found')

      // Create intake record
      console.log(
        '[create] Creating intake record with date:',
        dto.intakeDate,
        'and status:',
        dto.initialHealthStatus
      )
      const intakeResult = await client.query(
        'INSERT INTO prisonerintake (intake_date, initial_health_status) VALUES ($1, $2) RETURNING id',
        [new Date(dto.intakeDate), dto.initialHealthStatus]
      )
      const intakeId = intakeResult.rows[0].id
      console.log('[create] Intake record created with ID:', intakeId)

      // Update prisoner's prison_intake_id
      console.log('[create] Updating prisoner ID', dto.prisonerId, 'with intake ID:', intakeId)
      await client.query('UPDATE prisoner SET prison_intake_id = $1 WHERE id = $2', [
        intakeId,
        dto.prisonerId,
      ])
      console.log('[create] Prisoner updated with intake ID')

      // Insert confiscated items if any
      if (dto.confiscatedItems && dto.confiscatedItems.length > 0) {
        console.log('[create] Inserting', dto.confiscatedItems.length, 'confiscated items')
        for (const item of dto.confiscatedItems) {
          console.log('[create] Inserting item:', item.itemName)
          await client.query(
            'INSERT INTO confiscateditem (item_name, quantity, remarks, prisonerintake_id) VALUES ($1, $2, $3, $4)',
            [item.itemName, item.quantity, item.remarks, intakeId]
          )
        }
        console.log('[create] All confiscated items inserted')
      }

      await client.query('COMMIT')
      console.log('[create] Transaction committed')

      // Fetch and return the created intake
      console.log('[create] Fetching created intake with ID:', intakeId)
      const created = await this.getById(intakeId)
      if (!created) throw new Error('Failed to fetch created intake')
      console.log('[create] Successfully fetched created intake')
      return created
    } catch (error) {
      console.error('[create] Error during transaction:', {
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
   * Update prisoner intake
   */
  async update(id: number, dto: UpdatePrisonerIntakeDto): Promise<PrisonerIntakeDetail> {
    const client = await db.connect()

    try {
      await client.query('BEGIN')

      // Update intake record
      if (dto.intakeDate || dto.initialHealthStatus) {
        const updateFields: string[] = []
        const values: (string | null)[] = []
        let paramCount = 1

        if (dto.intakeDate) {
          updateFields.push(`intake_date = $${paramCount}`)
          values.push(dto.intakeDate)
          paramCount++
        }

        if (dto.initialHealthStatus) {
          updateFields.push(`initial_health_status = $${paramCount}`)
          values.push(dto.initialHealthStatus)
          paramCount++
        }

        values.push(String(id))

        const updateQuery = `UPDATE prisonerintake SET ${updateFields.join(', ')} WHERE id = $${paramCount}`
        await client.query(updateQuery, values)
      }

      // Handle confiscated items if provided
      if (dto.confiscatedItems) {
        // Delete existing items
        await client.query('DELETE FROM confiscateditem WHERE prisonerintake_id = $1', [id])

        // Insert new items
        for (const item of dto.confiscatedItems) {
          await client.query(
            'INSERT INTO confiscateditem (item_name, quantity, remarks, prisonerintake_id) VALUES ($1, $2, $3, $4)',
            [item.itemName, item.quantity, item.remarks, id]
          )
        }
      }

      await client.query('COMMIT')

      const updated = await this.getById(id)
      if (!updated) throw new Error('Failed to fetch updated intake')
      return updated
    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }
  }

  /**
   * Delete prisoner intake
   */
  async delete(id: number): Promise<void> {
    const client = await db.connect()

    try {
      await client.query('BEGIN')

      // Delete confiscated items first
      await client.query('DELETE FROM confiscateditem WHERE prisonerintake_id = $1', [id])

      // Clear prisoner's prison_intake_id
      await client.query(
        'UPDATE prisoner SET prison_intake_id = NULL WHERE prison_intake_id = $1',
        [id]
      )

      // Delete the intake
      await client.query('DELETE FROM prisonerintake WHERE id = $1', [id])

      await client.query('COMMIT')
    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }
  }
}

export const prisonerIntakeRepository = new PrisonerIntakeRepository()
