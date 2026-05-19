import type {
  VisitationAnalysisFilters,
  VisitationAnalysisRow,
  VisitationLogFilters,
  VisitationLogRow,
  VisitorPrisonerRelationshipRow,
  VisitorRelationshipFilters,
} from '../types/dto/visitation-report.dto'
import type { ApiResponse } from '../types/response'
import http from './http'

export const getVisitorRelationship = async (
  params: VisitorRelationshipFilters
): Promise<VisitorPrisonerRelationshipRow[]> => {
  const { data } = await http.get<ApiResponse<VisitorPrisonerRelationshipRow[]>>(
    '/visitation-reports/visitor-relationship',
    { params }
  )
  return data.data
}

export const getVisitationLogs = async (
  params: VisitationLogFilters
): Promise<VisitationLogRow[]> => {
  const { data } = await http.get<ApiResponse<VisitationLogRow[]>>(
    '/visitation-reports/visitation-logs',
    { params }
  )
  return data.data
}

export const getVisitationAnalysis = async (
  params: VisitationAnalysisFilters
): Promise<VisitationAnalysisRow[]> => {
  const { data } = await http.get<ApiResponse<VisitationAnalysisRow[]>>(
    '/visitation-reports/visitation-analysis',
    { params }
  )
  return data.data
}
