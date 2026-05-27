import { zValidator } from '@hono/zod-validator'
import { Hono } from 'hono'
import { personController } from '../controllers/person.controller.js'
import { CreatePersonSchema, UpdatePersonSchema } from '../dto/person.dto.js'

const router = new Hono()

router.get('/', personController.getAll)
router.get('/:id', personController.getById)
router.post('/document/upload', personController.uploadDocumentFile)

router.post('/', zValidator('json', CreatePersonSchema), async (c) => {
  const dto = c.req.valid('json')
  return personController.create(c, dto)
})

router.put('/:id', zValidator('json', UpdatePersonSchema), async (c) => {
  const dto = c.req.valid('json')
  return personController.update(c, dto)
})

router.delete('/:id', personController.delete)

export default router
