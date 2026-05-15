import type { PrisonLocation } from '../models/prison-location.model.js'
import { toPrisonLocation } from '../models/prison-location.model.js'
import { prisonLocationRepository } from '../repositories/prison-location.repository.js'

export const prisonLocationService = {
  async getAll(): Promise<PrisonLocation[]> {
    const rows = await prisonLocationRepository.findAll()
    return rows.map(toPrisonLocation)
  },
}
