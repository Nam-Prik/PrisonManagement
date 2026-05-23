import type { Context } from 'hono'
import type {
  IrregularityListItem,
  IrregularitySummaryItem,
  OfficerRoutineItem,
} from '../models/officer-report.model.js'
import { officerReportService } from '../services/officer-report.service.js'
import type { ApiResponse, ErrorResponse } from '../types/response.js'

export const officerReportController = {
  async listIrregularities(c: Context) {
    const startDate = c.req.query('startDate')
    const endDate = c.req.query('endDate')

    if (!startDate || !endDate) {
      return c.json<ErrorResponse>(
        {
          error: 'Bad Request',
          message: 'Query params "startDate" and "endDate" are required (YYYY-MM-DD)',
          statusCode: 400,
        },
        400
      )
    }

    const datePattern = /^\d{4}-\d{2}-\d{2}$/
    if (!datePattern.test(startDate) || !datePattern.test(endDate)) {
      return c.json<ErrorResponse>(
        {
          error: 'Bad Request',
          message: 'Dates must be in YYYY-MM-DD format',
          statusCode: 400,
        },
        400
      )
    }

    if (startDate > endDate) {
      return c.json<ErrorResponse>(
        {
          error: 'Bad Request',
          message: '"startDate" must be on or before "endDate"',
          statusCode: 400,
        },
        400
      )
    }

    const data = await officerReportService.listIrregularities(startDate, endDate)

    return c.json<ApiResponse<IrregularityListItem[]>>({
      data,
      message: 'Irregularities retrieved successfully',
    })
  },

  async getOfficerRoutines(c: Context) {
    const officerCode = c.req.query('officerCode') || '*'

    const data = await officerReportService.getOfficerRoutines(officerCode)

    return c.json<ApiResponse<OfficerRoutineItem[]>>({
      data,
      message: 'Officer routines retrieved successfully',
    })
  },

  async getIrregularitiesSummary(c: Context) {
    const startDate = c.req.query('startDate')
    const endDate = c.req.query('endDate')

    if (!startDate || !endDate) {
      return c.json<ErrorResponse>(
        {
          error: 'Bad Request',
          message: 'Query params "startDate" and "endDate" are required (YYYY-MM-DD)',
          statusCode: 400,
        },
        400
      )
    }

    const datePattern = /^\d{4}-\d{2}-\d{2}$/
    if (!datePattern.test(startDate) || !datePattern.test(endDate)) {
      return c.json<ErrorResponse>(
        {
          error: 'Bad Request',
          message: 'Dates must be in YYYY-MM-DD format',
          statusCode: 400,
        },
        400
      )
    }

    if (startDate > endDate) {
      return c.json<ErrorResponse>(
        {
          error: 'Bad Request',
          message: '"startDate" must be on or before "endDate"',
          statusCode: 400,
        },
        400
      )
    }

    const data = await officerReportService.getIrregularitiesSummary(startDate, endDate)

    return c.json<ApiResponse<IrregularitySummaryItem[]>>({
      data,
      message: 'Irregularities summary retrieved successfully',
    })
  },
}
