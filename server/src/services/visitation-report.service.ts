import type {
  VisitationAnalysisFilters,
  VisitationLogFilters,
  VisitorRelationshipFilters,
} from '../models/visitation-report.model.js'
import { visitationReportRepository } from '../repositories/visitation-report.repository.js'

export const visitationReportService = {
  getVisitorRelationship(filters: VisitorRelationshipFilters) {
    return visitationReportRepository.findVisitorRelationship(filters)
  },
  getVisitationLogs(filters: VisitationLogFilters) {
    return visitationReportRepository.findVisitationLogs(filters)
  },
  getVisitationAnalysis(filters: VisitationAnalysisFilters) {
    return visitationReportRepository.findVisitationAnalysis(filters)
  },
}
