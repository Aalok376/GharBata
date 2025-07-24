import express from 'express'

import { verifyToken } from '../middlewares/auth.js'

import {createClientProfile,isClientProfileComplete} from '../controllers/clientController.js'

const router = express.Router()

router.post('/createClient',verifyToken,createClientProfile)
router.post('/getClientprofilestatus',isClientProfileComplete)

export default router