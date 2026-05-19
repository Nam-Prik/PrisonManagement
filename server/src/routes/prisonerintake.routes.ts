import { Hono } from 'hono'
import { prisonerIntakeController } from '../controllers/prisonerintake.controller.js'

const router = new Hono()

router.get('/', prisonerIntakeController.getAll)
router.post('/mugshot', prisonerIntakeController.uploadMugshotFile)
router.get('/:id', prisonerIntakeController.getById)
router.post('/', prisonerIntakeController.create)
router.put('/:id', prisonerIntakeController.update)
router.delete('/:id', prisonerIntakeController.delete)

export default router
