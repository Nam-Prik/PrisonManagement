import { Hono } from 'hono'
import { treatmentController } from '../controllers/treatment.controller.js'

const router = new Hono()

router.get('/', treatmentController.getAll)
router.get('/nurses', treatmentController.getNurses)
router.get('/:id', treatmentController.getById)
router.post('/', treatmentController.create)
router.put('/:id', treatmentController.update)
router.delete('/:id', treatmentController.delete)

export default router
