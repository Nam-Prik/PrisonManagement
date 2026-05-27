import type { Context } from 'hono'
import type { CreateMedicineDto, UpdateMedicineDto } from '../dto/medicine.dto.js'
import type { Medicine } from '../models/medicine.model.js'
import { medicineService } from '../services/medicine.service.js'
import type { ApiResponse, ErrorResponse } from '../types/response.js'

export const medicineController = {
  async getAll(c: Context) {
    const data = await medicineService.getAll()
    return c.json<ApiResponse<Medicine[]>>({ data, message: 'Medicines retrieved successfully' })
  },

  async getById(c: Context) {
    const id = Number(c.req.param('id'))
    if (Number.isNaN(id)) {
      return c.json<ErrorResponse>(
        { error: 'Bad Request', message: 'Invalid ID', statusCode: 400 },
        400
      )
    }
    const item = await medicineService.getById(id)
    if (!item) {
      return c.json<ErrorResponse>(
        { error: 'Not Found', message: 'Medicine not found', statusCode: 404 },
        404
      )
    }
    return c.json<ApiResponse<Medicine>>({ data: item, message: 'Medicine retrieved successfully' })
  },

  async create(c: Context, dto: CreateMedicineDto) {
    const item = await medicineService.create(dto)
    return c.json<ApiResponse<Medicine>>(
      { data: item, message: 'Medicine created successfully' },
      201
    )
  },

  async update(c: Context, dto: UpdateMedicineDto) {
    const id = Number(c.req.param('id'))
    if (Number.isNaN(id)) {
      return c.json<ErrorResponse>(
        { error: 'Bad Request', message: 'Invalid ID', statusCode: 400 },
        400
      )
    }
    const item = await medicineService.update(id, dto)
    if (!item) {
      return c.json<ErrorResponse>(
        { error: 'Not Found', message: 'Medicine not found', statusCode: 404 },
        404
      )
    }
    return c.json<ApiResponse<Medicine>>({ data: item, message: 'Medicine updated successfully' })
  },

  async delete(c: Context) {
    const id = Number(c.req.param('id'))
    if (Number.isNaN(id)) {
      return c.json<ErrorResponse>(
        { error: 'Bad Request', message: 'Invalid ID', statusCode: 400 },
        400
      )
    }
    const deleted = await medicineService.delete(id)
    if (!deleted) {
      return c.json<ErrorResponse>(
        { error: 'Not Found', message: 'Medicine not found', statusCode: 404 },
        404
      )
    }
    return c.json({ message: 'Medicine deleted successfully' })
  },
}
