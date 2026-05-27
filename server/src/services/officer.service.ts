import type { CreateOfficerDto, UpdateOfficerDto } from '../dto/officer.dto.js'
import type { Officer, OfficerOption } from '../models/officer.model.js'
import { toOfficer, toOfficerOption } from '../models/officer.model.js'
import { officerRepository } from '../repositories/officer.repository.js'

export const officerService = {
  async getAll(): Promise<OfficerOption[]> {
    const rows = await officerRepository.findAll()
    return rows.map(toOfficerOption)
  },

  async getById(id: number): Promise<Officer | null> {
    const row = await officerRepository.findById(id)
    return row ? toOfficer(row) : null
  },

  async create(dto: CreateOfficerDto): Promise<Officer> {
    const row = await officerRepository.create(dto)
    return toOfficer(row)
  },

  async update(id: number, dto: UpdateOfficerDto): Promise<Officer | null> {
    const row = await officerRepository.update(id, dto)
    return row ? toOfficer(row) : null
  },

  async delete(id: number): Promise<boolean> {
    return officerRepository.delete(id)
  },
}
