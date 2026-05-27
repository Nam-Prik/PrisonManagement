import type { Context } from 'hono'
import type { CreateIrregularityDto, UpdateIrregularityDto } from '../dto/irregularity.dto.js'
import type { Irregularity } from '../models/irregularity.model.js'
import { irregularityService } from '../services/irregularity.service.js'
import type { ApiResponse, ErrorResponse } from '../types/response.js'

export const irregularityController = {
  async getAll(c: Context) {
    const data = await irregularityService.getAll()
    return c.json<ApiResponse<Irregularity[]>>({
      data,
      message: 'Irregularities retrieved successfully',
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
    const item = await irregularityService.getById(id)
    if (!item) {
      return c.json<ErrorResponse>(
        { error: 'Not Found', message: 'Irregularity not found', statusCode: 404 },
        404
      )
    }
    return c.json<ApiResponse<Irregularity>>({
      data: item,
      message: 'Irregularity retrieved successfully',
    })
  },

  async create(c: Context, dto: CreateIrregularityDto) {
    const item = await irregularityService.create(dto)
    return c.json<ApiResponse<Irregularity>>(
      { data: item, message: 'Irregularity created successfully' },
      201
    )
  },

  async update(c: Context, dto: UpdateIrregularityDto) {
    const id = Number(c.req.param('id'))
    if (Number.isNaN(id)) {
      return c.json<ErrorResponse>(
        { error: 'Bad Request', message: 'Invalid ID', statusCode: 400 },
        400
      )
    }
    const item = await irregularityService.update(id, dto)
    if (!item) {
      return c.json<ErrorResponse>(
        { error: 'Not Found', message: 'Irregularity not found', statusCode: 404 },
        404
      )
    }
    return c.json<ApiResponse<Irregularity>>({
      data: item,
      message: 'Irregularity updated successfully',
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
    const deleted = await irregularityService.delete(id)
    if (!deleted) {
      return c.json<ErrorResponse>(
        { error: 'Not Found', message: 'Irregularity not found', statusCode: 404 },
        404
      )
    }
    return c.json({ message: 'Irregularity deleted successfully' })
  },
}
