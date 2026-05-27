import type { Context } from 'hono'
import type { CreateNurseDto, UpdateNurseDto } from '../dto/nurse.dto.js'
import type { Nurse } from '../models/nurse.model.js'
import { nurseService } from '../services/nurse.service.js'
import type { ApiResponse, ErrorResponse } from '../types/response.js'

export const nurseController = {
  async getAll(c: Context) {
    const data = await nurseService.getAll()
    return c.json<ApiResponse<Nurse[]>>({ data, message: 'Nurses retrieved successfully' })
  },

  async getById(c: Context) {
    const id = Number(c.req.param('id'))
    if (Number.isNaN(id)) {
      return c.json<ErrorResponse>(
        { error: 'Bad Request', message: 'Invalid ID', statusCode: 400 },
        400
      )
    }
    const item = await nurseService.getById(id)
    if (!item) {
      return c.json<ErrorResponse>(
        { error: 'Not Found', message: 'Nurse not found', statusCode: 404 },
        404
      )
    }
    return c.json<ApiResponse<Nurse>>({ data: item, message: 'Nurse retrieved successfully' })
  },

  async create(c: Context, dto: CreateNurseDto) {
    const item = await nurseService.create(dto)
    return c.json<ApiResponse<Nurse>>({ data: item, message: 'Nurse created successfully' }, 201)
  },

  async update(c: Context, dto: UpdateNurseDto) {
    const id = Number(c.req.param('id'))
    if (Number.isNaN(id)) {
      return c.json<ErrorResponse>(
        { error: 'Bad Request', message: 'Invalid ID', statusCode: 400 },
        400
      )
    }
    const item = await nurseService.update(id, dto)
    if (!item) {
      return c.json<ErrorResponse>(
        { error: 'Not Found', message: 'Nurse not found', statusCode: 404 },
        404
      )
    }
    return c.json<ApiResponse<Nurse>>({ data: item, message: 'Nurse updated successfully' })
  },

  async delete(c: Context) {
    const id = Number(c.req.param('id'))
    if (Number.isNaN(id)) {
      return c.json<ErrorResponse>(
        { error: 'Bad Request', message: 'Invalid ID', statusCode: 400 },
        400
      )
    }
    const deleted = await nurseService.delete(id)
    if (!deleted) {
      return c.json<ErrorResponse>(
        { error: 'Not Found', message: 'Nurse not found', statusCode: 404 },
        404
      )
    }
    return c.json({ message: 'Nurse deleted successfully' })
  },
}
