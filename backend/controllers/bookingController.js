import User from '../models/user.js';
import Booking from '../models/Booking.js';
import Service from '../models/Service.js';
import {validationResult} from 'express-validator';
import {generateBookingId,canCancelBooking,checkTechnicianAvailability} from '../utils/bookingUtils.js';

//HTTP status codes
const HTTP_STATUS={
    OK : 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500
};

// User roles
const USER_ROLES={
    CLIENT: 'client',
    TECHNICIAN: 'technician'
};
// Booking status
const BOOKING_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  RESCHEDULED: 'rescheduled'
};

//create new booking
export const  createBooking=async(req,res)=>{
    try{
        // check validation errors
        const errors=validationResult(req);
        if(!errors.isEmpty()){
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: 'Validation error',
                errors: errors.array()
            });
            
        }
        const {technician_id, service_id,address,scheduled_date,scheduled_time,booking_service_price}=req.body;
        // check if technician exists and is actually a technician
        // if(!technician || technician.role != USER_ROLES.TECHNICIAN){
        //     return res.status(HTTP_STATUS.NOT_FOUND).json({
        //         success: false,
        //         message: 'Technician not found'
        //     });
        // }
        //  //check if the technician is active
        //  if(!technician.is_active){
        //     return res.status(HTTP_STATUS.BAD_REQUEST).json({
        //         success: false,
        //         message: 'Technician is not currently available'
        //     });
        //  }
         // Check if service exists and is active
         const service=await Service.findById(service_id);
         if(!service || !service_is_active){
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: 'Service not found or not available'
            });
         }
         // check technician availability for the selected date and time
        const isAvailable=await checkTechnicianAvailability(technician_id,scheduled_date,scheduled_time);
        if(!isAvailable){
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: 'Technician is not available at the selected date and time'

            });
         }
          // Generate unique booking ID
          let booking_id;
          let exists;
          do {
            booking_id = generateBookingId();
            exists = await Booking.findOne({ booking_id });
          } while (exists);         // Create new booking
         const newBooking=new Booking({
            booking_id,
            client_id: req.user.id, // from auth middleware
            technician_id,
            service_id,
            address,
            scheduled_date: new Date(scheduled_date),
            scheduled_time,
            booking_service_price: parseFloat(booking_service_price),
            final_price: parseFloat(booking_service_price),
            booking_status: BOOKING_STATUS.PENDING
         });
         await newBooking.save();
         // populate the booking with related data
         const populateBooking= await Booking.findById(newBooking._id)
         .populate('technician_id','name email phone profession rating profile_image')
         .populate('service_id','name description category service_price duration_hours')
         .populate('client_id', 'name email phone');

         res.status(HTTP_STATUS.CREATED).json({
            success: true,
            message:'Booking created successfully',
            data:{
                booking: populateBooking
            }
         });
        

    } catch(error){
        console.error('Error creating booking:',error);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};
// Get single booking details
export const getBookingById=async(req,res)=>{
    try{
        const {id}=req.params;
        const client_id=req.user.id;

        const booking=await Booking.findOne({_id: id, client_id})
        .populate('technician_id','name email phone profession rating profile_image')
        .populate('service_id','name description category service_price duration_hours')
        .populate('client_id','name email phone');

        if(!booking){
            return res.status(HTTP_STATUS.NOT_FOUND).json({
                success: false,
                message: 'Booking not found'
            });
        }
        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Booking details retrieved successfully',
            data:{
                booking
            }
        });

    }catch(error){
        console.error('Error fetching booking details:',error);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Get client's booking
export const getClientBookings= async(req,res)=>{
    try{
        const {status,page=1,limit=10}=req.query;
        const client_id=req.user.id;
         //Build filter query
         const filter={client_id};
         if(status)
            filter.booking_status = status;
          // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get bookings
    const bookings = await Booking.find(filter)
      .populate('technician_id', 'name email phone profession rating profile_image')
      .populate('service_id', 'name description category base_price duration_hours')
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const totalBookings = await Booking.countDocuments(filter);
    const totalPages = Math.ceil(totalBookings / parseInt(limit));

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
    });

  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Cancel booking
export const cancelBooking = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const { cancellation_reason } = req.body;
    const client_id = req.user.id;

    // Find the booking
    const booking = await Booking.findOne({ _id: id, client_id });
    if (!booking) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if booking can be cancelled
    if (booking.booking_status === BOOKING_STATUS.CANCELLED) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Booking is already cancelled'
      });
    }

    if (booking.booking_status === BOOKING_STATUS.COMPLETED) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Cannot cancel completed booking'
      });
    }

    // Check cancellation deadline (24 hours before)
    if (!canCancelBooking(booking.scheduled_date, booking.scheduled_time)) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Booking cannot be cancelled within 24 hours of scheduled time'
      });
    }

    // Update booking status
    booking.booking_status = BOOKING_STATUS.CANCELLED;
    booking.cancelled_at = new Date();
    booking.cancelled_by = client_id;
    booking.cancellation_reason = cancellation_reason || 'Cancelled by client';

    await booking.save();

    // Populate the updated booking
    const updatedBooking = await Booking.findById(booking._id)
      .populate('technician_id', 'name email phone profession rating profile_image')
      .populate('service_id', 'name description category base_price duration_hours')
      .populate('client_id', 'name email phone');

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Booking cancelled successfully',
      data: {
        booking: updatedBooking
      }
    });

  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};