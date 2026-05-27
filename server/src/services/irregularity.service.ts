import type { CreateIrregularityDto, UpdateIrregularityDto } from '../dto/irregularity.dto.js'
import type { Irregularity } from '../models/irregularity.model.js'
import { toIrregularity } from '../models/irregularity.model.js'
import { irregularityRepository } from '../repositories/irregularity.repository.js'

export const irregularityService = {
  async getAll(): Promise<Irregularity[]> {
    const rows = await irregularityRepository.findAll()
    return rows.map(toIrregularity)
  },

  async getById(id: number): Promise<Irregularity | null> {
    const row = await irregularityRepository.findById(id)
    return row ? toIrregularity(row) : null
  },

  async create(dto: CreateIrregularityDto): Promise<Irregularity> {
    const row = await irregularityRepository.create(dto)
    return toIrregularity(row)
  },

  async update(id: number, dto: UpdateIrregularityDto): Promise<Irregularity | null> {
    const row = await irregularityRepository.update(id, dto)
    return row ? toIrregularity(row) : null
  },

  async delete(id: number): Promise<boolean> {
    return irregularityRepository.delete(id)
  },
}
