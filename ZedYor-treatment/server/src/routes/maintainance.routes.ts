import { zValidator } from '@hono/zod-validator'
import { type Context, Hono } from 'hono'
import { maintainanceController } from '../controllers/maintainance.controller.js'
import { CreateMaintainanceSchema, UpdateMaintainanceSchema } from '../dto/maintainance.dto.js'
import type { ErrorResponse } from '../types/response.js'

const router = new Hono()

const validationError = (c: Context, msg: string) =>
  c.json<ErrorResponse>({ error: 'Validation Error', message: msg, statusCode: 400 }, 400)

router.get('/', maintainanceController.getAll)
router.get('/:id', maintainanceController.getById)

router.post(
  '/',
  zValidator('json', CreateMaintainanceSchema, (result, c) => {
    if (!result.success)
      return validationError(c, result.error.errors.map((e) => e.message).join('; '))
  }),
  async (c) => {
    const dto = c.req.valid('json')
    return maintainanceController.create(c, dto)
  }
)

router.put(
  '/:id',
  zValidator('json', UpdateMaintainanceSchema, (result, c) => {
    if (!result.success)
      return validationError(c, result.error.errors.map((e) => e.message).join('; '))
  }),
  async (c) => {
    const dto = c.req.valid('json')
    return maintainanceController.update(c, dto)
  }
)

router.delete('/:id', maintainanceController.delete)

export default router
