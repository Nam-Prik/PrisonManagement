import type { Context } from 'hono'
import type { CreateMaintainanceDto, UpdateMaintainanceDto } from '../dto/maintainance.dto.js'
import type { MaintainanceDetail, MaintainanceListItem } from '../models/maintainance.model.js'
import { maintainanceService } from '../services/maintainance.service.js'
import type { ApiResponse, ErrorResponse } from '../types/response.js'

export const maintainanceController = {
  async getAll(c: Context) {
    const items = await maintainanceService.getAll()
    return c.json<ApiResponse<MaintainanceListItem[]>>({
      data: items,
      message: 'Maintenance tasks retrieved successfully',
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
    const item = await maintainanceService.getById(id)
    if (!item) {
      return c.json<ErrorResponse>(
        { error: 'Not Found', message: 'Maintenance task not found', statusCode: 404 },
        404
      )
    }
    return c.json<ApiResponse<MaintainanceDetail>>({
      data: item,
      message: 'Maintenance task retrieved successfully',
    })
  },

  async create(c: Context, dto: CreateMaintainanceDto) {
    const item = await maintainanceService.create(dto)
    if (!item) {
      return c.json<ErrorResponse>(
        {
          error: 'Internal Server Error',
          message: 'Failed to create maintenance task',
          statusCode: 500,
        },
        500
      )
    }
    return c.json<ApiResponse<MaintainanceDetail>>(
      { data: item, message: 'Maintenance task created successfully' },
      201
    )
  },

  async update(c: Context, dto: UpdateMaintainanceDto) {
    const id = Number(c.req.param('id'))
    if (Number.isNaN(id)) {
      return c.json<ErrorResponse>(
        { error: 'Bad Request', message: 'Invalid ID', statusCode: 400 },
        400
      )
    }
    const item = await maintainanceService.update(id, dto)
    if (!item) {
      return c.json<ErrorResponse>(
        { error: 'Not Found', message: 'Maintenance task not found', statusCode: 404 },
        404
      )
    }
    return c.json<ApiResponse<MaintainanceDetail>>({
      data: item,
      message: 'Maintenance task updated successfully',
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
    const deleted = await maintainanceService.delete(id)
    if (!deleted) {
      return c.json<ErrorResponse>(
        { error: 'Not Found', message: 'Maintenance task not found', statusCode: 404 },
        404
      )
    }
    return c.json({ message: 'Maintenance task deleted successfully' })
  },
}
