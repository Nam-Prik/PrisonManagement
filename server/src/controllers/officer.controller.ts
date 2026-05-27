import type { Context } from 'hono'
import type { CreateOfficerDto, UpdateOfficerDto } from '../dto/officer.dto.js'
import type { Officer, OfficerOption } from '../models/officer.model.js'
import { officerService } from '../services/officer.service.js'
import type { ApiResponse, ErrorResponse } from '../types/response.js'

export const officerController = {
  async getAll(c: Context) {
    const data = await officerService.getAll()
    return c.json<ApiResponse<OfficerOption[]>>({
      data,
      message: 'Officers retrieved successfully',
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
    const item = await officerService.getById(id)
    if (!item) {
      return c.json<ErrorResponse>(
        { error: 'Not Found', message: 'Officer not found', statusCode: 404 },
        404
      )
    }
    return c.json<ApiResponse<Officer>>({ data: item, message: 'Officer retrieved successfully' })
  },

  async create(c: Context, dto: CreateOfficerDto) {
    const item = await officerService.create(dto)
    return c.json<ApiResponse<Officer>>(
      { data: item, message: 'Officer created successfully' },
      201
    )
  },

  async update(c: Context, dto: UpdateOfficerDto) {
    const id = Number(c.req.param('id'))
    if (Number.isNaN(id)) {
      return c.json<ErrorResponse>(
        { error: 'Bad Request', message: 'Invalid ID', statusCode: 400 },
        400
      )
    }
    const item = await officerService.update(id, dto)
    if (!item) {
      return c.json<ErrorResponse>(
        { error: 'Not Found', message: 'Officer not found', statusCode: 404 },
        404
      )
    }
    return c.json<ApiResponse<Officer>>({ data: item, message: 'Officer updated successfully' })
  },

  async delete(c: Context) {
    const id = Number(c.req.param('id'))
    if (Number.isNaN(id)) {
      return c.json<ErrorResponse>(
        { error: 'Bad Request', message: 'Invalid ID', statusCode: 400 },
        400
      )
    }
    const deleted = await officerService.delete(id)
    if (!deleted) {
      return c.json<ErrorResponse>(
        { error: 'Not Found', message: 'Officer not found', statusCode: 404 },
        404
      )
    }
    return c.json({ message: 'Officer deleted successfully' })
  },
}
