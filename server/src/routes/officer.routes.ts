import { zValidator } from '@hono/zod-validator'
import { Hono } from 'hono'
import { officerController } from '../controllers/officer.controller.js'
import { CreateOfficerSchema, UpdateOfficerSchema } from '../dto/officer.dto.js'

const router = new Hono()

router.get('/', officerController.getAll)
router.get('/:id', officerController.getById)

router.post('/', zValidator('json', CreateOfficerSchema), async (c) => {
  const dto = c.req.valid('json')
  return officerController.create(c, dto)
})

router.put('/:id', zValidator('json', UpdateOfficerSchema), async (c) => {
  const dto = c.req.valid('json')
  return officerController.update(c, dto)
})

router.delete('/:id', officerController.delete)

export default router
