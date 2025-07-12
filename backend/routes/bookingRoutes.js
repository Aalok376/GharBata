import express from 'express'
import {createBooking,getClientBookings,getBookingById,
    cancelBooking
} from '../controllers/bookingController.js'
import{
    validateCreateBooking,validateCancellation
} from '../middlewares/bookingValidation.js'
import { verifyToken } from '../middlewares/auth.js'

const router=express.Router()
//POST/api/bookings - create a new booking
router.post('/',verifyToken,validateCreateBooking,createBooking)

// Get/api/bookings - Get client's bookings
router.get('/',verifyToken,getClientBookings)
// GET/api/bookings/:id - Get single booking details
router.get('/:id',verifyToken,getBookingById)

//PUT /api/bookings/:id/cancel - Cancel booking
router.put('/:id/cancel', verifyToken,validateCancellation,cancelBooking)

export default router