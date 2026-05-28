import { zValidator } from '@hono/zod-validator'
import { Hono } from 'hono'
import { routineController } from '../controllers/routine.controller.js'
import { CreateRoutineSchema, UpdateRoutineSchema } from '../dto/routine.dto.js'

const router = new Hono()

router.get('/options', routineController.getOptions)

router.get('/', routineController.getAll)
router.get('/:id', routineController.getById)

router.post('/', zValidator('json', CreateRoutineSchema), async (c) => {
  return routineController.create(c, c.req.valid('json'))
})

router.put('/:id', zValidator('json', UpdateRoutineSchema), async (c) => {
  return routineController.update(c, c.req.valid('json'))
})

router.delete('/:id', routineController.delete)

export default router
