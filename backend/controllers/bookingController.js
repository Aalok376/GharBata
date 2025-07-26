import Booking from '../models/Booking.js'
import Technician from '../models/technician.js'
import Client from '../models/client.js'
import { canCancelBooking, checkTechnicianAvailability } from '../utils/bookingUtils.js'

//HTTP status codes
const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500
}

// User roles
const USER_ROLES = {
  CLIENT: 'client',
  TECHNICIAN: 'technician'
}
// Booking status
const BOOKING_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  RESCHEDULED: 'rescheduled'
}

//create new booking
export const createBooking = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      address,
      apartment,
      city,
      date,
      timeSlot,
      specialInstructions,
      contactPreference,
      emergencyContact,
      emergencyPhone,
      latitude,
      longitude,
      service,
      technicianId
    } = req.body

    const userId = req.user.id

    const user = await Client.findOne({ client_id: userId })
    const technician = await Technician.findById(technicianId)

    if (!technician) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: 'Technician not found'
      })
    }

    const isAvailable = await checkTechnicianAvailability(technicianId, date, timeSlot)
    if (!isAvailable) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Technician is not available at the selected date and time'

      })
    }

    const newBooking = new Booking({
      client_id: user._id,
      technician_id: technicianId,
      fname:firstName,
      lname:lastName,
      email:email,
      phoneNumber:phone,
      service: service,
      streetAddress: address,
      apartMent: apartment,
      cityAddress: city,
      emergencyContactName: emergencyContact,
      emergencyContactPhone: emergencyPhone,
      scheduled_date: date,
      scheduled_time: timeSlot,
      specialInstructions: specialInstructions,
      contactPreference: contactPreference,
      latitude: latitude,
      longitude: longitude,
      final_price: technician.hourlyRate,
      booking_status: BOOKING_STATUS.PENDING
    })
    await newBooking.save()

    return res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: 'Booking created successfully',
      data: {
        booking: populateBooking
      }
    })


  } catch (error) {
    console.error('Error creating booking:', error)
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    })
  }
}
// Get single booking details
export const getBookingById = async (req, res) => {
  try {
    const { id } = req.params
    const client_id = req.user.id

    const booking = await Booking.findOne({ _id: id, client_id })
      .populate('technician_id', 'name email phone profession rating profile_image')
      .populate('service_id', 'name description category service_price duration_hours')
      .populate('client_id', 'name email phone')

    if (!booking) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: 'Booking not found'
      })
    }
    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Booking details retrieved successfully',
      data: {
        booking
      }
    })

  } catch (error) {
    console.error('Error fetching booking details:', error)
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    })
  }
}

// Get client's booking
export const getClientBookings = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query
    const client_id = req.user.id
    //Build filter query
    const filter = { client_id }
    if (status)
      filter.booking_status = status
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit)

    // Get bookings
    const bookings = await Booking.find(filter)
      .populate('technician_id', 'name email phone profession rating profile_image')
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(parseInt(limit))

    // Get total count for pagination
    const totalBookings = await Booking.countDocuments(filter)
    const totalPages = Math.ceil(totalBookings / parseInt(limit))

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Bookings retrieved successfully',
      data: {
        bookings,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalBookings,
          hasNextPage: parseInt(page) < totalPages,
          hasPrevPage: parseInt(page) > 1
        }
      }
    })

  } catch (error) {
    console.error('Error fetching bookings:', error)
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    })
  }
}

// Cancel booking
export const cancelBooking = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      })
    }

    const { id } = req.params
    const { cancellation_reason } = req.body
    const client_id = req.user.id

    // Find the booking
    const booking = await Booking.findOne({ _id: id, client_id })
    if (!booking) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: 'Booking not found'
      })
    }

    // Check if booking can be cancelled
    if (booking.booking_status === BOOKING_STATUS.CANCELLED) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Booking is already cancelled'
      })
    }

    if (booking.booking_status === BOOKING_STATUS.COMPLETED) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Cannot cancel completed booking'
      })
    }

    // Check cancellation deadline (24 hours before)
    if (!canCancelBooking(booking.scheduled_date, booking.scheduled_time)) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Booking cannot be cancelled within 24 hours of scheduled time'
      })
    }

    // Update booking status
    booking.booking_status = BOOKING_STATUS.CANCELLED
    booking.cancelled_at = new Date()
    booking.cancelled_by = client_id
    booking.cancellation_reason = cancellation_reason || 'Cancelled by client'

    await booking.save()

    // Populate the updated booking
    const updatedBooking = await Booking.findById(booking._id)
      .populate('technician_id', 'name email phone profession rating profile_image')
      .populate('service_id', 'name description category base_price duration_hours')
      .populate('client_id', 'name email phone')

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Booking cancelled successfully',
      data: {
        booking: updatedBooking
      }
    })

  } catch (error) {
    console.error('Error cancelling booking:', error)
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    })
  }
}