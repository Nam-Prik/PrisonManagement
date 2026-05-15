import { Hono } from 'hono'
import { laborReportController } from '../controllers/labor-report.controller.js'

const router = new Hono()

router.get('/maintainers-by-skill', laborReportController.getMaintainersBySkill)
router.get('/labor-by-cost', laborReportController.getLaborByCost)
router.get('/cost-by-location', laborReportController.getCostByLocation)

export default router
