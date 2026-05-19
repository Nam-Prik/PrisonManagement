import { Hono } from 'hono'
import { officerController } from '../controllers/officer.controller.js'

const router = new Hono()

router.get('/', officerController.getAll)

export default router
