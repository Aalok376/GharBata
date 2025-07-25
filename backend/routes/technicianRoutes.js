import express from "express"
import { verifyToken } from "../middlewares/auth.js"
import {createTechnicianProfile,getAllTechnicians} from '../controllers/technicianController.js'
const router= express.Router()
router.post('/create',verifyToken,createTechnicianProfile)
router.get('/', getAllTechnicians);
export default router