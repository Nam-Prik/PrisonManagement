import type { CreateMaintainerDto, UpdateMaintainerDto } from '../dto/maintainer.dto.js'
import type { Maintainer } from '../models/maintainer.model.js'
import { toMaintainer } from '../models/maintainer.model.js'
import { maintainerRepository } from '../repositories/maintainer.repository.js'

export const maintainerService = {
  async getAll(): Promise<Maintainer[]> {
    const rows = await maintainerRepository.findAll()
    return rows.map(toMaintainer)
  },

  async getById(id: number): Promise<Maintainer | null> {
    const row = await maintainerRepository.findById(id)
    return row ? toMaintainer(row) : null
  },

  async create(dto: CreateMaintainerDto): Promise<Maintainer> {
    const row = await maintainerRepository.create(dto)
    return toMaintainer(row)
  },

  async update(id: number, dto: UpdateMaintainerDto): Promise<Maintainer | null> {
    const row = await maintainerRepository.update(id, dto)
    return row ? toMaintainer(row) : null
  },

  async delete(id: number): Promise<boolean> {
    return maintainerRepository.delete(id)
  },
}
