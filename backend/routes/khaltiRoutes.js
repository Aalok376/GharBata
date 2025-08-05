import express from 'express'
import {
    initiatePayment,
    verifyPayment,
    getPaymentStatus,
    khaltiWebhook,
    healthCheck,
    addKhaltiNumber,
    KhaltiStatus,
    getPayments,
    getPaymentDetail
} from '../controllers/khaltiController.js'

import { verifyToken } from '../middlewares/auth.js'

const router = express.Router()

router.post('/initiate', verifyToken, initiatePayment)
router.post('/verify', verifyToken, verifyPayment)
router.get('/status/:orderId', verifyToken, getPaymentStatus)
router.post('/webhook', verifyToken, khaltiWebhook)
router.get('/health', verifyToken, healthCheck)
router.post('/update-khalti-number', verifyToken, addKhaltiNumber)
router.get('/check-khalti-number', verifyToken, KhaltiStatus)
router.get('/getPayments', verifyToken, getPayments)
router.post('/getPaymentsdetails', verifyToken, getPaymentDetail)

export default router
