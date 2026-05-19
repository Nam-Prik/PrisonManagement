import { Hono } from 'hono'
import { prisonerIntakeReportController } from '../controllers/prisonerintake-report.controller.js'

const router = new Hono()

router.get('/by-date-range', prisonerIntakeReportController.getIntakesByDateRange)
router.get('/confiscated-items', prisonerIntakeReportController.getConfiscatedItems)
router.get('/total-items', prisonerIntakeReportController.getTotalItemsPerIntake)

export default router
