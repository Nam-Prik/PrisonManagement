import type { OfficerOption } from '../models/officer.model.js'
import { toOfficerOption } from '../models/officer.model.js'
import { officerRepository } from '../repositories/officer.repository.js'

export const officerService = {
  async getAll(): Promise<OfficerOption[]> {
    const rows = await officerRepository.findAll()
    return rows.map(toOfficerOption)
  },
}
