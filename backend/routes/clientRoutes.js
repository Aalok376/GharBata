import express from 'express'

import { verifyToken } from '../middlewares/auth.js'

import {createClientProfile,isClientProfileComplete,profile} from '../controllers/clientController.js'

import uploadParser from '../utils/multer.js'

const router = express.Router()

router.post('/createClient',verifyToken,uploadParser,createClientProfile)
router.get('/getClientProfile',verifyToken,profile)
router.post('/getClientprofilestatus',isClientProfileComplete)

export default router