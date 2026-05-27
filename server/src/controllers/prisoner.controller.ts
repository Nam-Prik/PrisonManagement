import type { Context } from 'hono'
import type { CreatePrisonerDto, UpdatePrisonerDto } from '../dto/prisoner.dto.js'
import type { PrisonerDetail, PrisonerOption } from '../models/prisoner.model.js'
import { prisonerService } from '../services/prisoner.service.js'
import type { ApiResponse, ErrorResponse } from '../types/response.js'

export const prisonerController = {
  async getAll(c: Context) {
    const data = await prisonerService.getAll()
    return c.json<ApiResponse<PrisonerOption[]>>({
      data,
      message: 'Prisoners retrieved successfully',
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
    const item = await prisonerService.getById(id)
    if (!item) {
      return c.json<ErrorResponse>(
        { error: 'Not Found', message: 'Prisoner not found', statusCode: 404 },
        404
      )
    }
    return c.json<ApiResponse<PrisonerDetail>>({
      data: item,
      message: 'Prisoner retrieved successfully',
    })
  },

  async create(c: Context, dto: CreatePrisonerDto) {
    const item = await prisonerService.create(dto)
    return c.json<ApiResponse<PrisonerDetail>>(
      { data: item, message: 'Prisoner created successfully' },
      201
    )
  },

  async update(c: Context, dto: UpdatePrisonerDto) {
    const id = Number(c.req.param('id'))
    if (Number.isNaN(id)) {
      return c.json<ErrorResponse>(
        { error: 'Bad Request', message: 'Invalid ID', statusCode: 400 },
        400
      )
    }
    const item = await prisonerService.update(id, dto)
    if (!item) {
      return c.json<ErrorResponse>(
        { error: 'Not Found', message: 'Prisoner not found', statusCode: 404 },
        404
      )
    }
    return c.json<ApiResponse<PrisonerDetail>>({
      data: item,
      message: 'Prisoner updated successfully',
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
    const deleted = await prisonerService.delete(id)
    if (!deleted) {
      return c.json<ErrorResponse>(
        { error: 'Not Found', message: 'Prisoner not found', statusCode: 404 },
        404
      )
    }
    return c.json({ message: 'Prisoner deleted successfully' })
  },
}
