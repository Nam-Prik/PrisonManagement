import { Hono } from 'hono'
import { treatmentReportController } from '../controllers/treatment-report.controller.js'

const router = new Hono()

router.get('/treatment-experience', treatmentReportController.getTreatmentExperience)
router.get('/medicine-prescription', treatmentReportController.getMedicinePrescriptionExperience)
router.get('/nurse-workload', treatmentReportController.getNurseWorkloadPercentage)

export default router
