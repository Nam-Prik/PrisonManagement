import { Hono } from 'hono'
import incidentRoutes from './incident.routes.js'
import incidentReportRoutes from './incident-report.routes.js'
import inspectionRoutes from './inspection.routes.js'
import irregularityRoutes from './irregularity.routes.js'
import laborReportRoutes from './labor-report.routes.js'
import maintainanceRoutes from './maintainance.routes.js'
import maintainerRoutes from './maintainer.routes.js'
import medicineRoutes from './medicine.routes.js'
import nurseRoutes from './nurse.routes.js'
import officerRoutes from './officer.routes.js'
import officerReportRoutes from './officer-report.routes.js'
import personRoutes from './person.routes.js'
import prisonLocationRoutes from './prison-location.routes.js'
import prisonerRoutes from './prisoner.routes.js'
import prisonerIntakeRoutes from './prisonerintake.routes.js'
import prisonerIntakeReportRoutes from './prisonerintake-report.routes.js'
import routineRoutes from './routine.routes.js'
import treatmentRoutes from './treatment.routes.js'
import treatmentReportRoutes from './treatment-report.routes.js'
import visitationReportRoutes from './visitation-report.routes.js'
import visitmentRoutes from './visitment.routes.js'

const router = new Hono()

router.route('/person', personRoutes)
router.route('/maintainer', maintainerRoutes)
router.route('/maintainance', maintainanceRoutes)
router.route('/prison-location', prisonLocationRoutes)
router.route('/medicine', medicineRoutes)
router.route('/officer', officerRoutes)
router.route('/nurse', nurseRoutes)
router.route('/prisoner', prisonerRoutes)
router.route('/irregularity', irregularityRoutes)
router.route('/incident', incidentRoutes)
router.route('/labor-reports', laborReportRoutes)
router.route('/visitation-reports', visitationReportRoutes)
router.route('/visitment', visitmentRoutes)
router.route('/incident-reports', incidentReportRoutes)
router.route('/prisoner-intake', prisonerIntakeRoutes)
router.route('/prisoner-intake-reports', prisonerIntakeReportRoutes)
router.route('/treatment-reports', treatmentReportRoutes)
router.route('/treatment', treatmentRoutes)
router.route('/officer-reports', officerReportRoutes)
router.route('/routine', routineRoutes)
router.route('/inspection', inspectionRoutes)

export default router
