import type { Context } from 'hono'
import type { CreateTreatmentDto, UpdateTreatmentDto } from '../dto/treatment.dto.js'
import { treatmentService } from '../services/treatment.service.js'
import type { ApiResponse, ErrorResponse } from '../types/response.js'

export const treatmentController = {
  async getAll(c: Context) {
    const treatments = await treatmentService.getAll()
    return c.json<ApiResponse<typeof treatments>>({
      data: treatments,
      message: 'Treatment records retrieved successfully',
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

    const treatment = await treatmentService.getById(id)
    if (!treatment) {
      return c.json<ErrorResponse>(
        { error: 'Not Found', message: 'Treatment record not found', statusCode: 404 },
        404
      )
    }

    return c.json<ApiResponse<typeof treatment>>({
      data: treatment,
      message: 'Treatment record retrieved successfully',
    })
  },

  async getNurses(c: Context) {
    const nurses = await treatmentService.getNurses()
    return c.json<ApiResponse<typeof nurses>>({
      data: nurses,
      message: 'Nurse options retrieved successfully',
    })
  },

  async create(c: Context) {
    const dto = await c.req.json<CreateTreatmentDto>()
    const treatment = await treatmentService.create(dto)
    return c.json<ApiResponse<typeof treatment>>(
      { data: treatment, message: 'Treatment record created successfully' },
      201
    )
  },

  async update(c: Context) {
    const id = Number(c.req.param('id'))
    if (Number.isNaN(id)) {
      return c.json<ErrorResponse>(
        { error: 'Bad Request', message: 'Invalid ID', statusCode: 400 },
        400
      )
    }

    const dto = await c.req.json<UpdateTreatmentDto>()
    const treatment = await treatmentService.update(id, dto)
    if (!treatment) {
      return c.json<ErrorResponse>(
        { error: 'Not Found', message: 'Treatment record not found', statusCode: 404 },
        404
      )
    }

    return c.json<ApiResponse<typeof treatment>>({
      data: treatment,
      message: 'Treatment record updated successfully',
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

    const deleted = await treatmentService.delete(id)
    if (!deleted) {
      return c.json<ErrorResponse>(
        { error: 'Not Found', message: 'Treatment record not found', statusCode: 404 },
        404
      )
    }

    return c.json({ message: 'Treatment record deleted successfully' })
  },
}
