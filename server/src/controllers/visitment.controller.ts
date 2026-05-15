import type { Context } from 'hono'
import { visitmentService } from '../services/visitment.service.js'
import type { CreateVisitmentDto, UpdateVisitmentDto } from '../dto/visitment.dto.js'
import type { ApiResponse } from '../types/response.js'

export const visitmentController = {
  async getAll(c: Context) {
    const data = await visitmentService.getAllVisitments()
    return c.json<ApiResponse<typeof data>>({ data, message: 'Success' })
  },

  async getById(c: Context) {
    const id = Number(c.req.param('id'))
    const data = await visitmentService.getVisitmentDetail(id)
    if (!data) return c.json({ error: 'Not Found', message: 'Visitment not found', statusCode: 404 }, 404)
    return c.json<ApiResponse<typeof data>>({ data, message: 'Success' })
  },

  async create(c: Context) {
    const body = await c.req.json<CreateVisitmentDto>()
    const data = await visitmentService.createVisitment(body)
    return c.json<ApiResponse<typeof data>>({ data, message: 'Created successfully' }, 201)
  },

  async update(c: Context) {
    const id = Number(c.req.param('id'))
    const body = await c.req.json<UpdateVisitmentDto>()
    const data = await visitmentService.updateVisitment(id, body)
    if (!data) return c.json({ error: 'Not Found', message: 'Visitment not found', statusCode: 404 }, 404)
    return c.json<ApiResponse<typeof data>>({ data, message: 'Updated successfully' })
  },

  async delete(c: Context) {
    const id = Number(c.req.param('id'))
    const success = await visitmentService.deleteVisitment(id)
    if (!success) return c.json({ error: 'Not Found', message: 'Visitment not found', statusCode: 404 }, 404)
    return c.json({ message: 'Deleted successfully' })
  },

  async lookupPrisoner(c: Context) {
    const code = c.req.query('code')
    if (!code) return c.json({ error: 'Bad Request', message: 'Code is required', statusCode: 400 }, 400)
    const data = await visitmentService.lookupPrisoner(code)
    return c.json<ApiResponse<typeof data>>({ data, message: 'Lookup success' })
  },

  async lookupPerson(c: Context) {
    const id = Number(c.req.query('id'))
    if (!id) return c.json({ error: 'Bad Request', message: 'ID is required', statusCode: 400 }, 400)
    const data = await visitmentService.lookupPerson(id)
    return c.json<ApiResponse<typeof data>>({ data, message: 'Lookup success' })
  },

  async getAllPrisoners(c: Context) {
    const data = await visitmentService.getAllPrisoners()
    return c.json<ApiResponse<typeof data>>({ data, message: 'Success' })
  },

  async getAllPersons(c: Context) {
    const data = await visitmentService.getAllPersons()
    return c.json<ApiResponse<typeof data>>({ data, message: 'Success' })
  }
}
