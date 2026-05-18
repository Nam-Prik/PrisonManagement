import { Hono } from 'hono'
import { prisonLocationController } from '../controllers/prison-location.controller.js'

const router = new Hono()

router.get('/', prisonLocationController.getAll)

export default router
