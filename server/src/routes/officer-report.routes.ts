import { Hono } from 'hono'
import { officerReportController } from '../controllers/officer-report.controller.js'

const router = new Hono()

router.get('/irregularities', officerReportController.listIrregularities)
router.get('/irregularities/summary', officerReportController.getIrregularitiesSummary)
router.get('/routines', officerReportController.getOfficerRoutines)

export default router
