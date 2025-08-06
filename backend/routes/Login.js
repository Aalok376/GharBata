import express from 'express'
import { Register, login, verificationOtp, Logout, UpdateUserPassword, getMail,verifyOtpForUpdate,contactUs } from '../controllers/authController.js'
import { verifyOtp } from '../utils/verifyOtp.js'
import { verifyToken } from '../middlewares/auth.js'

const router = express.Router()

router.post('/emailVerification', verificationOtp)
router.post('/register', verifyOtp, Register)
router.post('/login', login)
router.get('/logoutuser', verifyToken, Logout)
router.post('/update-password', UpdateUserPassword)
router.post('/send-mail', getMail)
router.post('/verifyOtpforupdate',verifyOtpForUpdate)
router.post('/contact',contactUs)

export default router