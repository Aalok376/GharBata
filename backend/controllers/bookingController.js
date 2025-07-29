
import Booking from '../models/Booking.js'
import Technician from '../models/technician.js'
import Client from '../models/client.js'
import {canCancelBooking,checkTechnicianAvailability} from '../utils/bookingUtils.js'
import { validationResult } from 'express-validator'
import mongoose from 'mongoose';


//HTTP status codes
const HTTP_STATUS={
    OK : 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500
}

// User roles
const USER_ROLES={
    CLIENT: 'client',
    TECHNICIAN: 'technician'
}
// Booking status
export const BOOKING_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  RESCHEDULED: 'rescheduled'
}

//create new booking
export const  createBooking=async(req,res)=>{
    try{
      const {
     fname: firstName,
  lname: lastName,
  email,
  phoneNumber: phone,
  streetAddress: address,
  apartMent: apartment,
  cityAddress: city,
  scheduled_date,
  scheduled_time: timeSlot,
  specialInstructions,
  contactPreference,
  emergencyContactName: emergencyContact,
  emergencyContactPhone: emergencyPhone,
  latitude,
  longitude,
  service,
  technician_id: technicianId
    } = req.body;
      const userId = req.user.id
      console.log('User ID from token:', userId);


 // Validate technicianId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(technicianId)) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Invalid technician ID format',
      });
    }

    // Find the Client document where client_id = User _id (userId)
    const client = await Client.findOne({ client_id: userId });
    if (!client) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: 'Client user not found',
      });
    }



        console.log('Searching Technician with ID:', technicianId);

        // Fetch technician by ID
           const technician = await Technician.findById(technicianId)
            if (!technician) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: 'Technician not found',
      });
    }
           console.log('Technician found:', technician);



        // check if technician exists and is actually a technician
        if(!technician){
            return res.status(HTTP_STATUS.NOT_FOUND).json({
                success: false,
                message: 'Technician not found'
            })
        }
         // check technician availability for the selected date and time
        const isAvailable=await checkTechnicianAvailability(technicianId, scheduled_date, timeSlot)
        if(!isAvailable){
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: 'Technician is not available at the selected date and time'

            })
         }
          // Extract hourly rate number from the Map for the given service
    const finalPrice = technician.hourlyRate.get(service);

    if (!finalPrice) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: `Hourly rate not found for service: ${service}`,
      });
    }
        
         // Create new booking
         const newBooking=new Booking({
            client_id: client._id,
      technician_id: technician._id,
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
      scheduled_date: new Date(scheduled_date),
      scheduled_time: timeSlot,
      specialInstructions: specialInstructions,
      contactPreference: contactPreference,
      latitude: latitude,
      longitude: longitude,
      final_price: finalPrice,
      booking_status: BOOKING_STATUS.PENDING

         })
         

         const savedBooking = await newBooking.save()

          const populateBooking = await Booking.findById(savedBooking._id)
        .populate('technician_id', 'name email phone profession rating profile_image')
         .populate('client_id', 'name email phone')

          res.status(HTTP_STATUS.CREATED).json({
            success: true,
            message:'Booking created successfully',
            data:{
                booking: populateBooking
            }
         })
        

    } catch(error){
        console.error('Error creating booking:',error)
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        })
    }
}
// Get single booking details
export const getBookingById=async(req,res)=>{
    try{
        const {id}=req.params
        const userId=req.user.id

         // Find Client document for logged-in user
    const client = await Client.findOne({ client_id: userId });
    if (!client) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: 'Client not found'
      });
    }


  // Find booking by _id and client_id (Client document _id)
    const booking = await Booking.findOne({ _id: id, client_id: client._id })
     .populate('technician_id','name email phone profession rating profile_image  ')
     
       .populate('client_id', 'name email phone')
        if(!booking){
            return res.status(HTTP_STATUS.NOT_FOUND).json({
                success: false,
                message: 'Booking not found'
            })
        }
        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Booking details retrieved successfully',
            data:{
                booking
            }
        })

    }catch(error){
        console.error('Error fetching booking details:',error)
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        })
    }
}

// Get client's booking
export const getClientBookings= async(req,res)=>{
    try{
        const {status,page=1,limit=10}=req.query
        const userId=req.user.id;
         // Find Client document for logged-in user
    const client = await Client.findOne({ client_id: userId });
    if (!client) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: 'Client not found'
      });
    }
         //Build filter query
         const filter={client_id:client._id};
         if(status)
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
    const userId = req.user.id
     // Find Client document for logged-in user
    const client = await Client.findOne({ client_id: userId });
    if (!client) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: 'Client not found'
      });
    }

    // Find the booking
    const booking = await Booking.findOne({ _id: id, client_id:client._id })
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
    booking.cancelled_by = client._id;
    booking.cancellation_reason = cancellation_reason || 'Cancelled by client'

    await booking.save()

    // Populate the updated booking
    const updatedBooking = await Booking.findById(booking._id)
 .populate('technician_id', 'name email phone profession rating profile_image')

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