import type { CreateRoutineDto, UpdateRoutineDto } from '../dto/routine.dto.js'
import type { RoutineDetail, RoutineListItem } from '../models/routine.model.js'
import { toRoutineDetail, toRoutineListItem } from '../models/routine.model.js'
import { routineRepository } from '../repositories/routine.repository.js'

export const routineService = {
  async getAll(): Promise<RoutineListItem[]> {
    const rows = await routineRepository.findAll()
    return rows.map(toRoutineListItem)
  },

  async getById(id: number): Promise<RoutineDetail | null> {
    const data = await routineRepository.findById(id)
    return data ? toRoutineDetail(data.head, data.lines, data.insHead, data.insLines) : null
  },

  async create(dto: CreateRoutineDto): Promise<RoutineDetail> {
    const data = await routineRepository.create(dto)
    if (!data) throw new Error('Failed to create routine')
    return toRoutineDetail(data.head, data.lines, data.insHead, data.insLines)
  },

  async update(id: number, dto: UpdateRoutineDto): Promise<RoutineDetail | null> {
    const data = await routineRepository.update(id, dto)
    return data ? toRoutineDetail(data.head, data.lines, data.insHead, data.insLines) : null
  },

  async delete(id: number): Promise<boolean> {
    return routineRepository.delete(id)
  },
}
