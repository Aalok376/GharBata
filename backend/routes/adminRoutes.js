import Technician from "../models/technician.js"
import Booking from '../models/modelBooking.js'
import User from '../models/user.js'

import express from "express"

import { verifyToken } from "../middlewares/auth.js"

import { sendEmail } from "../utils/email.js"

const router = express.Router()


router.post('/technicians/:technicianId/ban', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const { technicianId } = req.params
    const { reason, related_issue_id, ban_duration_days, severity = 'permanent' } = req.body
    const adminUserId = req.user.id

    // Validate required fields
    if (!reason) {
      return res.status(400).json({
        success: false,
        error: 'Ban reason is required'
      })
    }

    // Find the technician
    const technician = await Technician.findById(technicianId).populate('user')
    if (!technician) {
      return res.status(404).json({
        success: false,
        error: 'Technician not found'
      })
    }

    // Check if technician is already banned
    if (technician.is_banned) {
      return res.status(400).json({
        success: false,
        error: 'Technician is already banned'
      })
    }

    // Calculate ban end date if temporary ban
    let ban_end_date = null
    if (severity === 'temporary' && ban_duration_days) {
      ban_end_date = new Date()
      ban_end_date.setDate(ban_end_date.getDate() + parseInt(ban_duration_days))
    }

    // Update technician status
    technician.is_banned = true
    technician.ban_reason = reason
    technician.banned_at = new Date()
    technician.banned_by = adminUserId
    technician.ban_end_date = ban_end_date
    technician.ban_severity = severity

    // Add to ban history
    if (!technician.ban_history) technician.ban_history = []
    technician.ban_history.push({
      banned_at: new Date(),
      banned_by: adminUserId,
      reason: reason,
      related_issue_id: related_issue_id,
      ban_end_date: ban_end_date,
      severity: severity
    })

    await technician.save()

    // Cancel all pending and confirmed bookings for this technician
    const pendingBookings = await Booking.find({
      technician_id: technicianId,
      booking_status: { $in: ['pending', 'confirmed'] }
    })

    for (const booking of pendingBookings) {
      await booking.updateStatus('cancelled', adminUserId, `Technician banned: ${reason}`)
      // Set cancellation details
      booking.cancelled_at = new Date()
      booking.cancelled_by = adminUserId
      booking.cancellation_reason = `Technician banned: ${reason}`
      await booking.save()
    }

    // Send ban notification email to technician
    const banTypeText = severity === 'permanent'
      ? 'permanently'
      : `temporarily for ${ban_duration_days} day(s) (until ${ban_end_date.toDateString()})`

    const emailMessage = `
            Dear ${technician.user.fname},
            
            We regret to inform you that your technician account has been ${banTypeText} due to the following reason:
            
            "${reason}"
            
            As a result, all your upcoming bookings have been cancelled.
            
            If you believe this was a mistake or you would like to appeal, please contact our support team.
            
            Best regards,  
            GharBata Admin Team
            `

    await sendEmail(
      technician.user.username,
      "Account Ban Notification - GharBata",
      emailMessage
    )

    res.json({
      success: true,
      message: `Technician ${technician.user.name} has been banned successfully`,
      ban_details: {
        technician_id: technicianId,
        banned_at: technician.banned_at,
        ban_end_date: ban_end_date,
        severity: severity,
        cancelled_bookings: pendingBookings.length
      }
    })
  } catch (error) {
    console.error('Error banning technician:', error)
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
  }
})

router.post('/technicians/:technicianId/warn', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const { technicianId } = req.params
    const { reason, warning_message, issue_id, booking_id } = req.body
    const adminUserId = req.user.id

    if (!reason || !warning_message) {
      return res.status(400).json({
        success: false,
        error: 'Warning reason and message are required'
      })
    }

    const technician = await Technician.findById(technicianId).populate('user')
    if (!technician) {
      return res.status(404).json({
        success: false,
        error: 'Technician not found'
      })
    }

    const warningEntry = {
      warned_at: new Date(),
      warned_by: adminUserId,
      reason,
      warning_message,
      related_issue_id: issue_id,
      booking_id: booking_id
    }

    if (!technician.warning_history) technician.warning_history = []
    technician.warning_history.push(warningEntry)
    await technician.save()

    const emailMessage = `
                      Dear ${technician.user.name},
                      
                      We are reaching out to inform you that your technician account has received an official warning due to the following reason:
                      
                      "${reason}"
                      
                      This warning has been issued in connection with a reported issue during a service appointment.
                      
                      We kindly request that you review your conduct and take this matter seriously. Continued violations may lead to a temporary or permanent suspension of your account.
                      
                      If you have any questions or believe this warning was issued in error, please contact our support team.
                      
                      Thank you for being a part of the GharBata community.
                      
                      Best regards,  
                      GharBata Admin Team
                      `

    await sendEmail(
      technician.user.username,
      "Account Warning Notification – GharBata",
      emailMessage
    )

    res.json({
      success: true,
      message: `Technician ${technician.user.name} has been warned`,
      warning_details: warningEntry
    })
  } catch (error) {
    console.error('Error warning technician:', error)
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
  }
})


// UNBAN TECHNICIAN
router.post('/technicians/:technicianId/unban', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const { technicianId } = req.params
    const { reason } = req.body
    const adminUserId = req.user.id

    // Validate required fields
    if (!reason) {
      return res.status(400).json({
        success: false,
        error: 'Unban reason is required'
      })
    }

    const technician = await Technician.findById(technicianId).populate('user')
    if (!technician) {
      return res.status(404).json({
        success: false,
        error: 'Technician not found'
      })
    }

    if (!technician.is_banned) {
      return res.status(400).json({
        success: false,
        error: 'Technician is not currently banned'
      })
    }

    // Update technician status
    technician.is_banned = false
    technician.unbanned_at = new Date()
    technician.unbanned_by = adminUserId
    technician.unban_reason = reason
    technician.ban_end_date = null

    await technician.save()

    // Send notification to technician (implement as needed)
    // await sendUnbanNotification(technician, reason)

    res.json({
      success: true,
      message: `Technician ${technician.user.name} has been unbanned successfully`,
      unban_details: {
        technician_id: technicianId,
        unbanned_at: technician.unbanned_at,
        unbanned_by: adminUserId,
        unban_reason: reason
      }
    })
  } catch (error) {
    console.error('Error unbanning technician:', error)
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
  }
})

// GET BANNED TECHNICIANS
router.get('/technicians/banned', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      severity,
      search,
      sort_by = 'banned_at',
      sort_order = 'desc'
    } = req.query

    const skip = (page - 1) * limit
    const sortDirection = sort_order === 'desc' ? -1 : 1

    // Build filter
    const filter = { is_banned: true }
    if (severity && severity !== 'all') {
      filter.ban_severity = severity
    }

    // Build query
    let query = Technician.find(filter)
      .populate('user', '-password')
      .populate('banned_by', 'name username')
      .populate('unbanned_by', 'name username')
      .sort({ [sort_by]: sortDirection })
      .skip(skip)
      .limit(parseInt(limit))

    // Add search if provided
    if (search) {
      query = query.populate({
        path: 'user',
        match: {
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { username: { $regex: search, $options: 'i' } }
          ]
        },
        select: '-password'
      })
    }

    const bannedTechnicians = await query

    // Filter out technicians whose user didn't match search criteria
    const filteredTechnicians = search
      ? bannedTechnicians.filter(tech => tech.user)
      : bannedTechnicians

    const total = await Technician.countDocuments(filter)

    // Get ban statistics
    const banStats = await Technician.aggregate([
      { $match: { is_banned: true } },
      {
        $group: {
          _id: '$ban_severity',
          count: { $sum: 1 }
        }
      }
    ])

    const stats = {
      total_banned: total,
      permanent_bans: banStats.find(s => s._id === 'permanent')?.count || 0,
      temporary_bans: banStats.find(s => s._id === 'temporary')?.count || 0
    }

    res.json({
      success: true,
      banned_technicians: filteredTechnicians,
      pagination: {
        current_page: parseInt(page),
        total_pages: Math.ceil(total / limit),
        total_banned: total,
        limit: parseInt(limit)
      },
      stats
    })
  } catch (error) {
    console.error('Error fetching banned technicians:', error)
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
  }
})

router.get('/technicians/:technicianId/ban-details', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const { technicianId } = req.params

    const technician = await Technician.findById(technicianId)
      .populate('user', '-password')
      .populate('banned_by', 'name username')
      .populate('unbanned_by', 'name username')
      .populate('ban_history.banned_by', 'name username')

    if (!technician) {
      return res.status(404).json({
        success: false,
        error: 'Technician not found'
      })
    }

    // Get cancelled bookings count due to ban
    const cancelledBookingsCount = await Booking.countDocuments({
      technician_id: technicianId,
      booking_status: 'cancelled',
      cancellation_reason: { $regex: 'banned', $options: 'i' }
    })

    res.json({
      success: true,
      technician: {
        _id: technician._id,
        user: technician.user,
        is_banned: technician.is_banned,
        ban_reason: technician.ban_reason,
        banned_at: technician.banned_at,
        banned_by: technician.banned_by,
        ban_end_date: technician.ban_end_date,
        ban_severity: technician.ban_severity,
        unbanned_at: technician.unbanned_at,
        unbanned_by: technician.unbanned_by,
        unban_reason: technician.unban_reason,
        ban_history: technician.ban_history
      },
      cancelled_bookings_count: cancelledBookingsCount
    })
  } catch (error) {
    console.error('Error fetching technician ban details:', error)
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
  }
})

router.post('/technicians/process-expired-bans', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const now = new Date()

    const expiredBans = await Technician.find({
      is_banned: true,
      ban_severity: 'temporary',
      ban_end_date: { $lte: now }
    }).populate('user', 'name username')

    const unbannedTechnicians = []

    for (const technician of expiredBans) {
      technician.is_banned = false
      technician.unbanned_at = now
      technician.unban_reason = 'Temporary ban expired automatically'
      technician.ban_end_date = null

      await technician.save()
      unbannedTechnicians.push({
        technician_id: technician._id,
        name: technician.user.name,
        username: technician.user.username
      })
    }

    res.json({
      success: true,
      message: `Processed ${unbannedTechnicians.length} expired bans`,
      unbanned_technicians: unbannedTechnicians
    })
  } catch (error) {
    console.error('Error processing expired bans:', error)
    res.status(500).json({
      success: false,
      error: 'Internal server error'
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