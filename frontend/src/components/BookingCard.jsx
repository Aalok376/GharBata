import React from "react";
import { Calendar, Clock, MapPin, Star, Eye, DollarSign, MessageSquare, Phone, Mail } from 'lucide-react';
import { getStatusColor, formatDate, formatTime } from '../utils/helpers.jsx';

const BookingCard = ({
  booking,
  onViewDetails,
  onNegotiate,
  canNegotiate,
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border p-6 hover:shadow-md transition-shadow space-y-4">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Booking ID: <span className="text-blue-600">#{booking.booking_id}</span></h3>
          <span className={`mt-1 inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(booking.booking_status)}`}>
            {booking.booking_status.charAt(0).toUpperCase() + booking.booking_status.slice(1)}
          </span>
        </div>
        <div className="text-xl font-bold text-green-600">${booking.final_price}</div>
      </div>

      {/* Booking Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

        {/* Service Info */}
        <div>
          <p className="text-sm text-gray-500">Service</p>
          <p className="font-medium text-gray-900">{booking.service_id.name}</p>
          <p className="text-xs text-gray-500">{booking.service_id.category}</p>
        </div>

        {/* Technician Info */}
        <div>
          <p className="text-sm text-gray-500">Technician</p>
          <div className="flex items-center">
            <img src={booking.technician_id.profile_image} alt={booking.technician_id.name} className="w-9 h-9 rounded-full object-cover mr-3" />
            <div>
              <p className="text-gray-800">{booking.technician_id.name}</p>
              <div className="flex items-center text-yellow-400">
                <Star className="h-4 w-4 fill-current" />
                <span className="ml-1 text-xs text-gray-600">{booking.technician_id.rating}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Client Info */}
        <div>
          <p className="text-sm text-gray-500">Client</p>
          <p className="font-medium text-gray-900">{booking.client_id.name}</p>
          <div className="flex items-center text-gray-600 text-sm">
            <Phone className="h-4 w-4 mr-1" /> {booking.client_id.phone}
          </div>
          <div className="flex items-center text-gray-600 text-sm">
            <Mail className="h-4 w-4 mr-1" /> {booking.client_id.email}
          </div>
        </div>

        {/* Schedule */}
        <div>
          <p className="text-sm text-gray-500">Schedule</p>
          <div className="flex items-center text-gray-700 text-sm">
            <Calendar className="h-4 w-4 mr-1" /> {formatDate(booking.scheduled_date)}
          </div>
          <div className="flex items-center text-gray-700 text-sm">
            <Clock className="h-4 w-4 mr-1" /> {formatTime(booking.scheduled_time)}
          </div>
        </div>

        {/* Address */}
        <div>
          <p className="text-sm text-gray-500">Address</p>
          <div className="flex items-center text-gray-700 text-sm">
            <MapPin className="h-4 w-4 mr-1" /> {booking.address}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap justify-end gap-3 pt-4 border-t ">
        <button onClick={() => onViewDetails(booking)}
          className="flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition">
          <Eye className="h-4 w-4 mr-2" /> View Details
        </button>

        {canNegotiate(booking) && (
          <button onClick={() => onNegotiate(booking)}
            className="flex items-center px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition">
            <DollarSign className="h-4 w-4 mr-2" /> Negotiate
          </button>
        )}

        {booking.booking_status === "confirmed" && (
          <button
            onClick={() => console.log("Open Chat for booking:", booking.booking_id)}
            className="flex items-center px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition"
          >
            <MessageSquare className="h-4 w-4 mr-2" /> Chat
          </button>
        )}
      </div>

    </div>
  );
};

export default BookingCard;
