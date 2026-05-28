import type { Context } from 'hono'
import type { CreateInspectionDto, UpdateInspectionDto } from '../dto/inspection.dto.js'
import { inspectionService } from '../services/inspection.service.js'

export const inspectionController = {
  async getAll(c: Context) {
    try {
      const data = await inspectionService.getAllInspections()
      return c.json(data)
    } catch (error) {
      console.error('Failed to fetch inspections:', error)
      return c.json({ error: 'Failed to fetch inspections' }, 500)
    }
  },

  async getById(c: Context) {
    const id = Number(c.req.param('id'))
    if (Number.isNaN(id)) return c.json({ error: 'Invalid ID' }, 400)

    try {
      const data = await inspectionService.getInspectionById(id)
      if (!data) return c.json({ error: 'Inspection not found' }, 404)
      return c.json(data)
    } catch (error) {
      console.error(`Failed to fetch inspection ${id}:`, error)
      return c.json({ error: 'Failed to fetch inspection' }, 500)
    }
  },

  async create(c: Context, dto: CreateInspectionDto) {
    try {
      const newInspection = await inspectionService.createInspection(dto)
      return c.json(newInspection, 201)
    } catch (error: any) {
      console.error('Failed to create inspection:', error)
      return c.json({ error: error.message || 'Creation failed' }, 400)
    }
  },

  async update(c: Context, dto: UpdateInspectionDto) {
    const id = Number(c.req.param('id'))
    if (Number.isNaN(id)) return c.json({ error: 'Invalid ID' }, 400)

    try {
      const updatedInspection = await inspectionService.updateInspection(id, dto)
      if (!updatedInspection) return c.json({ error: 'Inspection not found' }, 404)

      return c.json(updatedInspection)
    } catch (error: any) {
      console.error(`Failed to update inspection ${id}:`, error)
      return c.json({ error: error.message || 'Update failed' }, 400)
    }
  },

  async delete(c: Context) {
    const id = Number(c.req.param('id'))
    if (Number.isNaN(id)) return c.json({ error: 'Invalid ID' }, 400)

    try {
      const success = await inspectionService.deleteInspection(id)
      if (!success) return c.json({ error: 'Inspection not found' }, 404)

      return c.json({ success: true, message: 'Inspection deleted' })
    } catch (error) {
      console.error(`Failed to delete inspection ${id}:`, error)
      return c.json({ error: 'Failed to delete inspection' }, 500)
    }
  },
}
