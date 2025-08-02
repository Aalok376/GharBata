import express from 'express'
import mongoose from 'mongoose'
import Client from '../models/client.js'
import Booking from '../models/modelBooking.js'
import Technician from '../models/technician.js'
import User from '../models/user.js'
import { verifyToken } from '../middlewares/auth.js'
import { getIssuesStatistics } from '../utils/issueStats.js'

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
      scheduled_StartTime,
      scheduled_EndTime,
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
      scheduled_StartTime,
      scheduled_EndTime,
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
      scheduled_StartTime,
      scheduled_EndTime,
      specialInstructions,
      contactPreference,
      latitude,
      longitude,
      final_price,
      booking_status: 'pending',
      // Initialize status history with the initial 'pending' status
      status_history: [{
        status: 'pending',
        changed_by: userId,
        changed_at: new Date(),
        reason: 'Booking created'
      }]
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

// ACCEPT BOOKING (Technician accepts) - FIXED status tracking
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

    // Use the new updateStatus method for proper tracking
    await booking.updateStatus('confirmed', technician_id, 'Booking accepted by technician')
    booking.confirmed_at = new Date()

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

// REJECT BOOKING (Technician rejects) - FIXED status tracking
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

    // Use the new updateStatus method for proper tracking
    await booking.updateStatus('cancelled', technician_id, rejection_reason || 'Booking rejected by technician')
    booking.cancelled_at = new Date()
    booking.cancelled_by = technician_id
    booking.rejection_reason = rejection_reason

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

// CANCEL BOOKING (Client or Admin cancels) - FIXED status tracking
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

    // Use the new updateStatus method for proper tracking
    await booking.updateStatus('cancelled', cancelled_by, cancellation_reason || 'Booking cancelled')
    booking.cancelled_at = new Date()
    booking.cancelled_by = cancelled_by
    booking.cancellation_reason = cancellation_reason

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

// START SERVICE (Technician starts work) - FIXED status tracking
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

    // Use the new updateStatus method for proper tracking
    await booking.updateStatus('in_progress', technician_id, 'Service started')
    booking.started_at = new Date()

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

// COMPLETE BOOKING (Technician completes work) - FIXED status tracking
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

    // Use the new updateStatus method for proper tracking
    await booking.updateStatus('completed', technician_id, 'Service completed')
    booking.completed_at = new Date()
    booking.completion_notes = completion_notes
    if (actual_price) {
      booking.final_price = actual_price // Update final price if provided
    }

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

// RAISE ISSUE (Client reports issue with cancelled booking)
router.post('/:id/raise-issue', verifyToken, async (req, res) => {
  try {
    const { id } = req.params
    const { issue_type, issue_description, severity = 'medium' } = req.body
    const userId = req.user.id

    // Validate required fields
    if (!issue_type || !issue_description) {
      return res.status(400).json({
        success: false,
        error: 'Issue type and description are required'
      })
    }

    // Validate issue type
    const validIssueTypes = [
      'technician_cancelled_after_acceptance',
      'last_minute_cancellation',
      'unprofessional_behavior',
      'no_show',
      'poor_communication',
      'other'
    ]
    if (!validIssueTypes.includes(issue_type)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid issue type'
      })
    }

    // Find the booking
    const booking = await Booking.findById(id)
    if (!booking) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      })
    }

    // Find the client
    const client = await Client.findOne({ client_id: userId })
    if (!client) {
      return res.status(404).json({
        success: false,
        error: 'Client not found'
      })
    }

    // Verify the client is authorized to report issue for this booking
    if (booking.client_id.toString() !== client._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized to report issue for this booking'
      })
    }

    // Check if client can raise an issue (using the method from booking schema)
    if (!booking.canRaiseIssue(client._id)) {
      return res.status(400).json({
        success: false,
        error: 'Cannot raise issue for this booking. Issues can only be reported for bookings that were accepted and then cancelled by the technician.'
      })
    }

    // Check for duplicate issues
    const existingIssue = booking.issues.find(issue =>
      issue.reported_by.toString() === userId.toString() &&
      issue.issue_type === issue_type &&
      issue.status !== 'resolved'
    )

    if (existingIssue) {
      return res.status(400).json({
        success: false,
        error: 'You have already reported a similar issue for this booking'
      })
    }

    // Add the issue using the method from booking schema
    await booking.addIssue({
      reported_by: userId,
      issue_type,
      issue_description,
      severity
    })

    await booking.populate(['client_id', 'technician_id'])

    res.status(201).json({
      success: true,
      message: 'Issue reported successfully. Our team will review it shortly.',
      booking,
      issue_id: booking.issues[booking.issues.length - 1]._id
    })
  } catch (error) {
    console.error('Error raising issue:', error)
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
  }
})

// GET BOOKING ISSUES WITH ENHANCED FILTERING (Admin/Client endpoint)
router.get('/issues/all', verifyToken, async (req, res) => {
  try {
    const {
      status,
      severity,
      issue_type,
      technician_id,
      client_id,
      date_from,
      date_to,
      page = 1,
      limit = 10,
      sort_by = 'reported_at',
      sort_order = 'desc'
    } = req.query

    // Build filter for issues
    const matchFilter = {}
    if (technician_id) matchFilter['technician_id'] = technician_id
    if (client_id) matchFilter['client_id'] = client_id

    // Date filtering
    if (date_from || date_to) {
      matchFilter['issues.reported_at'] = {}
      if (date_from) matchFilter['issues.reported_at'].$gte = new Date(date_from)
      if (date_to) matchFilter['issues.reported_at'].$lte = new Date(date_to)
    }

    const skip = (page - 1) * limit
    const sortDirection = sort_order === 'desc' ? -1 : 1

    const bookingsWithIssues = await Booking.find({
      'issues.0': { $exists: true }, // Has at least one issue
      ...matchFilter
    })
      .populate({
        path: 'client_id',
        populate: {
          path: 'client_id',
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
      .populate('issues.reported_by', '-password')
      .populate('issues.resolved_by', '-password')
      .sort({ [`issues.${sort_by}`]: sortDirection })
      .skip(skip)
      .limit(parseInt(limit))

    const total = await Booking.countDocuments({
      'issues.0': { $exists: true },
      ...matchFilter
    })

    // Flatten issues for easier handling with enhanced filtering
    const issuesWithBookingInfo = []
    bookingsWithIssues.forEach(booking => {
      booking.issues.forEach(issue => {
        let includeIssue = true

        if (status && status !== 'all' && issue.status !== status) includeIssue = false
        if (severity && severity !== 'all' && issue.severity !== severity) includeIssue = false
        if (issue_type && issue_type !== 'all' && issue.issue_type !== issue_type) includeIssue = false

        if (includeIssue) {
          issuesWithBookingInfo.push({
            issue: {
              ...issue.toObject(),
              booking_id: booking._id
            },
            booking: {
              _id: booking._id,
              service: booking.service,
              scheduled_date: booking.scheduled_date,
              scheduled_StartTime: booking.scheduled_StartTime,
              scheduled_EndTime: booking.scheduled_EndTime,
              booking_status: booking.booking_status,
              client_id: booking.client_id,
              technician_id: booking.technician_id,
              status_history: booking.status_history,
              streetAddress: booking.streetAddress,
              cityAddress: booking.cityAddress,
              final_price: booking.final_price
            }
          })
        }
      })
    })

    // Get statistics
    const stats = await getIssuesStatistics()

    res.json({
      success: true,
      issues: issuesWithBookingInfo,
      pagination: {
        current_page: parseInt(page),
        total_pages: Math.ceil(total / limit),
        total_issues: total,
        limit: parseInt(limit)
      },
      stats
    })
  } catch (error) {
    console.error('Error fetching issues:', error)
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
  }
})

// GET SINGLE ISSUE DETAILS
router.get('/:bookingId/issues/:issueId', verifyToken, async (req, res) => {
  try {
    const { bookingId, issueId } = req.params

    const booking = await Booking.findById(bookingId)
      .populate({
        path: 'client_id',
        populate: {
          path: 'client_id',
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
      .populate('issues.reported_by', '-password')
      .populate('issues.resolved_by', '-password')

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      })
    }

    const issue = booking.issues.id(issueId)
    if (!issue) {
      return res.status(404).json({
        success: false,
        error: 'Issue not found'
      })
    }

    res.json({
      success: true,
      issue,
      booking: {
        _id: booking._id,
        service: booking.service,
        scheduled_date: booking.scheduled_date,
        scheduled_StartTime: booking.scheduled_StartTime,
        scheduled_EndTime: booking.scheduled_EndTime,
        booking_status: booking.booking_status,
        client_id: booking.client_id,
        technician_id: booking.technician_id,
        streetAddress: booking.streetAddress,
        cityAddress: booking.cityAddress,
        final_price: booking.final_price,
        status_history: booking.status_history
      }
    })
  } catch (error) {
    console.error('Error fetching issue details:', error)
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
  }
})

// UPDATE ISSUE STATUS (Admin endpoint to resolve/dismiss issues)
router.patch('/:bookingId/issues/:issueId/status', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const { bookingId, issueId } = req.params
    const { status, admin_notes, resolution_action } = req.body
    const adminUserId = req.user.id

    // Validate status
    const validStatuses = ['pending', 'under_review', 'resolved', 'dismissed']
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status'
      })
    }

    const booking = await Booking.findById(bookingId)
    if (!booking) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      })
    }

    // Find the specific issue
    const issue = booking.issues.id(issueId)
    if (!issue) {
      return res.status(404).json({
        success: false,
        error: 'Issue not found'
      })
    }

    // Update issue status
    const previousStatus = issue.status
    issue.status = status
    if (admin_notes) issue.admin_notes = admin_notes
    if (resolution_action) issue.resolution_action = resolution_action

    if (status === 'resolved' || status === 'dismissed') {
      issue.resolved_at = new Date()
      issue.resolved_by = adminUserId
    }

    await booking.save()
    await booking.populate(['client_id', 'technician_id', 'issues.reported_by', 'issues.resolved_by'])

    // Log status change
    console.log(`Issue ${issueId} status changed from ${previousStatus} to ${status} by admin ${adminUserId}`)

    res.json({
      success: true,
      message: `Issue ${status} successfully`,
      issue,
      booking
    })
  } catch (error) {
    console.error('Error updating issue status:', error)
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
  }
})

// GET ALL BOOKINGS (with filters) - UPDATED to populate issues and status history
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
      .populate('issues.reported_by', '-password')
      .populate('issues.resolved_by', '-password')
      .populate('status_history.changed_by', '-password')
      .populate('cancelled_by', '-password')
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

// GET BOOKING BY ID - UPDATED to populate issues and status history
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
      .populate('cancelled_by', '-password')
      .populate('issues.reported_by', '-password')
      .populate('issues.resolved_by', '-password')
      .populate('status_history.changed_by', '-password')

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
    delete updates.issues // Prevent direct issue manipulation
    delete updates.status_history // Prevent direct status history manipulation

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

// GET TECHNICIAN SCHEDULE - UPDATED
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
      .sort({ scheduled_date: 1, scheduled_StartTime: 1, scheduled_EndTime: 1 })

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

// GET BOOKING STATISTICS - UPDATED to include issue statistics
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
          avg_rating: { $avg: '$rating' },
          bookings_with_issues: { $sum: { $cond: [{ $gt: [{ $size: { $ifNull: ['$issues', []] } }, 0] }, 1, 0] } },
          total_issues: { $sum: { $size: { $ifNull: ['$issues', []] } } }
        }
      }
    ])

    // Get issue statistics
    const issueStats = await Booking.aggregate([
      { $match: { ...matchFilter, 'issues.0': { $exists: true } } },
      { $unwind: '$issues' },
      {
        $group: {
          _id: null,
          pending_issues: { $sum: { $cond: [{ $eq: ['$issues.status', 'pending'] }, 1, 0] } },
          under_review_issues: { $sum: { $cond: [{ $eq: ['$issues.status', 'under_review'] }, 1, 0] } },
          resolved_issues: { $sum: { $cond: [{ $eq: ['$issues.status', 'resolved'] }, 1, 0] } },
          dismissed_issues: { $sum: { $cond: [{ $eq: ['$issues.status', 'dismissed'] }, 1, 0] } }
        }
      }
    ])

    const result = {
      ...(stats[0] || {}),
      issue_breakdown: issueStats[0] || {
        pending_issues: 0,
        under_review_issues: 0,
        resolved_issues: 0,
        dismissed_issues: 0
      }
    }

    res.json({ stats: result })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

router.get('/technician/:technicianId/today', verifyToken, async (req, res) => {
  try {
    const { technicianId } = req.params

    // Validate technician ID
    if (!mongoose.Types.ObjectId.isValid(technicianId)) {
      return res.status(400).json({ message: 'Invalid technician ID' })
    }

    // Get today's date range
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    console.log('Fetching bookings for technician:', technicianId)
    console.log('Date range:', today, 'to', tomorrow)

    const bookings = await Booking.find({
      technician_id: new mongoose.Types.ObjectId(technicianId),
      scheduled_date: {
        $gte: today,
        $lt: tomorrow
      }
    })
      .populate('client_id', 'fname lname username phoneNumber')
      .sort({ scheduled_StartTime: 1 })
      .lean()

    res.status(200).json(bookings)
  } catch (error) {
    console.error('Error fetching today\'s bookings:', error)
    res.status(500).json({
      message: 'Failed to fetch today\'s bookings',
      error: error.message
    })
  }
})

router.get('/technician/:technicianId/earnings', verifyToken, async (req, res) => {
  try {
    const { technicianId } = req.params

    // Validate technician ID
    if (!mongoose.Types.ObjectId.isValid(technicianId)) {
      return res.status(400).json({ message: 'Invalid technician ID' })
    }

    const now = new Date()

    // Today's earnings
    const todayStart = new Date(now)
    todayStart.setHours(0, 0, 0, 0)
    const todayEnd = new Date(now)
    todayEnd.setHours(23, 59, 59, 999)

    // This week's earnings (Monday to Sunday)
    const startOfWeek = new Date(now)
    const day = startOfWeek.getDay()
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1) // adjust when day is Sunday
    startOfWeek.setDate(diff)
    startOfWeek.setHours(0, 0, 0, 0)

    // This month's earnings
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    startOfMonth.setHours(0, 0, 0, 0)

    console.log('Calculating earnings for technician:', technicianId)
    console.log('Today range:', todayStart, 'to', todayEnd)
    console.log('Week start:', startOfWeek)
    console.log('Month start:', startOfMonth)

    // Today's earnings
    const todaysEarningsResult = await Booking.aggregate([
      {
        $match: {
          technician_id: new mongoose.Types.ObjectId(technicianId),
          booking_status: 'completed',
          completed_at: {
            $gte: todayStart,
            $lte: todayEnd
          }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$final_price' },
          count: { $sum: 1 }
        }
      }
    ])

    // Weekly earnings
    const weeklyEarningsResult = await Booking.aggregate([
      {
        $match: {
          technician_id: new mongoose.Types.ObjectId(technicianId),
          booking_status: 'completed',
          completed_at: { $gte: startOfWeek }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$final_price' },
          count: { $sum: 1 }
        }
      }
    ])

    // Monthly earnings
    const monthlyEarningsResult = await Booking.aggregate([
      {
        $match: {
          technician_id: new mongoose.Types.ObjectId(technicianId),
          booking_status: 'completed',
          completed_at: { $gte: startOfMonth }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$final_price' },
          count: { $sum: 1 }
        }
      }
    ])

    // Total completed jobs count
    const totalCompletedJobs = await Booking.countDocuments({
      technician_id: new mongoose.Types.ObjectId(technicianId),
      booking_status: 'completed'
    })

    const earningsData = {
      todaysEarnings: todaysEarningsResult[0]?.total || 0,
      todaysJobsCount: todaysEarningsResult[0]?.count || 0,
      weeklyEarnings: weeklyEarningsResult[0]?.total || 0,
      weeklyJobsCount: weeklyEarningsResult[0]?.count || 0,
      monthlyEarnings: monthlyEarningsResult[0]?.total || 0,
      monthlyJobsCount: monthlyEarningsResult[0]?.count || 0,
      totalCompletedJobs: totalCompletedJobs
    }

    console.log('Earnings data:', earningsData)

    res.status(200).json(earningsData)
  } catch (error) {
    console.error('Error fetching earnings data:', error)
    res.status(500).json({
      message: 'Failed to fetch earnings data',
      error: error.message
    })
  }
})


router.get('/:technicianId/reviews', async (req, res) => {
  try {
    const { technicianId } = req.params

    // First check if technician exists
    const technician = await Technician.findById(technicianId)

    if (!technician) {
      return res.status(404).json({
        success: false,
        message: 'Technician not found'
      })
    }

    const bookingsWithReviews = await Booking.find({
      technician_id: technicianId,
      booking_status: 'completed',
      rating: { $exists: true, $ne: null },
      feedback: { $exists: true, $ne: null, $ne: '' }
    })
      .populate({
        path: 'client_id',
        select: 'profilePic',
        populate: {
          path: 'client_id',
          select: 'fname lname username'
        }
      }) // Populate client details for reviews
      .select('service rating feedback feedback_date completed_at client_id')
      .sort({ feedback_date: -1 })
      .lean()

    // Calculate overall stats
    let totalRatings = 0
    let sumRatings = 0
    const serviceStats = {}

    // Process each review
    const reviews = bookingsWithReviews.map(booking => {
      totalRatings++
      sumRatings += booking.rating

      // Group by service
      if (!serviceStats[booking.service]) {
        serviceStats[booking.service] = {
          totalRatings: 0,
          sumRatings: 0,
          reviews: []
        }
      }

      serviceStats[booking.service].totalRatings++
      serviceStats[booking.service].sumRatings += booking.rating

      const review = {
        _id: booking._id,
        rating: booking.rating,
        feedback: booking.feedback,
        service: booking.service,
        reviewDate: booking.feedback_date || booking.completed_at,
        client: {
          _id: booking.client_id.client_id._id,
          fname: booking.client_id.client_id.fname,
          lname: booking.client_id.client_id.lname,
          email: booking.client_id.client_id.username,
          profilePic: booking.client_id.profilePic
        }
      }

      serviceStats[booking.service].reviews.push(review)
      return review
    })

    // Calculate averages for each service
    const serviceRatings = {}
    Object.keys(serviceStats).forEach(service => {
      serviceRatings[service] = {
        average: serviceStats[service].totalRatings > 0
          ? (serviceStats[service].sumRatings / serviceStats[service].totalRatings)
          : 0,
        totalRatings: serviceStats[service].totalRatings,
        reviews: serviceStats[service].reviews
      }
    })

    // Calculate overall average
    const overallAverage = totalRatings > 0 ? (sumRatings / totalRatings) : 0

    // Get total completed jobs
    const totalCompletedJobs = await Booking.countDocuments({
      technician_id: technicianId,
      booking_status: 'completed'
    })

    res.json({
      success: true,
      data: {
        technician: {
          _id: technician._id,
          fname: technician.user?.fname || '',
          lname: technician.user?.lname || '',
          professions: technician.professions || [],
          profilePic: technician.profilePic,
          tasksCompleted: totalCompletedJobs
        },
        reviews: {
          total: totalRatings,
          overall: {
            average: Math.round(overallAverage * 10) / 10, // Round to 1 decimal
            totalRatings: totalRatings
          },
          byService: serviceRatings,
          allReviews: reviews
        }
      }
    })

  } catch (error) {
    console.error('Error fetching technician reviews:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch technician reviews',
      error: error.message
    })
  }
})

function requireRole(role) {
  return async (req, res, next) => {
    try {
      const userId = req.user.id

      const user = await User.findById(userId)
      if (!user) {
        return res.status(404).json({ success: false, error: 'User not found' })
      }

      if (user.userType !== role) {
        return res.status(403).json({
          success: false,
          error: 'Access denied. Admin privileges required.'
        })
      }

      next()
    } catch (err) {
      console.error('Error in requireRole:', err)
      res.status(500).json({ success: false, error: 'Server error' })
    }
  }
}

export default router