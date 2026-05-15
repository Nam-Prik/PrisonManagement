import type { Context } from 'hono'
import type { PrisonLocation } from '../models/prison-location.model.js'
import { prisonLocationService } from '../services/prison-location.service.js'
import type { ApiResponse } from '../types/response.js'

export const prisonLocationController = {
  async getAll(c: Context) {
    const locations = await prisonLocationService.getAll()
    return c.json<ApiResponse<PrisonLocation[]>>({
      data: locations,
      message: 'Prison locations retrieved successfully',
    })
  },
}
