import express from "express"
import { verifyToken } from "../middlewares/auth.js"
import {createTechnicianProfile} from '../controllers/technicianController.js'
const router= express.Router()
router.post('/create',verifyToken,createTechnicianProfile)
export default router