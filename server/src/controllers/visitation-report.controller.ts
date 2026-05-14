import type { Context } from 'hono'
import { visitationReportService } from '../services/visitation-report.service.js'
import type { ApiResponse } from '../types/response.js'

export const visitationReportController = {
  async getVisitorRelationship(c: Context) {
    const filters = {
      visitorFirstName: c.req.query('visitorFirstName'),
      visitorLastName: c.req.query('visitorLastName'),
      prisonerCode: c.req.query('prisonerCode'),
      gender: c.req.query('gender'),
      bloodType: c.req.query('bloodType'),
      status: c.req.query('status'),
      dateFrom: c.req.query('dateFrom'),
      dateTo: c.req.query('dateTo'),
    }
    const data = await visitationReportService.getVisitorRelationship(filters)
    return c.json<ApiResponse<any>>({
      data,
      message: 'Visitor relationship report retrieved successfully',
    })
  },

  async getVisitationLogs(c: Context) {
    const filters = {
      prisonerCode: c.req.query('prisonerCode'),
      visitorFirstName: c.req.query('visitorFirstName'),
      visitorLastName: c.req.query('visitorLastName'),
      status: c.req.query('status'),
      dateFrom: c.req.query('dateFrom'),
      dateTo: c.req.query('dateTo'),
    }
    const data = await visitationReportService.getVisitationLogs(filters)
    return c.json<ApiResponse<any>>({
      data,
      message: 'Visitation logs retrieved successfully',
    })
  },

  async getVisitationAnalysis(c: Context) {
    const filters = {
      prisonerCode: c.req.query('prisonerCode'),
      prisonerFirstName: c.req.query('prisonerFirstName'),
      prisonerLastName: c.req.query('prisonerLastName'),
      scoreFrom: c.req.query('scoreFrom') ? Number(c.req.query('scoreFrom')) : undefined,
      scoreTo: c.req.query('scoreTo') ? Number(c.req.query('scoreTo')) : undefined,
      dateFrom: c.req.query('dateFrom'),
      dateTo: c.req.query('dateTo'),
    }
    const data = await visitationReportService.getVisitationAnalysis(filters)
    return c.json<ApiResponse<any>>({
      data,
      message: 'Visitation support analysis retrieved successfully',
    })
  },
}
