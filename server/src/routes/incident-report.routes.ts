import { Hono } from 'hono'
import { incidentReportController } from '../controllers/incident-report.controller.js'

const router = new Hono()

router.get('/by-officer', incidentReportController.getIncidentsByOfficer)
router.get('/by-location', incidentReportController.getInvolvedPrisonersByLocation)
router.get('/top-by-location', incidentReportController.getTopPrisonerIncidentsByLocation)

export default router
