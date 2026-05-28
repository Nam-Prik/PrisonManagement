import type { Context } from 'hono'
import type { CreateRoutineDto, UpdateRoutineDto } from '../dto/routine.dto.js'
import type { RoutineDetail, RoutineListItem } from '../models/routine.model.js'
import { routineRepository } from '../repositories/routine.repository.js'
import { routineService } from '../services/routine.service.js'
import type { ApiResponse, ErrorResponse } from '../types/response.js'

export const routineController = {
  async getOptions(c: Context) {
    const data = await routineRepository.getOptions()
    return c.json<ApiResponse<unknown[]>>({
      data,
      message: 'Routine options retrieved successfully',
    })
  },

  async getAll(c: Context) {
    const routines = await routineService.getAll()
    return c.json<ApiResponse<RoutineListItem[]>>({ data: routines, message: 'Routines retrieved' })
  },

  async getById(c: Context) {
    const id = Number(c.req.param('id'))
    if (Number.isNaN(id))
      return c.json<ErrorResponse>(
        { error: 'Bad Request', message: 'Invalid ID', statusCode: 400 },
        400
      )
    const routine = await routineService.getById(id)
    if (!routine)
      return c.json<ErrorResponse>(
        { error: 'Not Found', message: 'Routine not found', statusCode: 404 },
        404
      )
    return c.json<ApiResponse<RoutineDetail>>({ data: routine, message: 'Routine retrieved' })
  },

  async create(c: Context, dto: CreateRoutineDto) {
    const routine = await routineService.create(dto)
    return c.json<ApiResponse<RoutineDetail>>({ data: routine, message: 'Routine created' }, 201)
  },

  async update(c: Context, dto: UpdateRoutineDto) {
    const id = Number(c.req.param('id'))
    if (Number.isNaN(id))
      return c.json<ErrorResponse>(
        { error: 'Bad Request', message: 'Invalid ID', statusCode: 400 },
        400
      )
    const routine = await routineService.update(id, dto)
    if (!routine)
      return c.json<ErrorResponse>(
        { error: 'Not Found', message: 'Routine not found', statusCode: 404 },
        404
      )
    return c.json<ApiResponse<RoutineDetail>>({ data: routine, message: 'Routine updated' })
  },

  async delete(c: Context) {
    const id = Number(c.req.param('id'))
    if (Number.isNaN(id))
      return c.json<ErrorResponse>(
        { error: 'Bad Request', message: 'Invalid ID', statusCode: 400 },
        400
      )
    const deleted = await routineService.delete(id)
    if (!deleted)
      return c.json<ErrorResponse>(
        { error: 'Not Found', message: 'Routine not found', statusCode: 404 },
        404
      )
    return c.json({ message: 'Routine deleted successfully' })
  },
}
