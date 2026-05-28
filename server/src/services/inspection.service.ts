import type { CreateInspectionDto, UpdateInspectionDto } from '../dto/inspection.dto.js'
import { inspectionRepository } from '../repositories/inspection.repository.js'

export const inspectionService = {
  async getAllInspections() {
    return await inspectionRepository.findAll()
  },

  async getInspectionById(id: number) {
    return await inspectionRepository.findById(id)
  },

  async createInspection(dto: CreateInspectionDto) {
    return await inspectionRepository.create(dto)
  },

  async updateInspection(id: number, dto: UpdateInspectionDto) {
    return await inspectionRepository.update(id, dto)
  },

  async deleteInspection(id: number) {
    return await inspectionRepository.delete(id)
  },
}
