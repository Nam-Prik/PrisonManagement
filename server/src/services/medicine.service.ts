import type { CreateMedicineDto, UpdateMedicineDto } from '../dto/medicine.dto.js'
import type { Medicine } from '../models/medicine.model.js'
import { toMedicine } from '../models/medicine.model.js'
import { medicineRepository } from '../repositories/medicine.repository.js'

export const medicineService = {
  async getAll(): Promise<Medicine[]> {
    const rows = await medicineRepository.findAll()
    return rows.map(toMedicine)
  },

  async getById(id: number): Promise<Medicine | null> {
    const row = await medicineRepository.findById(id)
    return row ? toMedicine(row) : null
  },

  async create(dto: CreateMedicineDto): Promise<Medicine> {
    const row = await medicineRepository.create(dto)
    return toMedicine(row)
  },

  async update(id: number, dto: UpdateMedicineDto): Promise<Medicine | null> {
    const row = await medicineRepository.update(id, dto)
    return row ? toMedicine(row) : null
  },

  async delete(id: number): Promise<boolean> {
    return medicineRepository.delete(id)
  },
}
