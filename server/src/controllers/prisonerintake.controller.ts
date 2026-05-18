import type { Context } from 'hono'
import type { CreatePrisonerIntakeDto, UpdatePrisonerIntakeDto } from '../dto/prisonerintake.dto.js'
import { prisonerIntakeRepository } from '../repositories/prisonerintake.repository.js'
import type { ApiResponse, ErrorResponse } from '../types/response.js'

export class PrisonerIntakeController {
  /**
   * GET /api/prisoner-intake
   * Fetch all prisoner intakes
   */
  async getAll(c: Context) {
    try {
      const intakes = await prisonerIntakeRepository.getAll()
      return c.json<ApiResponse>({ data: intakes, message: 'Success' }, 200)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch intakes'
      return c.json<ErrorResponse>({ error: 'Database Error', message, statusCode: 500 }, 500)
    }
  }

  /**
   * GET /api/prisoner-intake/:id
   * Fetch a single prisoner intake with details
   */
  async getById(c: Context) {
    try {
      const id = parseInt(c.req.param('id'), 10)
      if (Number.isNaN(id)) {
        return c.json<ErrorResponse>(
          { error: 'Invalid ID', message: 'ID must be a number', statusCode: 400 },
          400
        )
      }

      const intake = await prisonerIntakeRepository.getById(id)
      if (!intake) {
        return c.json<ErrorResponse>(
          { error: 'Not Found', message: 'Prisoner intake not found', statusCode: 404 },
          404
        )
      }

      return c.json<ApiResponse>({ data: intake, message: 'Success' }, 200)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch intake'
      return c.json<ErrorResponse>({ error: 'Database Error', message, statusCode: 500 }, 500)
    }
  }

  /**
   * POST /api/prisoner-intake
   * Create a new prisoner intake
   */
  async create(c: Context, dto: CreatePrisonerIntakeDto) {
    try {
      console.log('[create] Creating prisoner intake with DTO:', {
        prisonerId: dto.prisonerId,
        intakeDate: dto.intakeDate,
        initialHealthStatus: dto.initialHealthStatus,
        itemCount: dto.confiscatedItems?.length || 0,
      })
      const intake = await prisonerIntakeRepository.create(dto)
      console.log('[create] Prisoner intake created successfully with ID:', intake.id)
      return c.json<ApiResponse>({ data: intake, message: 'Prisoner intake created' }, 201)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create intake'
      console.error('[create] Error creating prisoner intake:', {
        message,
        stack: error instanceof Error ? error.stack : 'No stack trace',
        dto,
      })
      const statusCode = message.includes('not found') ? 404 : 500
      return c.json<ErrorResponse>({ error: 'Creation Error', message, statusCode }, statusCode)
    }
  }

  /**
   * PUT /api/prisoner-intake/:id
   * Update prisoner intake
   */
  async update(c: Context, dto: UpdatePrisonerIntakeDto) {
    try {
      const id = parseInt(c.req.param('id'), 10)
      if (Number.isNaN(id)) {
        return c.json<ErrorResponse>(
          { error: 'Invalid ID', message: 'ID must be a number', statusCode: 400 },
          400
        )
      }

      // Check if intake exists
      const existing = await prisonerIntakeRepository.getById(id)
      if (!existing) {
        return c.json<ErrorResponse>(
          { error: 'Not Found', message: 'Prisoner intake not found', statusCode: 404 },
          404
        )
      }

      const intake = await prisonerIntakeRepository.update(id, dto)
      return c.json<ApiResponse>({ data: intake, message: 'Prisoner intake updated' }, 200)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update intake'
      return c.json<ErrorResponse>({ error: 'Update Error', message, statusCode: 500 }, 500)
    }
  }

  /**
   * DELETE /api/prisoner-intake/:id
   * Delete prisoner intake
   */
  async delete(c: Context) {
    try {
      const id = parseInt(c.req.param('id'), 10)
      if (Number.isNaN(id)) {
        return c.json<ErrorResponse>(
          { error: 'Invalid ID', message: 'ID must be a number', statusCode: 400 },
          400
        )
      }

      const existing = await prisonerIntakeRepository.getById(id)
      if (!existing) {
        return c.json<ErrorResponse>(
          { error: 'Not Found', message: 'Prisoner intake not found', statusCode: 404 },
          404
        )
      }

      await prisonerIntakeRepository.delete(id)
      return c.json<ApiResponse>({ data: null, message: 'Prisoner intake deleted' }, 200)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete intake'
      return c.json<ErrorResponse>({ error: 'Deletion Error', message, statusCode: 500 }, 500)
    }
  }
}

export const prisonerIntakeController = new PrisonerIntakeController()
