import { Hono } from 'hono'
import laborReportRoutes from './labor-report.routes.js'
import maintainanceRoutes from './maintainance.routes.js'
import maintainerRoutes from './maintainer.routes.js'
import prisonLocationRoutes from './prison-location.routes.js'
import visitationReportRoutes from './visitation-report.routes.js'
import visitmentRoutes from './visitment.routes.js'

const router = new Hono()

router.route('/maintainer', maintainerRoutes)
router.route('/maintainance', maintainanceRoutes)
router.route('/prison-location', prisonLocationRoutes)
router.route('/labor-reports', laborReportRoutes)
router.route('/visitation-reports', visitationReportRoutes)
router.route('/visitment', visitmentRoutes)

export default router
