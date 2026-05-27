import { zValidator } from '@hono/zod-validator'
import { Hono } from 'hono'
import { prisonLocationController } from '../controllers/prison-location.controller.js'
import {
  CreatePrisonLocationSchema,
  UpdatePrisonLocationSchema,
} from '../dto/prison-location.dto.js'

const router = new Hono()

router.get('/', prisonLocationController.getAll)
router.get('/:id', prisonLocationController.getById)

router.post('/', zValidator('json', CreatePrisonLocationSchema), async (c) => {
  const dto = c.req.valid('json')
  return prisonLocationController.create(c, dto)
})

router.put('/:id', zValidator('json', UpdatePrisonLocationSchema), async (c) => {
  const dto = c.req.valid('json')
  return prisonLocationController.update(c, dto)
})

router.delete('/:id', prisonLocationController.delete)

export default router
