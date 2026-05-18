import type { Context } from 'hono'
import type {
  CostByLocation,
  LaborByCost,
  MaintainerBySkill,
} from '../models/labor-report.model.js'
import { laborReportService } from '../services/labor-report.service.js'
import type { ApiResponse, ErrorResponse } from '../types/response.js'

const VALID_STATUSES = [
  'Reported',
  'Pending Approval',
  'Scheduled',
  'In progress',
  'On Hold',
  'Done',
  'Cancelled',
] as const

const VALID_SKILLS = [
  'Plumbing',
  'Electrical',
  'HVAC',
  'Carpentry',
  'Masonry',
  'Welding',
  'Locksmithing',
  'Painting',
  'General Maintenance',
] as const

export const laborReportController = {
  async getMaintainersBySkill(c: Context) {
    const skill = c.req.query('skill')
    if (!skill) {
      return c.json<ErrorResponse>(
        { error: 'Bad Request', message: 'Query param "skill" is required', statusCode: 400 },
        400
      )
    }
    if (!VALID_SKILLS.includes(skill as (typeof VALID_SKILLS)[number])) {
      return c.json<ErrorResponse>(
        {
          error: 'Bad Request',
          message: `Invalid skill. Valid values: ${VALID_SKILLS.join(', ')}`,
          statusCode: 400,
        },
        400
      )
    }

    const data = await laborReportService.getMaintainersBySkill(skill)
    return c.json<ApiResponse<MaintainerBySkill[]>>({
      data,
      message: 'Maintainers retrieved successfully',
    })
  },

  async getLaborByCost(c: Context) {
    const rawMin = c.req.query('minCost')
    const rawMax = c.req.query('maxCost')
    const minCost = Number(rawMin)
    if (rawMin === undefined || rawMin === '' || Number.isNaN(minCost) || minCost < 0) {
      return c.json<ErrorResponse>(
        {
          error: 'Bad Request',
          message: 'Query param "minCost" must be a non-negative number',
          statusCode: 400,
        },
        400
      )
    }

    let maxCost: number | undefined
    if (rawMax !== undefined && rawMax !== '') {
      maxCost = Number(rawMax)
      if (Number.isNaN(maxCost) || maxCost < 0) {
        return c.json<ErrorResponse>(
          {
            error: 'Bad Request',
            message: 'Query param "maxCost" must be a non-negative number',
            statusCode: 400,
          },
          400
        )
      }
      if (maxCost < minCost) {
        return c.json<ErrorResponse>(
          {
            error: 'Bad Request',
            message: '"maxCost" must be greater than or equal to "minCost"',
            statusCode: 400,
          },
          400
        )
      }
    }

    const data = await laborReportService.getLaborByCost(minCost, maxCost)
    return c.json<ApiResponse<LaborByCost[]>>({
      data,
      message: 'Labor records retrieved successfully',
    })
  },

  async getCostByLocation(c: Context) {
    const status = c.req.query('status') ?? ''
    // empty = all statuses; only validate when a specific status is provided
    if (status && !VALID_STATUSES.includes(status as (typeof VALID_STATUSES)[number])) {
      return c.json<ErrorResponse>(
        {
          error: 'Bad Request',
          message: `Invalid status. Valid values: ${VALID_STATUSES.join(', ')}`,
          statusCode: 400,
        },
        400
      )
    }

    const data = await laborReportService.getCostByLocation(status)
    return c.json<ApiResponse<CostByLocation[]>>({
      data,
      message: 'Cost by location retrieved successfully',
    })
  },
}
