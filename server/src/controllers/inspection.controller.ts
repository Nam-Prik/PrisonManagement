import type { Context } from 'hono'
import type { CreateInspectionDto, UpdateInspectionDto } from '../dto/inspection.dto.js'
import type { InspectionDetail, InspectionListItem } from '../models/inspection.model.js'
import { inspectionService } from '../services/inspection.service.js'
import type { ApiResponse, ErrorResponse } from '../types/response.js'

export const inspectionController = {
  async getAll(c: Context) {
    const inspections = await inspectionService.getAll()
    return c.json<ApiResponse<InspectionListItem[]>>({
      data: inspections,
      message: 'Inspections retrieved successfully',
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
    const inspection = await inspectionService.getById(id)
    if (!inspection) {
      return c.json<ErrorResponse>(
        { error: 'Not Found', message: 'Inspection not found', statusCode: 404 },
        404
      )
    }
    return c.json<ApiResponse<InspectionDetail>>({
      data: inspection,
      message: 'Inspection retrieved successfully',
    })
  },

  async create(c: Context, dto: CreateInspectionDto) {
    const inspection = await inspectionService.create(dto)
    return c.json<ApiResponse<InspectionDetail>>(
      { data: inspection, message: 'Inspection created successfully' },
      201
    )
  },

  async update(c: Context, dto: UpdateInspectionDto) {
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
    const inspection = await inspectionService.update(id, dto)
    if (!inspection) {
      return c.json<ErrorResponse>(
        { error: 'Not Found', message: 'Inspection not found', statusCode: 404 },
        404
      )
    }
    return c.json<ApiResponse<InspectionDetail>>({
      data: inspection,
      message: 'Inspection updated successfully',
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
    const deleted = await inspectionService.delete(id)
    if (!deleted) {
      return c.json<ErrorResponse>(
        { error: 'Not Found', message: 'Inspection not found', statusCode: 404 },
        404
      )
    }
    return c.json({ message: 'Inspection deleted successfully' })
  },
}
