import express from 'express'
import { verifyToken } from '../middlewares/auth.js'
import {createService,getAllActiveServices,deactiveService,getServiceById} from '../controllers/serviceController.js'

const router=express.Router()

router.post('/create',verifyToken,createService)
router.get('/active',getAllActiveServices)
router.get('/:serviceId',getServiceById)
router.patch('/:serviceId/deactivate',verifyToken,deactiveService)
export default router