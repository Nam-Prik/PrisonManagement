import type {
  VisitationAnalysisRow,
  VisitationLogRow,
  VisitorPrisonerRelationshipRow,
} from '../types/dto/visitation-report.dto'
import type { ApiResponse } from '../types/response'
import http from './http'

export async function getVisitorRelationship(
  params: any
): Promise<ApiResponse<VisitorPrisonerRelationshipRow[]>> {
  const query = new URLSearchParams(params).toString()
  const res = await http.get<ApiResponse<VisitorPrisonerRelationshipRow[]>>(
    `/visitation-reports/visitor-relationship?${query}`
  )
  return res.data
}

export async function getVisitationLogs(params: any): Promise<ApiResponse<VisitationLogRow[]>> {
  const query = new URLSearchParams(params).toString()
  const res = await http.get<ApiResponse<VisitationLogRow[]>>(
    `/visitation-reports/visitation-logs?${query}`
  )
  return res.data
}

export async function getVisitationAnalysis(
  params: any
): Promise<ApiResponse<VisitationAnalysisRow[]>> {
  const query = new URLSearchParams(params).toString()
  const res = await http.get<ApiResponse<VisitationAnalysisRow[]>>(
    `/visitation-reports/visitation-analysis?${query}`
  )
  return res.data
}
