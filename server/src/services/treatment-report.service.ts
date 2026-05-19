import type {
  MedicinePrescriptionExperience,
  NurseWorkloadPercentage,
  TreatmentExperience,
} from '../models/treatment-report.model.js'
import {
  toMedicinePrescriptionExperience,
  toNurseWorkloadPercentage,
  toTreatmentExperience,
} from '../models/treatment-report.model.js'
import { treatmentReportRepository } from '../repositories/treatment-report.repository.js'

export const treatmentReportService = {
  async getTreatmentExperience(startDate: string, endDate: string): Promise<TreatmentExperience[]> {
    const rows = await treatmentReportRepository.findTreatmentExperience(startDate, endDate)
    return rows.map(toTreatmentExperience)
  },

  async getMedicinePrescriptionExperience(
    caution: string
  ): Promise<MedicinePrescriptionExperience[]> {
    const rows = await treatmentReportRepository.findMedicinePrescriptionExperience(caution)
    return rows.map(toMedicinePrescriptionExperience)
  },

  async getNurseWorkloadPercentage(): Promise<NurseWorkloadPercentage[]> {
    const rows = await treatmentReportRepository.findNurseWorkloadPercentage()
    return rows.map(toNurseWorkloadPercentage)
  },
}
