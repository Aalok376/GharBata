import express from 'express'
import { verifyToken } from '../middlewares/auth.js'
import {createService,getAllServices,deactivateService,getServiceById} from '../controllers/serviceController.js'

const router=express.Router()

router.post('/create',verifyToken,createService)
router.get('/active',getAllServices)
router.get('/:serviceId',getServiceById)
router.patch('/:serviceId/deactivate',verifyToken,deactivateService)
export default router