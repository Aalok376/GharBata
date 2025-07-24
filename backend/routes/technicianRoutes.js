import express from "express"
import { verifyToken } from "../middlewares/auth.js"
import {createTechnicianProfile, getAllTechnicians, updateTechnicianProfile} from '../controllers/technicianController.js'
const router= express.Router()
router.post('/create',verifyToken,createTechnicianProfile)
router.get('/', getAllTechnicians)
router.put('/update', verifyToken, updateTechnicianProfile) // Assuming you have an update function
// router.get('/:id', verifyToken, getTechnicianProfile) // Assuming you have a get function

export default router