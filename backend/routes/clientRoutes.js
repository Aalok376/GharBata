import express from 'express'
import { verifyToken } from '../middlewares/auth.js'
import {createClientProfile} from '../controllers/clientController.js'
const router = express.Router()
router.post('/create',verifyToken,createClientProfile)
export default router