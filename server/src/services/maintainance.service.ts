import type { CreateMaintainanceDto, UpdateMaintainanceDto } from '../dto/maintainance.dto.js'
import type { MaintainanceDetail, MaintainanceListItem } from '../models/maintainance.model.js'
import { toMaintainanceListItem } from '../models/maintainance.model.js'
import { maintainanceRepository } from '../repositories/maintainance.repository.js'

export const maintainanceService = {
  async getAll(): Promise<MaintainanceListItem[]> {
    const rows = await maintainanceRepository.findAll()
    return rows.map(toMaintainanceListItem)
  },

  async getById(id: number): Promise<MaintainanceDetail | null> {
    return maintainanceRepository.findById(id)
  },

  async create(dto: CreateMaintainanceDto): Promise<MaintainanceDetail | null> {
    return maintainanceRepository.create(dto)
  },

  async update(id: number, dto: UpdateMaintainanceDto): Promise<MaintainanceDetail | null> {
    return maintainanceRepository.update(id, dto)
  },

  async delete(id: number): Promise<boolean> {
    return maintainanceRepository.delete(id)
  },
}
