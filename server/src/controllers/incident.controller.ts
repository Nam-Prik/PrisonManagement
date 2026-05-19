import type { Context } from 'hono'
import type { CreateIncidentDto, UpdateIncidentDto } from '../dto/incident.dto.js'
import type { IncidentDetail, IncidentListItem } from '../models/incident.model.js'
import { incidentService } from '../services/incident.service.js'
import type { ApiResponse, ErrorResponse } from '../types/response.js'

export const incidentController = {
  async getAll(c: Context) {
    const data = await incidentService.getAll()
    return c.json<ApiResponse<IncidentListItem[]>>({
      data,
      message: 'Incidents retrieved successfully',
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
    const item = await incidentService.getById(id)
    if (!item) {
      return c.json<ErrorResponse>(
        { error: 'Not Found', message: 'Incident not found', statusCode: 404 },
        404
      )
    }
    return c.json<ApiResponse<IncidentDetail>>({
      data: item,
      message: 'Incident retrieved successfully',
    })
  },

  async create(c: Context, dto: CreateIncidentDto) {
    const item = await incidentService.create(dto)
    if (!item) {
      return c.json<ErrorResponse>(
        { error: 'Internal Server Error', message: 'Failed to create incident', statusCode: 500 },
        500
      )
    }
    return c.json<ApiResponse<IncidentDetail>>(
      { data: item, message: 'Incident created successfully' },
      201
    )
  },

  async update(c: Context, dto: UpdateIncidentDto) {
    const id = Number(c.req.param('id'))
    if (Number.isNaN(id)) {
      return c.json<ErrorResponse>(
        { error: 'Bad Request', message: 'Invalid ID', statusCode: 400 },
        400
      )
    }
    const item = await incidentService.update(id, dto)
    if (!item) {
      return c.json<ErrorResponse>(
        { error: 'Not Found', message: 'Incident not found', statusCode: 404 },
        404
      )
    }
    return c.json<ApiResponse<IncidentDetail>>({
      data: item,
      message: 'Incident updated successfully',
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
    const deleted = await incidentService.delete(id)
    if (!deleted) {
      return c.json<ErrorResponse>(
        { error: 'Not Found', message: 'Incident not found', statusCode: 404 },
        404
      )
    }
    return c.json({ message: 'Incident deleted successfully' })
  },
}
