import { zValidator } from '@hono/zod-validator'
import { Hono } from 'hono'
import { nurseController } from '../controllers/nurse.controller.js'
import { CreateNurseSchema, UpdateNurseSchema } from '../dto/nurse.dto.js'

const router = new Hono()

router.get('/', nurseController.getAll)
router.get('/:id', nurseController.getById)

router.post('/', zValidator('json', CreateNurseSchema), async (c) => {
  const dto = c.req.valid('json')
  return nurseController.create(c, dto)
})

router.put('/:id', zValidator('json', UpdateNurseSchema), async (c) => {
  const dto = c.req.valid('json')
  return nurseController.update(c, dto)
})

router.delete('/:id', nurseController.delete)

export default router
