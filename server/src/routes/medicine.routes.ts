import { zValidator } from '@hono/zod-validator'
import { Hono } from 'hono'
import { medicineController } from '../controllers/medicine.controller.js'
import { CreateMedicineSchema, UpdateMedicineSchema } from '../dto/medicine.dto.js'

const router = new Hono()

router.get('/', medicineController.getAll)
router.get('/:id', medicineController.getById)

router.post('/', zValidator('json', CreateMedicineSchema), async (c) => {
  const dto = c.req.valid('json')
  return medicineController.create(c, dto)
})

router.put('/:id', zValidator('json', UpdateMedicineSchema), async (c) => {
  const dto = c.req.valid('json')
  return medicineController.update(c, dto)
})

router.delete('/:id', medicineController.delete)

export default router
