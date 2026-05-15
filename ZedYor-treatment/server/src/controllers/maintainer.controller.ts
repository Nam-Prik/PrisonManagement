import type { Context } from 'hono'
import type { CreateMaintainerDto, UpdateMaintainerDto } from '../dto/maintainer.dto.js'
import type { Maintainer } from '../models/maintainer.model.js'
import { maintainerService } from '../services/maintainer.service.js'
import type { ApiResponse, ErrorResponse } from '../types/response.js'

export const maintainerController = {
  async getAll(c: Context) {
    const maintainers = await maintainerService.getAll()
    return c.json<ApiResponse<Maintainer[]>>({
      data: maintainers,
      message: 'Maintainers retrieved successfully',
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
    const maintainer = await maintainerService.getById(id)
    if (!maintainer) {
      return c.json<ErrorResponse>(
        { error: 'Not Found', message: 'Maintainer not found', statusCode: 404 },
        404
      )
    }
    return c.json<ApiResponse<Maintainer>>({
      data: maintainer,
      message: 'Maintainer retrieved successfully',
    })
  },

  async create(c: Context, dto: CreateMaintainerDto) {
    const maintainer = await maintainerService.create(dto)
    return c.json<ApiResponse<Maintainer>>(
      { data: maintainer, message: 'Maintainer created successfully' },
      201
    )
  },

  async update(c: Context, dto: UpdateMaintainerDto) {
    const id = Number(c.req.param('id'))
    if (Number.isNaN(id)) {
      return c.json<ErrorResponse>(
        { error: 'Bad Request', message: 'Invalid ID', statusCode: 400 },
        400
      )
    }
    if (Object.keys(dto).length === 0) {
      return c.json<ErrorResponse>(
        { error: 'Bad Request', message: 'No fields to update', statusCode: 400 },
        400
      )
    }
    const maintainer = await maintainerService.update(id, dto)
    if (!maintainer) {
      return c.json<ErrorResponse>(
        { error: 'Not Found', message: 'Maintainer not found', statusCode: 404 },
        404
      )
    }
    return c.json<ApiResponse<Maintainer>>({
      data: maintainer,
      message: 'Maintainer updated successfully',
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
    const deleted = await maintainerService.delete(id)
    if (!deleted) {
      return c.json<ErrorResponse>(
        { error: 'Not Found', message: 'Maintainer not found', statusCode: 404 },
        404
      )
    }
    return c.json({ message: 'Maintainer deleted successfully' })
  },
}
