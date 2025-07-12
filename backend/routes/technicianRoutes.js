import express from "express"
import { authMiddleware } from "../middlewares/auth.js"
import {createTechnicianProfile} from '../controllers/technicianController.js'
const router= express.Router()
router.post('/create',authMiddleware,createTechnicianProfile)
export default router