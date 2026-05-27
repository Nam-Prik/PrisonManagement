import { zValidator } from '@hono/zod-validator'
import { Hono } from 'hono'
import { irregularityController } from '../controllers/irregularity.controller.js'
import { CreateIrregularitySchema, UpdateIrregularitySchema } from '../dto/irregularity.dto.js'

const router = new Hono()

router.get('/', irregularityController.getAll)
router.get('/:id', irregularityController.getById)

router.post('/', zValidator('json', CreateIrregularitySchema), async (c) => {
  const dto = c.req.valid('json')
  return irregularityController.create(c, dto)
})

router.put('/:id', zValidator('json', UpdateIrregularitySchema), async (c) => {
  const dto = c.req.valid('json')
  return irregularityController.update(c, dto)
})

router.delete('/:id', irregularityController.delete)

export default router
