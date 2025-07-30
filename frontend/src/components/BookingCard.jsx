import React from 'react';
import { Clock, MapPin, Phone, Mail, XCircle, DollarSign, User, AlertCircle, Star, Calendar, ArrowRight } from 'lucide-react';
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

const BookingCard = ({ booking, onCancel, onViewDetails }) => {
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

   // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return 'No date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    });
  };
  // Calculate if booking can be canceled: status not cancelled/completed & > 24 hours away
  const canCancel =
    booking_status !== BOOKING_STATUS.CANCELLED &&
    booking_status !== BOOKING_STATUS.COMPLETED &&
    new Date(scheduled_date).getTime() - Date.now() > 24 * 60 * 60 * 1000;

      const getStatusConfig = (status) => {
    const configs = {
      [BOOKING_STATUS.PENDING]: {
        bg: 'bg-gradient-to-r from-amber-500 to-orange-500',
        text: 'text-white',
        icon: '⏳',
        pulse: true
      },
      [BOOKING_STATUS.CONFIRMED]: {
        bg: 'bg-gradient-to-r from-blue-500 to-cyan-500',
        text: 'text-white',
        icon: '✓',
        pulse: false
      },
      [BOOKING_STATUS.IN_PROGRESS]: {
        bg: 'bg-gradient-to-r from-purple-500 to-pink-500',
        text: 'text-white',
        icon: '⚡',
        pulse: true
      },
      [BOOKING_STATUS.COMPLETED]: {
        bg: 'bg-gradient-to-r from-green-500 to-emerald-500',
        text: 'text-white',
        icon: '🎉',
        pulse: false
      },
      [BOOKING_STATUS.CANCELLED]: {
        bg: 'bg-gradient-to-r from-red-500 to-rose-500',
        text: 'text-white',
        icon: '❌',
        pulse: false
      },
      [BOOKING_STATUS.RESCHEDULED]: {
        bg: 'bg-gradient-to-r from-indigo-500 to-purple-500',
        text: 'text-white',
        icon: '🔄',
        pulse: false
      }
    };
    return configs[status] || configs[BOOKING_STATUS.PENDING];
  };

  const statusConfig = getStatusConfig(booking_status);

  return (
    <div className="group relative bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 overflow-hidden transform hover:-translate-y-1">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50/50 to-blue-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      {/* Status Indicator Bar */}
      <div className={`h-2 w-full ${statusConfig.bg}`}></div>
      
      <div className="relative p-6">
        {/* Header Section */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                {(technician_id?.name || 'T')[0].toUpperCase()}
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                  {technician_id?.name || 'Technician'}
                </h3>
                <p className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full inline-block">
                  {technician_id?.profession || 'Professional'}
                </p>
              </div>
            </div>
            
            <div className="flex flex-col gap-1 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-400" />
                <span>{technician_id?.email || 'No email provided'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-400" />
                <span>{technician_id?.phone || 'No phone'}</span>
              </div>
            </div>
          </div>

          <div className={`${statusConfig.bg} ${statusConfig.text} px-4 py-2 rounded-2xl font-bold text-sm flex items-center gap-2 shadow-lg ${statusConfig.pulse ? 'animate-pulse' : ''}`}>
            <span>{statusConfig.icon}</span>
            {booking_status.replace(/_/g, ' ').toUpperCase()}
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">
                  {formatDate(scheduled_date)}
                </p>
                <p className="text-sm text-gray-500">at {scheduled_time || 'No time'}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <MapPin className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">{streetAddress || 'No address'}</p>
                <p className="text-sm text-gray-500">{cityAddress || 'No city'}</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl">
              <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="font-bold text-2xl text-emerald-600">NPR {final_price ?? 'N/A'}</p>
                <p className="text-sm text-gray-500">Final Price</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Contact via</p>
                <p className="text-sm text-gray-500">{contactPreference || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Emergency Contact */}
        {emergencyContactName && (
          <div className="mb-4 p-4 bg-orange-50 border border-orange-200 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <User className="w-4 h-4 text-orange-600" />
              <span className="font-medium text-orange-800">Emergency Contact</span>
            </div>
            <p className="text-sm text-orange-700">
              {emergencyContactName} ({emergencyContactPhone || 'No phone'})
            </p>
          </div>
        )}

        {/* Special Instructions */}
        {specialInstructions && (
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <p className="text-sm italic text-blue-800 font-medium">
              💡 "{specialInstructions}"
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <button
            onClick={() => onViewDetails && onViewDetails(booking)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            View Details
            <ArrowRight className="w-4 h-4" />
          </button>

          {canCancel && (
            <button
              onClick={() => onCancel(_id)}
              className="flex items-center gap-2 px-4 py-3 bg-red-50 text-red-600 rounded-xl font-semibold hover:bg-red-100 transition-all duration-300 border border-red-200 hover:border-red-300"
            >
              <XCircle className="w-4 h-4" />
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* Booking ID Badge */}
      <div className="absolute top-4 right-4 bg-black/10 backdrop-blur-sm text-xs px-3 py-1 rounded-full font-mono text-gray-600">
        #{_id?.slice(-6) || 'N/A'}
      </div>
    </div>
  );
};

export default BookingCard;
   