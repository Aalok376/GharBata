import express from 'express'
import mongoose from 'mongoose'
import Client from '../models/client.js'
import Booking from '../models/modelBooking.js'
import Technician from '../models/technician.js'
import { verifyToken } from '../middlewares/auth.js'

const router = express.Router()

// CREATE BOOKING
router.post('/create', verifyToken, async (req, res) => {
  try {
    const {
      technician_id,
      fname,
      lname,
      email,
      phoneNumber,
      streetAddress,
      apartMent,
      cityAddress,
      service,
      emergencyContactName,
      emergencyContactPhone,
      scheduled_date,
      scheduled_time,
      specialInstructions,
      contactPreference,
      latitude,
      longitude,
      final_price
    } = req.body

    const userId = req.user.id
    // Validate client and technician exist
    const client = await Client.findOne({ client_id: userId })
    const technician = await Technician.findById(technician_id)

    if (!client) {
      return res.status(404).json({ error: 'Client not found' })
    }
    if (!technician) {
      return res.status(404).json({ error: 'Technician not found' })
    }

    // Check technician availability
    const existingBooking = await Booking.findOne({
      technician_id,
      scheduled_date: new Date(scheduled_date),
      scheduled_time,
      booking_status: { $in: ['pending', 'confirmed', 'in_progress'] }
    })

    if (existingBooking) {
      return res.status(409).json({ error: 'Technician is not available at this time' })
    }

    const newBooking = new Booking({
      client_id: client._id,
      technician_id,
      fname,
      lname,
      email,
      phoneNumber,
      streetAddress,
      apartMent,
      cityAddress,
      service,
      emergencyContactName,
      emergencyContactPhone,
      scheduled_date: new Date(scheduled_date),
      scheduled_time,
      specialInstructions,
      contactPreference,
      latitude,
      longitude,
      final_price,
      booking_status: 'pending'
    })

    const savedBooking = await newBooking.save()
    await savedBooking.populate(['client_id', 'technician_id'])

    res.status(201).json({
      message: 'Booking created successfully',
      booking: savedBooking
    })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// ACCEPT BOOKING (Technician accepts)
router.patch('/:id/accept', verifyToken, async (req, res) => {
  try {
    const { id } = req.params
    const { technician_id } = req.body // Verify the technician accepting

    const booking = await Booking.findById(id)
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' })
    }

    if (booking.technician_id.toString() !== technician_id) {
      return res.status(403).json({ error: 'Unauthorized to accept this booking' })
    }

    if (booking.booking_status !== 'pending') {
      return res.status(400).json({ error: 'Booking cannot be accepted in current status' })
    }

    booking.booking_status = 'confirmed'
    booking.confirmed_at = new Date()
    booking.updated_at = new Date()

    await booking.save()
    await booking.populate(['client_id', 'technician_id'])

    res.json({
      message: 'Booking accepted successfully',
      booking
    })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// REJECT BOOKING (Technician rejects)
router.patch('/:id/reject', verifyToken, async (req, res) => {
  try {
    const { id } = req.params
    const { technician_id, rejection_reason } = req.body

    const booking = await Booking.findById(id)
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' })
    }

    if (booking.technician_id.toString() !== technician_id) {
      return res.status(403).json({ error: 'Unauthorized to reject this booking' })
    }

    if (booking.booking_status !== 'pending') {
      return res.status(400).json({ error: 'Booking cannot be rejected in current status' })
    }

    booking.booking_status = 'cancelled'
    booking.cancelled_at = new Date()
    booking.cancelled_by = technician_id
    booking.rejection_reason = rejection_reason
    booking.updated_at = new Date()

    await booking.save()
    await booking.populate(['client_id', 'technician_id'])

    res.json({
      message: 'Booking rejected successfully',
      booking
    })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// CANCEL BOOKING (Client or Admin cancels)
router.patch('/:id/cancel', verifyToken, async (req, res) => {
  try {
    const { id } = req.params
    const { cancelled_by, cancellation_reason } = req.body

    const booking = await Booking.findById(id)
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' })
    }

    if (['completed', 'cancelled'].includes(booking.booking_status)) {
      return res.status(400).json({ error: 'Booking cannot be cancelled in current status' })
    }

    booking.booking_status = 'cancelled'
    booking.cancelled_at = new Date()
    booking.cancelled_by = cancelled_by
    booking.cancellation_reason = cancellation_reason
    booking.updated_at = new Date()

    await booking.save()
    await booking.populate(['client_id', 'technician_id'])

    res.json({
      message: 'Booking cancelled successfully',
      booking
    })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// START SERVICE (Technician starts work)
router.patch('/:id/start', verifyToken, async (req, res) => {
  try {
    const { id } = req.params
    const { technician_id } = req.body

    const booking = await Booking.findById(id)
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' })
    }

    if (booking.technician_id.toString() !== technician_id) {
      return res.status(403).json({ error: 'Unauthorized to start this booking' })
    }

    if (booking.booking_status !== 'confirmed') {
      return res.status(400).json({ error: 'Booking must be confirmed before starting' })
    }

    booking.booking_status = 'in_progress'
    booking.started_at = new Date()
    booking.updated_at = new Date()

    await booking.save()
    await booking.populate(['client_id', 'technician_id'])

    res.json({
      message: 'Service started successfully',
      booking
    })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// COMPLETE BOOKING (Technician completes work)
router.patch('/:id/complete', verifyToken, async (req, res) => {
  try {
    const { id } = req.params
    const { technician_id, completion_notes, actual_price } = req.body

    const booking = await Booking.findById(id)
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' })
    }

    if (booking.technician_id.toString() !== technician_id) {
      return res.status(403).json({ error: 'Unauthorized to complete this booking' })
    }

    if (booking.booking_status !== 'in_progress') {
      return res.status(400).json({ error: 'Booking must be in progress to complete' })
    }

    booking.booking_status = 'completed'
    booking.completed_at = new Date()
    booking.completion_notes = completion_notes
    if (actual_price) {
      booking.final_price = actual_price // Update final price if provided
    }
    booking.updated_at = new Date()

    await booking.save()
    await booking.populate(['client_id', 'technician_id'])

    res.json({
      message: 'Booking completed successfully',
      booking
    })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// RESCHEDULE BOOKING
router.patch('/:id/reschedule', verifyToken, async (req, res) => {
  try {
    const { id } = req.params
    const { new_date, new_time, rescheduled_by, reschedule_reason } = req.body

    const booking = await Booking.findById(id)
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' })
    }

    if (['completed', 'cancelled', 'in_progress'].includes(booking.booking_status)) {
      return res.status(400).json({ error: 'Booking cannot be rescheduled in current status' })
    }

    // Check technician availability for new time
    const conflictBooking = await Booking.findOne({
      technician_id: booking.technician_id,
      scheduled_date: new Date(new_date),
      scheduled_time: new_time,
      booking_status: { $in: ['pending', 'confirmed', 'in_progress', 'rescheduled'] },
      _id: { $ne: id }
    })

    if (conflictBooking) {
      return res.status(409).json({ error: 'Technician is not available at the new time' })
    }

    // Store old schedule in history
    booking.schedule_history = booking.schedule_history || []
    booking.schedule_history.push({
      old_date: booking.scheduled_date,
      old_time: booking.scheduled_time,
      new_date: new Date(new_date),
      new_time: new_time,
      rescheduled_by,
      rescheduled_at: new Date(),
      reason: reschedule_reason
    })

    booking.scheduled_date = new Date(new_date)
    booking.scheduled_time = new_time
    booking.booking_status = 'confirmed'
    booking.updated_at = new Date()

    await booking.save()
    await booking.populate(['client_id', 'technician_id'])

    res.json({
      message: 'Booking rescheduled successfully',
      booking
    })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// GET ALL BOOKINGS (with filters)
router.get('/', verifyToken, async (req, res) => {
  try {
    const {
      technician_id,
      client_id,
      status,
      date_from,
      date_to,
      page = 1,
      limit = 10
    } = req.query

    const filter = {}
    if (technician_id) filter.technician_id = technician_id
    if (client_id) filter.client_id = client_id
    if (status) filter.booking_status = status
    if (date_from || date_to) {
      filter.scheduled_date = {}
      if (date_from) filter.scheduled_date.$gte = new Date(date_from)
      if (date_to) filter.scheduled_date.$lte = new Date(date_to)
    }

    const skip = (page - 1) * limit

    const bookings = await Booking.find(filter)
      .populate('client_id')
      .populate({
        path: 'technician_id',
        populate: {
          path: 'user',
          select: '-password'
        }
      })
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(parseInt(limit))

    const total = await Booking.countDocuments(filter)

    res.json({
      bookings,
      pagination: {
        current_page: parseInt(page),
        total_pages: Math.ceil(total / limit),
        total_bookings: total
      }
    })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// GET BOOKING BY ID
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate({
        path: 'client_id',
        populate: {
          path: 'user',
          select: '-password'
        }
      })
      .populate({
        path: 'technician_id',
        populate: {
          path: 'user',
          select: '-password'
        }
      })
      .populate({
        path: 'cancelled_by'
      })

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' })
    }

    res.json({ booking })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// UPDATE BOOKING DETAILS (before confirmation)
router.patch('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params
    const updates = req.body

    const booking = await Booking.findById(id)
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' })
    }

    if (booking.booking_status !== 'pending') {
      return res.status(400).json({ error: 'Can only update pending bookings' })
    }

    // Prevent updating certain fields
    delete updates.booking_status
    delete updates.created_at
    delete updates.cancelled_at
    delete updates.cancelled_by

    updates.updated_at = new Date()

    const updatedBooking = await Booking.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    ).populate(['client_id', 'technician_id'])

    res.json({
      message: 'Booking updated successfully',
      booking: updatedBooking
    })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// GET TECHNICIAN SCHEDULE
router.get('/technician/:technician_id/schedule', verifyToken, async (req, res) => {
  try {
    const { technician_id } = req.params
    const { date } = req.query

    const filter = {
      technician_id,
      booking_status: { $in: ['confirmed', 'in_progress'] }
    }

    if (date) {
      const targetDate = new Date(date)
      const nextDay = new Date(targetDate)
      nextDay.setDate(nextDay.getDate() + 1)

      filter.scheduled_date = {
        $gte: targetDate,
        $lt: nextDay
      }
    }

    const bookings = await Booking.find(filter)
      .populate('client_id')
      .sort({ scheduled_date: 1, scheduled_time: 1 })

    res.json({ schedule: bookings })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// ADD RATING AND FEEDBACK
router.patch('/:id/feedback', verifyToken, async (req, res) => {
  try {
    const { id } = req.params
    const { rating, feedback } = req.body

    const booking = await Booking.findById(id)
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' })
    }

    if (booking.booking_status !== 'completed') {
      return res.status(400).json({ error: 'Can only add feedback to completed bookings' })
    }

    booking.rating = rating
    booking.feedback = feedback
    booking.feedback_date = new Date()
    booking.updated_at = new Date()

    await booking.save()
    await booking.populate(['client_id', 'technician_id'])

    res.json({
      message: 'Feedback added successfully',
      booking
    })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// GET BOOKING STATISTICS
router.get('/stats/overview', verifyToken, async (req, res) => {
  try {
    const { technician_id, date_from, date_to } = req.query

    const matchFilter = {}
    if (technician_id) matchFilter.technician_id = new mongoose.Types.ObjectId(technician_id)
    if (date_from || date_to) {
      matchFilter.created_at = {}
      if (date_from) matchFilter.created_at.$gte = new Date(date_from)
      if (date_to) matchFilter.created_at.$lte = new Date(date_to)
    }

    const stats = await Booking.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: null,
          total_bookings: { $sum: 1 },
          pending: { $sum: { $cond: [{ $eq: ['$booking_status', 'pending'] }, 1, 0] } },
          confirmed: { $sum: { $cond: [{ $eq: ['$booking_status', 'confirmed'] }, 1, 0] } },
          in_progress: { $sum: { $cond: [{ $eq: ['$booking_status', 'in_progress'] }, 1, 0] } },
          completed: { $sum: { $cond: [{ $eq: ['$booking_status', 'completed'] }, 1, 0] } },
          cancelled: { $sum: { $cond: [{ $eq: ['$booking_status', 'cancelled'] }, 1, 0] } },
          rescheduled: { $sum: { $cond: [{ $eq: ['$booking_status', 'rescheduled'] }, 1, 0] } },
          total_revenue: { $sum: { $cond: [{ $eq: ['$booking_status', 'completed'] }, '$final_price', 0] } },
          avg_booking_value: { $avg: '$final_price' },
          avg_rating: { $avg: '$rating' }
        }
      }
    ])

    res.json({ stats: stats[0] || {} })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

export default router