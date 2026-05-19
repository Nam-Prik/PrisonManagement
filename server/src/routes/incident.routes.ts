import { zValidator } from '@hono/zod-validator'
import { type Context, Hono } from 'hono'
import { incidentController } from '../controllers/incident.controller.js'
import { CreateIncidentSchema, UpdateIncidentSchema } from '../dto/incident.dto.js'
import type { ErrorResponse } from '../types/response.js'

const router = new Hono()

const validationError = (c: Context, msg: string) =>
  c.json<ErrorResponse>({ error: 'Validation Error', message: msg, statusCode: 400 }, 400)

router.get('/', incidentController.getAll)
router.get('/:id', incidentController.getById)

router.post(
  '/',
  zValidator('json', CreateIncidentSchema, (result, c) => {
    if (!result.success)
      return validationError(c, result.error.errors.map((e) => e.message).join('; '))
  }),
  async (c) => {
    const dto = c.req.valid('json')
    return incidentController.create(c, dto)
  }
)

router.put(
  '/:id',
  zValidator('json', UpdateIncidentSchema, (result, c) => {
    if (!result.success)
      return validationError(c, result.error.errors.map((e) => e.message).join('; '))
  }),
  async (c) => {
    const dto = c.req.valid('json')
    return incidentController.update(c, dto)
  }
)

router.delete('/:id', incidentController.delete)

export default router
