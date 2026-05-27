import type { CreateNurseDto, UpdateNurseDto } from '../dto/nurse.dto.js'
import type { Nurse } from '../models/nurse.model.js'
import { toNurse } from '../models/nurse.model.js'
import { nurseRepository } from '../repositories/nurse.repository.js'

export const nurseService = {
  async getAll(): Promise<Nurse[]> {
    const rows = await nurseRepository.findAll()
    return rows.map(toNurse)
  },

  async getById(id: number): Promise<Nurse | null> {
    const row = await nurseRepository.findById(id)
    return row ? toNurse(row) : null
  },

  async create(dto: CreateNurseDto): Promise<Nurse> {
    const row = await nurseRepository.create(dto)
    return toNurse(row)
  },

  async update(id: number, dto: UpdateNurseDto): Promise<Nurse | null> {
    const row = await nurseRepository.update(id, dto)
    return row ? toNurse(row) : null
  },

  async delete(id: number): Promise<boolean> {
    return nurseRepository.delete(id)
  },
}
