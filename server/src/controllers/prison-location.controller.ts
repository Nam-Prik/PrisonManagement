import type { Context } from 'hono'
import type {
  CreatePrisonLocationDto,
  UpdatePrisonLocationDto,
} from '../dto/prison-location.dto.js'
import type { PrisonLocation } from '../models/prison-location.model.js'
import { prisonLocationService } from '../services/prison-location.service.js'
import type { ApiResponse, ErrorResponse } from '../types/response.js'

export const prisonLocationController = {
  async getAll(c: Context) {
    const locations = await prisonLocationService.getAll()
    return c.json<ApiResponse<PrisonLocation[]>>({
      data: locations,
      message: 'Prison locations retrieved successfully',
    })
  },

  async getById(c: Context) {
    const id = Number(c.req.param('id'))
    if (Number.isNaN(id)) {
      return c.json<ErrorResponse>(
        { error: 'Bad Request', message: 'Invalid ID', statusCode: 400 },
        400
      )
    }
    const item = await prisonLocationService.getById(id)
    if (!item) {
      return c.json<ErrorResponse>(
        { error: 'Not Found', message: 'Prison location not found', statusCode: 404 },
        404
      )
    }
    return c.json<ApiResponse<PrisonLocation>>({
      data: item,
      message: 'Prison location retrieved successfully',
    })
  },

  async create(c: Context, dto: CreatePrisonLocationDto) {
    const item = await prisonLocationService.create(dto)
    return c.json<ApiResponse<PrisonLocation>>(
      { data: item, message: 'Prison location created successfully' },
      201
    )
  },

  async update(c: Context, dto: UpdatePrisonLocationDto) {
    const id = Number(c.req.param('id'))
    if (Number.isNaN(id)) {
      return c.json<ErrorResponse>(
        { error: 'Bad Request', message: 'Invalid ID', statusCode: 400 },
        400
      )
    }
    const item = await prisonLocationService.update(id, dto)
    if (!item) {
      return c.json<ErrorResponse>(
        { error: 'Not Found', message: 'Prison location not found', statusCode: 404 },
        404
      )
    }
    return c.json<ApiResponse<PrisonLocation>>({
      data: item,
      message: 'Prison location updated successfully',
    })
  },

  async delete(c: Context) {
    const id = Number(c.req.param('id'))
    if (Number.isNaN(id)) {
      return c.json<ErrorResponse>(
        { error: 'Bad Request', message: 'Invalid ID', statusCode: 400 },
        400
      )
    }
    const deleted = await prisonLocationService.delete(id)
    if (!deleted) {
      return c.json<ErrorResponse>(
        { error: 'Not Found', message: 'Prison location not found', statusCode: 404 },
        404
      )
    }
    return c.json({ message: 'Prison location deleted successfully' })
  },
}
