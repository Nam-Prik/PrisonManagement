import { Hono } from 'hono'
import maintainerRoutes from './maintainer.routes.js'

const router = new Hono()

router.route('/maintainer', maintainerRoutes)

export default router
