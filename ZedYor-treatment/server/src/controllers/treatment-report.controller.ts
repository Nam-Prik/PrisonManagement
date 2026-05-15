import type { Context } from 'hono'
import type {
  MedicinePrescriptionExperience,
  NurseWorkloadPercentage,
  TreatmentExperience,
} from '../models/treatment-report.model.js'
import { treatmentReportService } from '../services/treatment-report.service.js'
import type { ApiResponse, ErrorResponse } from '../types/response.js'

const DEFAULT_CAUTION = 'Take'

function isValidDate(value: string | undefined): value is string {
  return !!value && !Number.isNaN(Date.parse(value))
}

export const treatmentReportController = {
  async getTreatmentExperience(c: Context) {
    const startDate = c.req.query('startDate')
    const endDate = c.req.query('endDate')

    if (!isValidDate(startDate) || !isValidDate(endDate)) {
      return c.json<ErrorResponse>(
        {
          error: 'Bad Request',
          message: 'Query params "startDate" and "endDate" are required and must be valid dates',
          statusCode: 400,
        },
        400
      )
    }

    if (new Date(startDate) > new Date(endDate)) {
      return c.json<ErrorResponse>(
        {
          error: 'Bad Request',
          message: 'Query param "startDate" must be earlier than or equal to "endDate"',
          statusCode: 400,
        },
        400
      )
    }

    const data = await treatmentReportService.getTreatmentExperience(startDate, endDate)
    return c.json<ApiResponse<TreatmentExperience[]>>({
      data,
      message: 'Treatment experience records retrieved successfully',
    })
  },

  async getMedicinePrescriptionExperience(c: Context) {
    const caution = c.req.query('caution') ?? DEFAULT_CAUTION
    if (!caution.trim()) {
      return c.json<ErrorResponse>(
        {
          error: 'Bad Request',
          message: 'Query param "caution" must be a non-empty string when provided',
          statusCode: 400,
        },
        400
      )
    }

    const data = await treatmentReportService.getMedicinePrescriptionExperience(caution)
    return c.json<ApiResponse<MedicinePrescriptionExperience[]>>({
      data,
      message: 'Medicine prescription report retrieved successfully',
    })
  },

  async getNurseWorkloadPercentage(c: Context) {
    const data = await treatmentReportService.getNurseWorkloadPercentage()
    return c.json<ApiResponse<NurseWorkloadPercentage[]>>({
      data,
      message: 'Nurse workload report retrieved successfully',
    })
  },
}
