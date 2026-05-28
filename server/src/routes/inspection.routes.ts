import { zValidator } from '@hono/zod-validator'
import { Hono } from 'hono'
import { inspectionController } from '../controllers/inspection.controller.js'
import { CreateInspectionSchema, UpdateInspectionSchema } from '../dto/inspection.dto.js'

const router = new Hono()

router.get('/', inspectionController.getAll)
router.get('/:id', inspectionController.getById)

router.post('/', zValidator('json', CreateInspectionSchema), async (c) => {
  const dto = c.req.valid('json')
  return inspectionController.create(c, dto)
})

router.put('/:id', zValidator('json', UpdateInspectionSchema), async (c) => {
  const dto = c.req.valid('json')
  return inspectionController.update(c, dto)
})

router.delete('/:id', inspectionController.delete)

export default router
