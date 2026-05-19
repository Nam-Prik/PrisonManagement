import { prisonerIntakeReportRepository } from '../repositories/prisonerintake-report.repository.js'

export const prisonerIntakeReportService = {
  async getIntakesByDateRange(fromDate: string, toDate: string, prisonerCode?: string) {
    return prisonerIntakeReportRepository.findIntakesByDateRange(fromDate, toDate, prisonerCode)
  },

  async getConfiscatedItems(fromDate: string, toDate: string, itemFilter?: string) {
    return prisonerIntakeReportRepository.findConfiscatedItems(fromDate, toDate, itemFilter)
  },

  async getTotalItemsPerIntake(fromDate: string, toDate: string, topN: number) {
    return prisonerIntakeReportRepository.findTotalItemsPerIntake(fromDate, toDate, topN)
  },
}
