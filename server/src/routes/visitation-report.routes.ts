import { Hono } from 'hono'
import { visitationReportController } from '../controllers/visitation-report.controller.js'

const router = new Hono()

router.get('/visitor-relationship', visitationReportController.getVisitorRelationship)
router.get('/visitation-logs', visitationReportController.getVisitationLogs)
router.get('/visitation-analysis', visitationReportController.getVisitationAnalysis)

export default router
