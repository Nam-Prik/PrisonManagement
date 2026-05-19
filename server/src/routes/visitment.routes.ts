import { Hono } from 'hono'
import { visitmentController } from '../controllers/visitment.controller.js'

const router = new Hono()

router.get('/', visitmentController.getAll)
router.get('/prisoner-lookup', visitmentController.lookupPrisoner)
router.get('/person-lookup', visitmentController.lookupPerson)
router.get('/prisoners', visitmentController.getAllPrisoners)
router.get('/persons', visitmentController.getAllPersons)
router.get('/:id', visitmentController.getById)
router.post('/', visitmentController.create)
router.put('/:id', visitmentController.update)
router.delete('/:id', visitmentController.delete)

export default router
