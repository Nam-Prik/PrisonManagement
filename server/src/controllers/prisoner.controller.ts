import type { Context } from 'hono'
import type {
  CreatePrisonerDto,
  CreatePrisonerWithPersonDto,
  UpdatePrisonerDto,
} from '../dto/prisoner.dto.js'
import { prisonerRepository } from '../repositories/prisoner.repository.js'
import type { ApiResponse, ErrorResponse } from '../types/response.js'

export class PrisonerController {
  /**
   * GET /api/prisoner
   * Fetch all prisoners
   */
  async getAll(c: Context) {
    try {
      const prisoners = await prisonerRepository.getAll()
      return c.json<ApiResponse>({ data: prisoners, message: 'Success' }, 200)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch prisoners'
      return c.json<ErrorResponse>({ error: 'Database Error', message, statusCode: 500 }, 500)
    }
  }

  /**
   * GET /api/prisoner/search
   * Search prisoners by identification number
   */
  async search(c: Context) {
    try {
      const identificationNo = c.req.query('id')
      if (!identificationNo) {
        return c.json<ErrorResponse>(
          { error: 'Bad Request', message: 'Identification number is required', statusCode: 400 },
          400
        )
      }

      const prisoners = await prisonerRepository.searchByIdentificationNo(identificationNo)
      return c.json<ApiResponse>({ data: prisoners, message: 'Success' }, 200)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to search prisoners'
      return c.json<ErrorResponse>({ error: 'Database Error', message, statusCode: 500 }, 500)
    }
  }

  /**
   * GET /api/prisoner/:id
   * Fetch a single prisoner with details
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

      const prisoner = await prisonerRepository.getById(id)
      if (!prisoner) {
        return c.json<ErrorResponse>(
          { error: 'Not Found', message: 'Prisoner not found', statusCode: 404 },
          404
        )
      }

      return c.json<ApiResponse>({ data: prisoner, message: 'Success' }, 200)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch prisoner'
      return c.json<ErrorResponse>({ error: 'Database Error', message, statusCode: 500 }, 500)
    }
  }

  /**
   * POST /api/prisoner
   * Create a new prisoner
   */
  async create(c: Context, dto: CreatePrisonerDto) {
    try {
      const prisoner = await prisonerRepository.create(dto)
      return c.json<ApiResponse>({ data: prisoner, message: 'Prisoner created' }, 201)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create prisoner'
      const statusCode = message.includes('not found') ? 404 : 500
      return c.json<ErrorResponse>({ error: 'Creation Error', message, statusCode }, statusCode)
    }
  }

  /**
   * POST /api/prisoner/with-person
   * Create a new prisoner with person data (creates person first, then prisoner)
   */
  async createWithPerson(c: Context, dto: CreatePrisonerWithPersonDto) {
    try {
      console.log('[createWithPerson] Creating prisoner with DTO:', {
        firstName: dto.firstName,
        lastName: dto.lastName,
        gender: dto.gender,
      })
      const prisoner = await prisonerRepository.createWithPerson(dto)
      console.log('[createWithPerson] Prisoner created successfully with ID:', prisoner.id)
      return c.json<ApiResponse>({ data: prisoner, message: 'Prisoner created' }, 201)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create prisoner'
      console.error('[createWithPerson] Error:', {
        message: errorMessage,
        stack: error instanceof Error ? error.stack : 'No stack trace',
      })
      return c.json<ErrorResponse>(
        { error: 'Creation Error', message: errorMessage, statusCode: 500 },
        500
      )
    }
  }

  /**
   * PUT /api/prisoner/:id
   * Update prisoner
   */
  async update(c: Context, dto: UpdatePrisonerDto) {
    try {
      const id = parseInt(c.req.param('id'), 10)
      if (Number.isNaN(id)) {
        return c.json<ErrorResponse>(
          { error: 'Invalid ID', message: 'ID must be a number', statusCode: 400 },
          400
        )
      }

      const existing = await prisonerRepository.getById(id)
      if (!existing) {
        return c.json<ErrorResponse>(
          { error: 'Not Found', message: 'Prisoner not found', statusCode: 404 },
          404
        )
      }

      const prisoner = await prisonerRepository.update(id, dto)
      return c.json<ApiResponse>({ data: prisoner, message: 'Prisoner updated' }, 200)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update prisoner'
      return c.json<ErrorResponse>({ error: 'Update Error', message, statusCode: 500 }, 500)
    }
  }

  /**
   * POST /api/prisoner/:id/mugshot
   * Update prisoner mugshot image key
   */
  async updateMugshot(c: Context) {
    try {
      const id = parseInt(c.req.param('id'), 10)
      if (Number.isNaN(id)) {
        return c.json<ErrorResponse>(
          { error: 'Invalid ID', message: 'ID must be a number', statusCode: 400 },
          400
        )
      }

      const existing = await prisonerRepository.getById(id)
      if (!existing) {
        return c.json<ErrorResponse>(
          { error: 'Not Found', message: 'Prisoner not found', statusCode: 404 },
          404
        )
      }

      const body = await c.req.json<{ mugshotImgKey: string | null }>()
      await prisonerRepository.updateMugshot(id, body.mugshotImgKey)

      const updated = await prisonerRepository.getById(id)
      return c.json<ApiResponse>({ data: updated, message: 'Mugshot updated' }, 200)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update mugshot'
      return c.json<ErrorResponse>({ error: 'Update Error', message, statusCode: 500 }, 500)
    }
  }

  /**
   * DELETE /api/prisoner/:id
   * Delete prisoner
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

      const existing = await prisonerRepository.getById(id)
      if (!existing) {
        return c.json<ErrorResponse>(
          { error: 'Not Found', message: 'Prisoner not found', statusCode: 404 },
          404
        )
      }

      await prisonerRepository.delete(id)
      return c.json<ApiResponse>({ data: null, message: 'Prisoner deleted' }, 200)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete prisoner'
      return c.json<ErrorResponse>({ error: 'Deletion Error', message, statusCode: 500 }, 500)
    }
  }

  /**
   * POST /api/prisoner/:id/copy
   * Copy/duplicate prisoner
   */
  async copy(c: Context) {
    try {
      const id = parseInt(c.req.param('id'), 10)
      if (Number.isNaN(id)) {
        return c.json<ErrorResponse>(
          { error: 'Invalid ID', message: 'ID must be a number', statusCode: 400 },
          400
        )
      }

      const existing = await prisonerRepository.getById(id)
      if (!existing) {
        return c.json<ErrorResponse>(
          { error: 'Not Found', message: 'Prisoner not found', statusCode: 404 },
          404
        )
      }

      const copied = await prisonerRepository.copy(id)
      return c.json<ApiResponse>({ data: copied, message: 'Prisoner copied' }, 201)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to copy prisoner'
      return c.json<ErrorResponse>({ error: 'Copy Error', message, statusCode: 500 }, 500)
    }
  }
}

export const prisonerController = new PrisonerController()
