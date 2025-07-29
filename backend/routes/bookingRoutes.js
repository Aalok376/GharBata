import express from 'express'
import {
    createBooking, getClientBookings, getBookingById,
    cancelBooking
} from '../controllers/bookingController.js'
import {
    validateCreateBooking, validateCancellation
} from '../middlewares/bookingValidation.js'
import { verifyToken } from '../middlewares/auth.js'

<<<<<<< HEAD
const router = express.Router()
=======

const router=express.Router()
>>>>>>> 0573d4c (error handling)
//POST/api/bookings - create a new booking
router.post('/', verifyToken, validateCreateBooking, createBooking)

// Get/api/bookings - Get client's bookings
router.get('/', verifyToken, getClientBookings)
// GET/api/bookings/:id - Get single booking details
router.get('/:id', verifyToken, getBookingById)

//PUT /api/bookings/:id/cancel - Cancel booking
router.put('/:id/cancel', verifyToken, validateCancellation, cancelBooking)

router.get('/client/:clientId', async (req, res) => {
    try {
        const bookings = await Booking.find({ client_id: req.params.clientId })
            .populate('technician_id', 'fname lname profilePic username email')
            .populate('client_id', 'fname lname profilePic username email')
            .sort({ created_at: -1 })

        res.json(bookings)
    } catch (error) {
        console.error('Error fetching client bookings:', error)
        res.status(500).json({ error: 'Failed to fetch bookings' })
    }
})

// Get bookings by technician ID
router.get('/technician/:technicianId', async (req, res) => {
    try {
        const bookings = await Booking.find({ technician_id: req.params.technicianId })
            .populate('technician_id', 'fname lname profilePic username email')
            .populate('client_id', 'fname lname profilePic username email')
            .sort({ created_at: -1 })

        res.json(bookings)
    } catch (error) {
        console.error('Error fetching technician bookings:', error)
        res.status(500).json({ error: 'Failed to fetch bookings' })
    }
})

// Get single booking by ID (for chat page)
router.get('/:bookingId', async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.bookingId)
            .populate('technician_id', 'fname lname profilePic username email')
            .populate('client_id', 'fname lname profilePic username email')

        if (!booking) {
            return res.status(404).json({ error: 'Booking not found' })
        }

        res.json(booking)
    } catch (error) {
        console.error('Error fetching booking:', error)
        if (error.name === 'CastError') {
            return res.status(400).json({ error: 'Invalid booking ID format' })
        }
        res.status(500).json({ error: 'Failed to fetch booking' })
    }
})

// Update booking status
router.patch('/:bookingId/status', async (req, res) => {
    try {
        const { booking_status, cancelled_by } = req.body
        const validStatuses = ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'rescheduled']

        if (!validStatuses.includes(booking_status)) {
            return res.status(400).json({ error: 'Invalid booking status' })
        }

        const updateData = {
            booking_status,
            updated_at: Date.now()
        }

        // If booking is being cancelled, add cancellation details
        if (booking_status === 'cancelled') {
            updateData.cancelled_at = Date.now()
            if (cancelled_by) {
                updateData.cancelled_by = cancelled_by
            }
        }

        const booking = await Booking.findByIdAndUpdate(
            req.params.bookingId,
            updateData,
            { new: true }
        ).populate('technician_id', 'fname lname profilePic username email')
            .populate('client_id', 'fname lname profilePic username email')

        if (!booking) {
            return res.status(404).json({ error: 'Booking not found' })
        }

        res.json(booking)
    } catch (error) {
        console.error('Error updating booking status:', error)
        if (error.name === 'CastError') {
            return res.status(400).json({ error: 'Invalid booking ID format' })
        }
        res.status(500).json({ error: 'Failed to update booking status' })
    }
})

// Get all bookings for a user (both client and technician bookings)
router.get('/user/:userId', async (req, res) => {
    try {
        const userId = req.params.userId

        // Find bookings where user is either client or technician
        const bookings = await Booking.find({
            $or: [
                { client_id: userId },
                { technician_id: userId }
            ]
        })
            .populate('technician_id', 'fname lname profilePic username email')
            .populate('client_id', 'fname lname profilePic username email')
            .sort({ created_at: -1 })

        res.json(bookings)
    } catch (error) {
        console.error('Error fetching user bookings:', error)
        res.status(500).json({ error: 'Failed to fetch bookings' })
    }
})

// Get booking statistics for dashboard
router.get('/stats/:userId', async (req, res) => {
    try {
        const userId = req.params.userId
        const { userType } = req.query

        let query = {}
        if (userType === 'client') {
            query.client_id = userId
        } else if (userType === 'technician') {
            query.technician_id = userId
        } else {
            query = {
                $or: [{ client_id: userId }, { technician_id: userId }]
            }
        }

        const stats = await Booking.aggregate([
            { $match: query },
            {
                $group: {
                    _id: '$booking_status',
                    count: { $sum: 1 }
                }
            }
        ])

        // Transform to object format
        const statsObject = {
            pending: 0,
            confirmed: 0,
            in_progress: 0,
            completed: 0,
            cancelled: 0,
            rescheduled: 0
        }

        stats.forEach(stat => {
            statsObject[stat._id] = stat.count
        })

        res.json(statsObject)
    } catch (error) {
        console.error('Error fetching booking stats:', error)
        res.status(500).json({ error: 'Failed to fetch booking statistics' })
    }
})

export default router
