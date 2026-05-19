import type { CreateTreatmentDto, UpdateTreatmentDto } from '../dto/treatment.dto.js'
import type { NurseOption, TreatmentDetail, TreatmentListItem } from '../models/treatment.model.js'
import { treatmentRepository } from '../repositories/treatment.repository.js'

export const treatmentService = {
  async getAll(): Promise<TreatmentListItem[]> {
    return treatmentRepository.findAll()
  },

  async getById(id: number): Promise<TreatmentDetail | null> {
    return treatmentRepository.findById(id)
  },

  async getNurses(): Promise<NurseOption[]> {
    const rows = await treatmentRepository.findNurses()
    return rows.map((row) => ({
      id: row.id,
      code: row.code,
      firstName: row.first_name,
      lastName: row.last_name,
    }))
  },

  async create(dto: CreateTreatmentDto): Promise<TreatmentDetail | null> {
    return treatmentRepository.create(dto)
  },

  async update(id: number, dto: UpdateTreatmentDto): Promise<TreatmentDetail | null> {
    return treatmentRepository.update(id, dto)
  },

  async delete(id: number): Promise<boolean> {
    return treatmentRepository.delete(id)
  },
}
