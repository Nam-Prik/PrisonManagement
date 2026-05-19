import type {
  IncidentByOfficer,
  InvolvedPrisonerByLocation,
  TopPrisonerIncident,
} from '../models/incident-report.model.js'
import {
  toIncidentByOfficer,
  toInvolvedPrisonerByLocation,
  toTopPrisonerIncident,
} from '../models/incident-report.model.js'
import { incidentReportRepository } from '../repositories/incident-report.repository.js'

export const incidentReportService = {
  async getIncidentsByOfficer(officerId: number): Promise<IncidentByOfficer[]> {
    const rows = await incidentReportRepository.findIncidentsByOfficer(officerId)
    return rows.map(toIncidentByOfficer)
  },

  async getInvolvedPrisonersByLocation(locationId: number): Promise<InvolvedPrisonerByLocation[]> {
    const rows = await incidentReportRepository.findInvolvedPrisonersByLocation(locationId)
    return rows.map(toInvolvedPrisonerByLocation)
  },

  async getTopPrisonerIncidentsByLocation(
    startDate: string,
    endDate: string
  ): Promise<TopPrisonerIncident[]> {
    const rows = await incidentReportRepository.findTopPrisonerIncidentsByLocation(
      startDate,
      endDate
    )
    return rows.map(toTopPrisonerIncident)
  },
}
