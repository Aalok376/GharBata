import express from 'express'
import { authMiddleware } from '../middlewares/auth.js'
import {createClientProfile} from '../controllers/clientController.js'
const router = express.Router()
router.post('/create',authMiddleware,createClientProfile)
export default router