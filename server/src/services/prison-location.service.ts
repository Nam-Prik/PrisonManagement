import type {
  CreatePrisonLocationDto,
  UpdatePrisonLocationDto,
} from '../dto/prison-location.dto.js'
import type { PrisonLocation } from '../models/prison-location.model.js'
import { toPrisonLocation } from '../models/prison-location.model.js'
import { prisonLocationRepository } from '../repositories/prison-location.repository.js'

export const prisonLocationService = {
  async getAll(): Promise<PrisonLocation[]> {
    const rows = await prisonLocationRepository.findAll()
    return rows.map(toPrisonLocation)
  },

  async getById(id: number): Promise<PrisonLocation | null> {
    const row = await prisonLocationRepository.findById(id)
    return row ? toPrisonLocation(row) : null
  },

  async create(dto: CreatePrisonLocationDto): Promise<PrisonLocation> {
    const row = await prisonLocationRepository.create(dto)
    return toPrisonLocation(row)
  },

  async update(id: number, dto: UpdatePrisonLocationDto): Promise<PrisonLocation | null> {
    const row = await prisonLocationRepository.update(id, dto)
    return row ? toPrisonLocation(row) : null
  },

  async delete(id: number): Promise<boolean> {
    return prisonLocationRepository.delete(id)
  },
}
