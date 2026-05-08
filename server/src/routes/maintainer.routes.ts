import { zValidator } from '@hono/zod-validator'
import { Hono } from 'hono'
import { maintainerController } from '../controllers/maintainer.controller.js'
import { CreateMaintainerSchema, UpdateMaintainerSchema } from '../dto/maintainer.dto.js'

const router = new Hono()

router.get('/', maintainerController.getAll)
router.get('/:id', maintainerController.getById)

router.post('/', zValidator('json', CreateMaintainerSchema), async (c) => {
  const dto = c.req.valid('json')
  return maintainerController.create(c, dto)
})

router.put('/:id', zValidator('json', UpdateMaintainerSchema), async (c) => {
  const dto = c.req.valid('json')
  return maintainerController.update(c, dto)
})

router.delete('/:id', maintainerController.delete)

export default router
