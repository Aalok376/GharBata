import crypto from 'crypto'
import { BOOKING_STATUS } from '../controllers/bookingController.js';
//generate unique booking ID
export const generateBookingId=()=>{
    const timestamp= Date.now()
    const randomString= crypto.randomBytes(4).toString('hex')
    return `BK${timestamp}${randomString.toUpperCase()}`
}
// validate booking date
export const validateBookingDate =(date)=>{
    const bookingDate=new Date(date)
    const today=new Date()
    today.setHours(0,0,0,0)
    return bookingDate >=today
}

//Validate booking time format
export const validateTimeFormat=(time)=>{
    const timeRegex =/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
    return timeRegex.test(time)
}

// Calculate booking deadline (24 hours before scheduled time)
export const calculateBookingDeadline=(scheduledDate,scheduledTime)=>{
    const [hours, minutes]=scheduledTime.split(':')
    const bookingDateTime=new Date(scheduledDate)
    bookingDateTime.setHours(parseInt(hours),parseInt(minutes),0,0)

    const deadline= new Date(bookingDateTime)
    deadline.setHours(deadline.getHours() - 24) //24 hours before
    return deadline
}
// check if booking can be cancelled(before 24 hours)
export const canCancelBooking=(scheduledDate,scheduledTime)=>{
    const deadline=calculateBookingDeadline(scheduledDate,scheduledTime)
    return new Date() <= deadline
}

//Format booking status for display
export const formatBookingStatus=(status)=>{
    const statusMap={
         [BOOKING_STATUS.PENDING]: 'Pending Confirmation',
    [BOOKING_STATUS.CONFIRMED]: 'Confirmed',
    [BOOKING_STATUS.IN_PROGRESS]: 'Service In Progress',
    [BOOKING_STATUS.COMPLETED]: 'Completed',
    [BOOKING_STATUS.CANCELLED]: 'Cancelled',
    [BOOKING_STATUS.RESCHEDULED]: 'Rescheduled'
    }
    return statusMap[status] || status
}

// check if technician is available at given date and time
export const checkTechnicianAvailability=async(technicianId,date,time,excludeBookingId=null)=>{
    const Booking=(await import('../models/Booking.js')).default

    const query = {
        technician_id: technicianId,
        scheduled_date: new Date(date),
    scheduled_time: time,
    booking_status:{ $in: [BOOKING_STATUS.CONFIRMED, BOOKING_STATUS.IN_PROGRESS]}
    }
    if(excludeBookingId){
        query._id={$ne: excludeBookingId}
    }
    const existingBooking= await Booking.findOne(query)
    return !existingBooking
}