import { zValidator } from '@hono/zod-validator'
import type { Context } from 'hono'
import { Hono } from 'hono'
import { prisonerController } from '../controllers/prisoner.controller.js'
import {
  CreatePrisonerSchema,
  CreatePrisonerWithPersonSchema,
  UpdatePrisonerSchema,
} from '../dto/prisoner.dto.js'
import type { ErrorResponse } from '../types/response.js'

const router = new Hono()

const validationError = (c: Context, msg: string) =>
  c.json<ErrorResponse>({ error: 'Validation Error', message: msg, statusCode: 400 }, 400)

// More specific routes FIRST (POST routes with specific paths)
// Create prisoner with person data (firstName, lastName, etc.)
router.post(
  '/with-person',
  zValidator('json', CreatePrisonerWithPersonSchema, (result, c) => {
    if (!result.success)
      return validationError(c, result.error.errors.map((e) => e.message).join('; '))
  }),
  async (c) => {
    const dto = c.req.valid('json')
    return prisonerController.createWithPerson(c, dto)
  }
)

router.post(
  '/',
  zValidator('json', CreatePrisonerSchema, (result, c) => {
    if (!result.success)
      return validationError(c, result.error.errors.map((e) => e.message).join('; '))
  }),
  async (c) => {
    const dto = c.req.valid('json')
    return prisonerController.create(c, dto)
  }
)

// Specific sub-routes for /:id operations
router.post('/:id/mugshot', prisonerController.updateMugshot)
router.post('/:id/copy', prisonerController.copy)

// Generic GET/PUT/DELETE routes for /:id LAST
router.get('/', prisonerController.getAll)
router.get('/search', prisonerController.search)
router.get('/:id', prisonerController.getById)

router.put(
  '/:id',
  zValidator('json', UpdatePrisonerSchema, (result, c) => {
    if (!result.success)
      return validationError(c, result.error.errors.map((e) => e.message).join('; '))
  }),
  async (c) => {
    const dto = c.req.valid('json')
    return prisonerController.update(c, dto)
  }
)

router.delete('/:id', prisonerController.delete)

export default router
