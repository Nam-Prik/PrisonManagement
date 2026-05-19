import type { Context } from 'hono'
import type {
  ConfiscatedItemReport,
  IntakeByDateRange,
  TotalItemsPerIntake,
} from '../models/prisonerintake-report.model.js'
import { prisonerIntakeReportService } from '../services/prisonerintake-report.service.js'
import type { ApiResponse, ErrorResponse } from '../types/response.js'

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/

function validateDateRange(
  fromDate: string | undefined,
  toDate: string | undefined
): ErrorResponse | null {
  if (!fromDate || !toDate) {
    return {
      error: 'Bad Request',
      message: 'Query params "fromDate" and "toDate" are required (YYYY-MM-DD)',
      statusCode: 400,
    }
  }
  if (!DATE_PATTERN.test(fromDate) || !DATE_PATTERN.test(toDate)) {
    return {
      error: 'Bad Request',
      message: 'Dates must be in YYYY-MM-DD format',
      statusCode: 400,
    }
  }
  if (fromDate > toDate) {
    return {
      error: 'Bad Request',
      message: '"fromDate" must be on or before "toDate"',
      statusCode: 400,
    }
  }
  return null
}

export const prisonerIntakeReportController = {
  async getIntakesByDateRange(c: Context) {
    const fromDate = c.req.query('fromDate')
    const toDate = c.req.query('toDate')
    const prisonerCode = c.req.query('prisonerCode') || undefined

    const err = validateDateRange(fromDate, toDate)
    if (err) return c.json<ErrorResponse>(err, 400)

    const data = await prisonerIntakeReportService.getIntakesByDateRange(
      fromDate as string,
      toDate as string,
      prisonerCode
    )
    return c.json<ApiResponse<IntakeByDateRange[]>>({
      data,
      message: 'Intake report retrieved successfully',
    })
  },

  async getConfiscatedItems(c: Context) {
    const fromDate = c.req.query('fromDate')
    const toDate = c.req.query('toDate')
    const itemFilter = c.req.query('itemFilter') || undefined

    const err = validateDateRange(fromDate, toDate)
    if (err) return c.json<ErrorResponse>(err, 400)

    const data = await prisonerIntakeReportService.getConfiscatedItems(
      fromDate as string,
      toDate as string,
      itemFilter
    )
    return c.json<ApiResponse<ConfiscatedItemReport[]>>({
      data,
      message: 'Confiscated items report retrieved successfully',
    })
  },

  async getTotalItemsPerIntake(c: Context) {
    const fromDate = c.req.query('fromDate')
    const toDate = c.req.query('toDate')
    const rawTopN = c.req.query('topN')
    const topN = rawTopN ? Number(rawTopN) : 10

    const err = validateDateRange(fromDate, toDate)
    if (err) return c.json<ErrorResponse>(err, 400)

    if (Number.isNaN(topN) || topN <= 0) {
      return c.json<ErrorResponse>(
        { error: 'Bad Request', message: '"topN" must be a positive integer', statusCode: 400 },
        400
      )
    }

    const data = await prisonerIntakeReportService.getTotalItemsPerIntake(
      fromDate as string,
      toDate as string,
      topN
    )
    return c.json<ApiResponse<TotalItemsPerIntake[]>>({
      data,
      message: 'Total items analysis retrieved successfully',
    })
  },
}
