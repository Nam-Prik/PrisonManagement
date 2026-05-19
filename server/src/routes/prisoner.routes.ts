import { Hono } from 'hono'
import { prisonerController } from '../controllers/prisoner.controller.js'

const router = new Hono()

router.get('/', prisonerController.getAll)

export default router
