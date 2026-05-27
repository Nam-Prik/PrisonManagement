import { zValidator } from '@hono/zod-validator'
import { Hono } from 'hono'
import { prisonerController } from '../controllers/prisoner.controller.js'
import { CreatePrisonerSchema, UpdatePrisonerSchema } from '../dto/prisoner.dto.js'

const router = new Hono()

router.get('/', prisonerController.getAll)
router.get('/:id', prisonerController.getById)

router.post('/', zValidator('json', CreatePrisonerSchema), async (c) => {
  const dto = c.req.valid('json')
  return prisonerController.create(c, dto)
})

router.put('/:id', zValidator('json', UpdatePrisonerSchema), async (c) => {
  const dto = c.req.valid('json')
  return prisonerController.update(c, dto)
})

router.delete('/:id', prisonerController.delete)

export default router
