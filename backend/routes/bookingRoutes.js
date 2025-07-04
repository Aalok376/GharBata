import express from 'express'
import {createBooking,getClientBookings,getBookingById,
    cancelBooking
} from '../controllers/bookingController.js'
import{
    validateCreateBooking,validateCancellation
} from '../middlewares/bookingValidation.js'
import { authMiddleware } from '../middlewares/auth.js'

const router=express.Router()
//POST/api/bookings - create a new booking
router.post('/',authMiddleware,validateCreateBooking,createBooking)

// Get/api/bookings - Get client's bookings
router.get('/',authMiddleware,getClientBookings)
// GET/api/bookings/:id - Get single booking details
router.get('/:id',authMiddleware,getBookingById)

//PUT /api/bookings/:id/cancel - Cancel booking
router.put('/:id/cancel', authMiddleware,validateCancellation,cancelBooking)

export default router