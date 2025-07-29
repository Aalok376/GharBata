import {body, param,query} from 'express-validator'
import { validateBookingDate,validateTimeFormat } from '../utils/bookingUtils.js'

// Validation for creating new Booking
export const validateCreateBooking=[
    body('technician_id')
    .notEmpty()
    .withMessage('Technician ID is required')
    .isMongoId()
    .withMessage('Invalid technician ID'),

  body('fname')
    .notEmpty()
    .withMessage('First name is required')
    .isLength({ min: 2 })
    .withMessage('First name must be at least 2 characters'),

  body('lname')
    .notEmpty()
    .withMessage('Last name is required')
    .isLength({ min: 2 })
    .withMessage('Last name must be at least 2 characters'),

    
  body('email')
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Invalid email address'),

      body('phoneNumber')
    .notEmpty()
    .withMessage('Phone number is required')
    .isMobilePhone()
    .withMessage('Invalid phone number'),

     body('streetAddress')
    .notEmpty()
    .withMessage('Street address is required')
    .isLength({ min: 10, max: 200 })
    .withMessage('Street address must be between 10 and 200 characters'),


      body('apartMent')
    .optional()
    .trim(),

     body('cityAddress')
    .notEmpty()
    .withMessage('City is required'),

      body('service')
    .notEmpty()
    .withMessage('Service is required'),

      body('emergencyContactName')
    .optional()
    .isLength({ min: 2 })
    .withMessage('Emergency contact name must be at least 2 characters'),

      body('emergencyContactPhone')
    .optional()
    .isMobilePhone()
    .withMessage('Invalid emergency contact phone number'),


    body('scheduled_date')
    .notEmpty()
    .withMessage('Scheduled date is required')
    .withMessage('Invalid date format')
    .custom((value)=>{
        if(!validateBookingDate(value)){
            throw new Error('Booking date must be today or in the future')
        }
        return true
    }),

    body('scheduled_time')
    .notEmpty()
    .withMessage('Scheduled time is required')
    .custom((value)=>{
        if(value && !validateTimeFormat(value)){
            throw new Error('Time must be in HH:MM format')
        }
        return true
    }),

  body('specialInstructions')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Special instructions cannot exceed 500 characters'),    

    
  body('contactPreference')
    .optional()
    .isIn(['phone', 'email', 'text'])
    .withMessage('Invalid contact preference'),

  body('latitude')
    .notEmpty()
    .withMessage('Latitude is required'),

    
  body('longitude')
    .notEmpty()
    .withMessage('Longitude is required'),

      body('final_price')
    .notEmpty()
    .withMessage('Final price is required')
    .isNumeric()
    .withMessage('Final price must be a number')
    .custom((value) => {
      if (value < 0) {
        throw new Error('Final price cannot be negative')
      }
      return true
    })
]
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
            throw new Error('Booking date must be today or in the future')
        }
        return true
    }),

    body('scheduled_time')
    .optional()
    .custom((value)=>{
        if(value && !validateTimeFormat(value)){
            throw new Error('Time must be in HH:MM format')
        }
        return true
    }),

    
  body('specialInstructions')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Special instructions cannot exceed 500 characters'),

      body('contactPreference')
    .optional()
    .isIn(['phone', 'email', 'text'])
    .withMessage('Invalid contact preference')

    
 ]

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
 ]

 //validation for cancellation
 export const validateCancellation=[
param('id')
.isMongoId()
.withMessage('Invalid booking ID'),

 ]
 