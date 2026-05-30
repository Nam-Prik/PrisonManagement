import type {
  IrregularityListItem,
  IrregularitySummaryItem,
  OfficerRoutineItem,
} from '../models/officer-report.model.js'
import { officerReportRepository } from '../repositories/officer-report.repository.js'

export const officerReportService = {
  async listIrregularities(startDate?: string, endDate?: string): Promise<IrregularityListItem[]> {
    return officerReportRepository.listIrregularities(startDate, endDate)
  },

  async getOfficerRoutines(officerCode?: string): Promise<OfficerRoutineItem[]> {
    return officerReportRepository.getOfficerRoutines(officerCode)
  },

  async getIrregularitiesSummary(
    startDate?: string,
    endDate?: string
  ): Promise<IrregularitySummaryItem[]> {
    return officerReportRepository.getIrregularitiesSummary(startDate, endDate)
  },
}
