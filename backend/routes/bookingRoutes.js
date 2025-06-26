import express from 'express';
import {createBooking,getClientBookings,getBookingById,
    cancelBooking
} from '../controllers/bookingController.js'
import{
    validateCreateBooking,validateCancellation
} from '../middlewares/bookingValidation.js';

const router=express.Router();
//POST/api/bookings - create a new booking
router.post('/',validateCreateBooking,createBooking);

// Get/api/bookings - Get client's bookings
router.get('/',getClientBookings);
// GET/api/bookings/:id - Get single booking details
router.get('/:id',getBookingById);

//PUT /api/bookings/:id/cancel - Cancel booking
router.put('/:id/cancel', validateCancellation,cancelBooking);

export default router;