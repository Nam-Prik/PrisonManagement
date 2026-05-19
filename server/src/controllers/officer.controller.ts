import type { Context } from 'hono'
import type { OfficerOption } from '../models/officer.model.js'
import { officerService } from '../services/officer.service.js'
import type { ApiResponse } from '../types/response.js'

export const officerController = {
  async getAll(c: Context) {
    const data = await officerService.getAll()
    return c.json<ApiResponse<OfficerOption[]>>({
      data,
      message: 'Officers retrieved successfully',
    })
  },
}
