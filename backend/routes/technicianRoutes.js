import express from "express"

import { verifyToken } from "../middlewares/auth.js"

import uploadParser from "../utils/multer.js"

import {createTechnicianProfile,updateTechniciansProfile,getTechnicianProfile} from '../controllers/technicianController.js'

const router= express.Router()

router.post('/createTechnicians',verifyToken,uploadParser,createTechnicianProfile)
router.post('/updateTechnicians',verifyToken,uploadParser,updateTechniciansProfile)
router.get('/getTechnicians',verifyToken,getTechnicianProfile)

export default router