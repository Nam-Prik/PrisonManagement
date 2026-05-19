import type { Context } from 'hono'
import type {
  IncidentByOfficer,
  InvolvedPrisonerByLocation,
  TopPrisonerIncident,
} from '../models/incident-report.model.js'
import { incidentReportService } from '../services/incident-report.service.js'
import type { ApiResponse, ErrorResponse } from '../types/response.js'

export const incidentReportController = {
  async getIncidentsByOfficer(c: Context) {
    const raw = c.req.query('officerId')
    const officerId = Number(raw)
    if (
      raw === undefined ||
      raw === '' ||
      Number.isNaN(officerId) ||
      !Number.isInteger(officerId) ||
      officerId <= 0
    ) {
      return c.json<ErrorResponse>(
        {
          error: 'Bad Request',
          message: 'Query param "officerId" must be a positive integer',
          statusCode: 400,
        },
        400
      )
    }

    const data = await incidentReportService.getIncidentsByOfficer(officerId)
    return c.json<ApiResponse<IncidentByOfficer[]>>({
      data,
      message: 'Incidents retrieved successfully',
    })
  },

  async getInvolvedPrisonersByLocation(c: Context) {
    const raw = c.req.query('locationId')
    const locationId = Number(raw)
    if (
      raw === undefined ||
      raw === '' ||
      Number.isNaN(locationId) ||
      !Number.isInteger(locationId) ||
      locationId <= 0
    ) {
      return c.json<ErrorResponse>(
        {
          error: 'Bad Request',
          message: 'Query param "locationId" must be a positive integer',
          statusCode: 400,
        },
        400
      )
    }

    const data = await incidentReportService.getInvolvedPrisonersByLocation(locationId)
    return c.json<ApiResponse<InvolvedPrisonerByLocation[]>>({
      data,
      message: 'Involved prisoners retrieved successfully',
    })
  },

  async getTopPrisonerIncidentsByLocation(c: Context) {
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

    const data = await incidentReportService.getTopPrisonerIncidentsByLocation(startDate, endDate)
    return c.json<ApiResponse<TopPrisonerIncident[]>>({
      data,
      message: 'Top prisoner incidents by location retrieved successfully',
    })
  },
}
