import { Hono } from 'hono'
import incidentRoutes from './incident.routes.js'
import incidentReportRoutes from './incident-report.routes.js'
import laborReportRoutes from './labor-report.routes.js'
import maintainanceRoutes from './maintainance.routes.js'
import maintainerRoutes from './maintainer.routes.js'
import officerRoutes from './officer.routes.js'
import prisonLocationRoutes from './prison-location.routes.js'
import prisonerRoutes from './prisoner.routes.js'
import prisonerIntakeRoutes from './prisonerintake.routes.js'
import prisonerIntakeReportRoutes from './prisonerintake-report.routes.js'
import treatmentRoutes from './treatment.routes.js'
import treatmentReportRoutes from './treatment-report.routes.js'
import visitationReportRoutes from './visitation-report.routes.js'
import visitmentRoutes from './visitment.routes.js'

const router = new Hono()

router.route('/maintainer', maintainerRoutes)
router.route('/maintainance', maintainanceRoutes)
router.route('/prison-location', prisonLocationRoutes)
router.route('/officer', officerRoutes)
router.route('/prisoner', prisonerRoutes)
router.route('/incident', incidentRoutes)
router.route('/labor-reports', laborReportRoutes)
router.route('/visitation-reports', visitationReportRoutes)
router.route('/visitment', visitmentRoutes)
router.route('/incident-reports', incidentReportRoutes)
router.route('/prisoner-intake', prisonerIntakeRoutes)
router.route('/prisoner-intake-reports', prisonerIntakeReportRoutes)
router.route('/treatment-reports', treatmentReportRoutes)
router.route('/treatment', treatmentRoutes)

export default router
