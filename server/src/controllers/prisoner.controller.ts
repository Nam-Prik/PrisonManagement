import type { Context } from 'hono'
import type { PrisonerOption } from '../models/prisoner.model.js'
import { prisonerService } from '../services/prisoner.service.js'
import type { ApiResponse } from '../types/response.js'

export const prisonerController = {
  async getAll(c: Context) {
    const data = await prisonerService.getAll()
    return c.json<ApiResponse<PrisonerOption[]>>({
      data,
      message: 'Prisoners retrieved successfully',
    })
  },
}
