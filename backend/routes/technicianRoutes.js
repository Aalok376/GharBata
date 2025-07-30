import express from "express"

import { verifyToken } from "../middlewares/auth.js"

import uploadParser from "../utils/multer.js"

import { 
  createTechnicianProfile,
  updateTechniciansProfile,
  getTechnicianProfile,
  getAllTechnicians,
  rateTechnician,
  writeReview,
  getReviewsByProfession,
  getOverallAverageRating
} from '../controllers/technicianController.js'

const router = express.Router()
router.post('/createTechnicians',verifyToken,uploadParser,createTechnicianProfile)
router.post('/updateTechnicians',verifyToken,uploadParser,updateTechniciansProfile)
router.post('/getTechnicians',verifyToken,getTechnicianProfile)
router.get('/filteredTechnicians',verifyToken,getAllTechnicians)
router.post('/rate',verifyToken, rateTechnician)
router.post('/review',verifyToken, writeReview)
router.get('/reviews/:technicianId/:profession',verifyToken, getReviewsByProfession)
router.get('/rating/:technicianId',verifyToken, getOverallAverageRating)

export default router