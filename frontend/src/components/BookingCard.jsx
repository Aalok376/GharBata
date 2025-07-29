import React from 'react';
import { Clock, MapPin, Phone, Mail, XCircle, DollarSign, User, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

// Booking status constants (consider importing from a central file if available)
const BOOKING_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  RESCHEDULED: 'rescheduled',
};

const BookingCard = ({ booking, onCancel }) => {
  const {
    _id,
    technician_id,
    scheduled_date,
    scheduled_time,
    final_price,
    booking_status,
    emergencyContactName,
    emergencyContactPhone,
    contactPreference,
    specialInstructions,
    cityAddress,
    streetAddress,
    created_at,
  } = booking;

  // Calculate if booking can be canceled: status not cancelled/completed & > 24 hours away
  const canCancel =
    booking_status !== BOOKING_STATUS.CANCELLED &&
    booking_status !== BOOKING_STATUS.COMPLETED &&
    new Date(scheduled_date).getTime() - Date.now() > 24 * 60 * 60 * 1000;

  return (
    <div className="bg-white p-4 rounded-2xl shadow-md hover:shadow-lg transition-all border border-gray-200 mb-4">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="text-xl font-semibold text-gray-800">
            {technician_id?.name || 'Technician'} ({technician_id?.profession || 'Profession'})
          </h3>
          <p className="text-sm text-gray-500">{technician_id?.email || 'No email provided'}</p>
          <p className="text-sm text-gray-500 flex items-center gap-1">
            <Phone className="w-4 h-4" /> {technician_id?.phone || 'No phone'}
          </p>
        </div>

        <div
          className={`text-sm px-3 py-1 rounded-full font-medium ${
            booking_status === BOOKING_STATUS.PENDING
              ? 'bg-yellow-100 text-yellow-700'
              : booking_status === BOOKING_STATUS.CONFIRMED
              ? 'bg-blue-100 text-blue-700'
              : booking_status === BOOKING_STATUS.IN_PROGRESS
              ? 'bg-purple-100 text-purple-700'
              : booking_status === BOOKING_STATUS.COMPLETED
              ? 'bg-green-100 text-green-700'
              : booking_status === BOOKING_STATUS.CANCELLED
              ? 'bg-red-100 text-red-700'
              : 'bg-gray-100 text-gray-700'
          }`}
        >
          {booking_status.replace(/_/g, ' ')}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-700 mt-2">
        <p className="flex items-center gap-2">
          <Clock className="w-4 h-4" />
          {scheduled_date ? format(new Date(scheduled_date), 'dd MMM yyyy') : 'No date'} at {scheduled_time || 'No time'}
        </p>
        <p className="flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          {streetAddress || 'No address'}, {cityAddress || 'No city'}
        </p>
        <p className="flex items-center gap-2">
          <DollarSign className="w-4 h-4" />
          NPR {final_price ?? 'N/A'}
        </p>
        <p className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          Contact via {contactPreference || 'N/A'}
        </p>
        {emergencyContactName && (
          <p className="flex items-center gap-2">
            <User className="w-4 h-4" />
            Emergency: {emergencyContactName} ({emergencyContactPhone || 'No phone'})
          </p>
        )}
        {specialInstructions && (
          <p className="col-span-full italic text-gray-600">&ldquo;{specialInstructions}&rdquo;</p>
        )}
      </div>

      {canCancel && (
        <div className="mt-4 flex justify-end">
          <button
            onClick={() => onCancel(_id)}
            className="flex items-center gap-1 px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200"
          >
            <XCircle className="w-4 h-4" /> Cancel Booking
          </button>
        </div>
      )}
    </div>
  );
};

export default BookingCard;
