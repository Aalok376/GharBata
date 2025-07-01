import express from 'express';
import { authMiddleware } from '../middlewares/auth.js';
import {createService,getAllActiveServices,deactiveService,getServiceById} from '../controllers/serviceController.js';

const router=express.Router();

router.post('/create',authMiddleware,createService);
router.get('/active',getAllActiveServices);
router.get('/:serviceId',getServiceById);
router.patch('/:serviceId/deactivate',authMiddleware,deactiveService);
export default router;