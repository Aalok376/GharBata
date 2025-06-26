import {body, param,query} from 'express-validator';
import { validateBookingDate,validateTimeFormat } from '../utils/bookingUtils.js';

// Validation for creating new Booking
export const validateCreateBooking=[
    body('technician_id')
    .notEmpty()
    .withMessage('Technician ID is required')
    .isMongoId()
    .withMessage('Invalid technician ID'),


    body('service_id')
    .notEmpty()
    .withMessage('Service ID is required')
    .isMongoId()
    .withMessage('Invalid service ID'),

    body('address')
    .notEmpty()
    .withMessage('Address is required')
    .isLength({min:10 ,max:200})
    .withMessage('Address must be between 10 and 200 characters')
    .trim(),

    body('scheduled_date')
    .notEmpty()
    .withMessage('Scheduled date is required')
    .isISO8601()
    .withMessage('Invalid date format')
    .custom((value)=>{
        if(!validateBookingDate(value)){
            throw new Error('Booking date must be today or in the future');
        }
        return true;
    }),

    body('scheduled_time')
    .notEmpty()
    .withMessage('Scheduled time is required')
    .custom((value)=>{
        if(value && !validateTimeFormat(value)){
            throw new Error('Time must be in HH:MM format');
        }
        return true;
    }),

    body('address')
    .optional()
    .isLength({min:10 , max:200})
    .withMessage('Address must be between 10 and 200 characters')
    .trim(),

    body('booking_service_price')
    .notEmpty()
    .withMessage('Service price is required')
    .isNumeric()
    .withMessage('Service price must be a number')
    .custom((value)=>{
        if(value < 0){
            throw new Error('Service price cannot be negative');
        }
        return true;
    })

];
 //Validation for updating booking
 export const validateUpdateBooking=[
    param('id')
    .isMongoId()
    .withMessage('Invalid booking ID'),

    body('scheduled_date')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format')
    .custom((value)=>{
        if(value && !validateBookingDate(value)){
            throw new Error('Booking date must be today or in the future');
        }
        return true;
    }),

    body('scheduled_time')
    .optional()
    .custom((value)=>{
        if(value && !validateTimeFormat(value)){
            throw new Error('Time must be in HH:MM format');
        }
        return true;
    }),

    body('address')
    .optional()
    .isLength({min:10 , max:200})
    .withMessage('Address must be between 10 and 200 characters')
    .trim()
 ];

 // validation for booking queries
 export const validateBookingQuery=[
    query('status')
    .optional()
    .isIn(['pending','confirmed','in_progress','completed','cancelled','rescheduled'])
    .withMessage('Invalid booking status'),

    query('date')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format'),

    query('page')
    .optional()
    .isInt({min: 1})
    .withMessage('Page must be a positive integer'),

    query('limit')
    .optional()
    .isInt({min:1, max:100})
    .withMessage('Limit must be between 1 and 100')
 ];

 //validation for cancellation
 export const validateCancellation=[
param('id')
.isMongoId()
.withMessage('Invalid booking ID'),

 ];
 