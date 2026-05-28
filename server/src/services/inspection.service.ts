import type { CreateInspectionDto, UpdateInspectionDto } from '../dto/inspection.dto.js'
import type { InspectionDetail, InspectionListItem } from '../models/inspection.model.js'
import { toInspectionDetail, toInspectionListItem } from '../models/inspection.model.js'
import { inspectionRepository } from '../repositories/inspection.repository.js'

export const inspectionService = {
  async getAll(): Promise<InspectionListItem[]> {
    const rows = await inspectionRepository.findAll()
    return rows.map(toInspectionListItem)
  },

  async getById(id: number): Promise<InspectionDetail | null> {
    const data = await inspectionRepository.findById(id)
    return data ? toInspectionDetail(data.head, data.lines) : null
  },

  async create(dto: CreateInspectionDto): Promise<InspectionDetail> {
    const data = await inspectionRepository.create(dto)
    // We know 'create' succeeds and returns data, so we cast it safely
    return toInspectionDetail(data!.head, data!.lines)
  },

  async update(id: number, dto: UpdateInspectionDto): Promise<InspectionDetail | null> {
    const data = await inspectionRepository.update(id, dto)
    return data ? toInspectionDetail(data.head, data.lines) : null
  },

  async delete(id: number): Promise<boolean> {
    return inspectionRepository.delete(id)
  },
}
