import type { Context } from 'hono'
import {
  CreatePrisonerIntakeSchema,
  UpdatePrisonerIntakeSchema,
} from '../dto/prisonerintake.dto.js'
import type {
  PrisonerIntakeDetail,
  PrisonerIntakeListItem,
} from '../models/prisonerintake.model.js'
import { prisonerIntakeService } from '../services/prisonerintake.service.js'
import { uploadMugshot } from '../services/s3uploader.js'
import type { ApiResponse, ErrorResponse } from '../types/response.js'

export const prisonerIntakeController = {
  async getAll(c: Context) {
    const data = await prisonerIntakeService.getAll()
    return c.json<ApiResponse<PrisonerIntakeListItem[]>>({
      data,
      message: 'Prisoner intakes retrieved successfully',
    })
  },

  async getById(c: Context) {
    const id = Number(c.req.param('id'))
    if (Number.isNaN(id) || id <= 0) {
      return c.json<ErrorResponse>(
        { error: 'Bad Request', message: 'Invalid id', statusCode: 400 },
        400
      )
    }
    const data = await prisonerIntakeService.getById(id)
    if (!data) {
      return c.json<ErrorResponse>(
        { error: 'Not Found', message: 'Prisoner intake not found', statusCode: 404 },
        404
      )
    }
    return c.json<ApiResponse<PrisonerIntakeDetail>>({
      data,
      message: 'Prisoner intake retrieved successfully',
    })
  },

  async create(c: Context) {
    const body = await c.req.json()
    const parsed = CreatePrisonerIntakeSchema.safeParse(body)
    if (!parsed.success) {
      return c.json<ErrorResponse>(
        {
          error: 'Validation Error',
          message: parsed.error.issues[0]?.message ?? 'Invalid input',
          statusCode: 400,
        },
        400
      )
    }
    const data = await prisonerIntakeService.create(parsed.data)
    return c.json<ApiResponse<PrisonerIntakeDetail | null>>(
      { data, message: 'Prisoner intake created successfully' },
      201
    )
  },

  async update(c: Context) {
    const id = Number(c.req.param('id'))
    if (Number.isNaN(id) || id <= 0) {
      return c.json<ErrorResponse>(
        { error: 'Bad Request', message: 'Invalid id', statusCode: 400 },
        400
      )
    }
    const body = await c.req.json()
    const parsed = UpdatePrisonerIntakeSchema.safeParse(body)
    if (!parsed.success) {
      return c.json<ErrorResponse>(
        {
          error: 'Validation Error',
          message: parsed.error.issues[0]?.message ?? 'Invalid input',
          statusCode: 400,
        },
        400
      )
    }
    const data = await prisonerIntakeService.update(id, parsed.data)
    if (!data) {
      return c.json<ErrorResponse>(
        { error: 'Not Found', message: 'Prisoner intake not found', statusCode: 404 },
        404
      )
    }
    return c.json<ApiResponse<PrisonerIntakeDetail>>({
      data,
      message: 'Prisoner intake updated successfully',
    })
  },

  async uploadMugshotFile(c: Context) {
    const body = await c.req.json<{ base64?: string; filename?: string; contentType?: string }>()
    const { base64, filename, contentType } = body
    if (!base64 || !filename || !contentType) {
      return c.json<ErrorResponse>(
        {
          error: 'Bad Request',
          message: 'base64, filename, and contentType are required',
          statusCode: 400,
        },
        400
      )
    }
    if (!contentType.startsWith('image/')) {
      return c.json<ErrorResponse>(
        { error: 'Bad Request', message: 'File must be an image', statusCode: 400 },
        400
      )
    }
    const buffer = Buffer.from(base64, 'base64')
    if (buffer.length > 5 * 1024 * 1024) {
      return c.json<ErrorResponse>(
        { error: 'Bad Request', message: 'File exceeds 5 MB limit', statusCode: 400 },
        400
      )
    }
    const key = await uploadMugshot(buffer, filename, contentType)
    return c.json<ApiResponse<{ key: string }>>({ data: { key }, message: 'Mugshot uploaded' })
  },

  async delete(c: Context) {
    const id = Number(c.req.param('id'))
    if (Number.isNaN(id) || id <= 0) {
      return c.json<ErrorResponse>(
        { error: 'Bad Request', message: 'Invalid id', statusCode: 400 },
        400
      )
    }
    const deleted = await prisonerIntakeService.delete(id)
    if (!deleted) {
      return c.json<ErrorResponse>(
        { error: 'Not Found', message: 'Prisoner intake not found', statusCode: 404 },
        404
      )
    }
    return c.json<ApiResponse<null>>({ data: null, message: 'Prisoner intake deleted' })
  },
}
