import { zValidator } from '@hono/zod-validator'
import type { Context } from 'hono'
import { Hono } from 'hono'
import { prisonerIntakeController } from '../controllers/prisonerintake.controller.js'
import {
  CreatePrisonerIntakeSchema,
  UpdatePrisonerIntakeSchema,
} from '../dto/prisonerintake.dto.js'
import type { ErrorResponse } from '../types/response.js'

const router = new Hono()

const validationError = (c: Context, msg: string) =>
  c.json<ErrorResponse>({ error: 'Validation Error', message: msg, statusCode: 400 }, 400)

// POST routes first
router.post(
  '/',
  zValidator('json', CreatePrisonerIntakeSchema, (result, c) => {
    if (!result.success)
      return validationError(c, result.error.errors.map((e) => e.message).join('; '))
  }),
  async (c) => {
    const dto = c.req.valid('json')
    return prisonerIntakeController.create(c, dto)
  }
)

// GET routes
router.get('/', prisonerIntakeController.getAll)
router.get('/:id', prisonerIntakeController.getById)

// PUT routes
router.put(
  '/:id',
  zValidator('json', UpdatePrisonerIntakeSchema, (result, c) => {
    if (!result.success)
      return validationError(c, result.error.errors.map((e) => e.message).join('; '))
  }),
  async (c) => {
    const dto = c.req.valid('json')
    return prisonerIntakeController.update(c, dto)
  }
)

// DELETE routes
router.delete('/:id', prisonerIntakeController.delete)

export default router
