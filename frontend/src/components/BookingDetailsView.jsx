import React from "react"
import { Calendar, Clock, MapPin, Mail, Phone, Star, DollarSign, ChevronLeft, X, MessageSquare } from 'lucide-react'
import { getStatusColor, getStatusIcon, formatDate, formatTime } from '../utils/helpers.jsx'

const BookingDetailsView = ({ booking, onBack, onNegotiate, canNegotiate, canCancel }) => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-6 space-y-8">

        {/* Header */}
        <div>
          <button onClick={onBack} className="flex items-center text-blue-600 hover:text-blue-800 mb-4">
            <ChevronLeft className="h-5 w-5 mr-1" />
            Back to Bookings
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Booking Details</h1>
          <p className="text-gray-600">Booking ID: <span className="font-medium">#{booking.booking_id}</span></p>
        </div>

        {/* Status and Schedule */}
        <div className="bg-white rounded-xl shadow-sm border p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {getStatusIcon(booking.booking_status)}
              <span className={`ml-2 px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(booking.booking_status)}`}>
                {booking.booking_status.charAt(0).toUpperCase() + booking.booking_status.slice(1)}
              </span>
            </div>
            <div className="text-sm text-gray-500">Created: {new Date(booking.created_at).toLocaleDateString()}</div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-3">Schedule</h3>
              <div className="space-y-2 text-gray-700 text-sm">
                <div className="flex items-center"><Calendar className="h-4 w-4 mr-2" /> {formatDate(booking.scheduled_date)}</div>
                <div className="flex items-center"><Clock className="h-4 w-4 mr-2" /> {formatTime(booking.scheduled_time)}</div>
                <div className="flex items-start"><MapPin className="h-4 w-4 mr-2 mt-1" /> {booking.address}</div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Service</h3>
              <p className="font-medium text-gray-900">{booking.service_id.name}</p>
              <p className="text-gray-600">{booking.service_id.description}</p>
              <p className="text-sm text-gray-500">Category: {booking.service_id.category}</p>
            </div>
          </div>
        </div>

        {/* Technician Info */}
        <div className="bg-white rounded-xl shadow-sm border p-6 space-y-4">
          <h3 className="text-lg font-semibold">Technician Information</h3>
          <div className="flex items-start space-x-4">
            <img src={booking.technician_id.profile_image} alt={booking.technician_id.name} className="w-16 h-16 rounded-full object-cover" />
            <div className="flex-1 space-y-1">
              <div className="flex justify-between items-center">
                <h4 className="text-lg font-medium">{booking.technician_id.name}</h4>
                <div className="flex items-center text-yellow-400">
                  <Star className="h-4 w-4 fill-current" />
                  <span className="ml-1 text-sm text-gray-600">{booking.technician_id.rating}</span>
                </div>
              </div>
              <p className="text-gray-600">{booking.technician_id.profession}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-gray-700 text-sm">
                <div className="flex items-center"><Mail className="h-4 w-4 mr-2" /> {booking.technician_id.email}</div>
                <div className="flex items-center"><Phone className="h-4 w-4 mr-2" /> {booking.technician_id.phone}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Client Info */}
        <div className="bg-white rounded-xl shadow-sm border p-6 space-y-4">
          <h3 className="text-lg font-semibold">Client Information</h3>
          <div className="space-y-1 text-gray-700 text-sm">
            <p className="font-medium">{booking.client_id.name}</p>
            <div className="flex items-center"><Mail className="h-4 w-4 mr-2" /> {booking.client_id.email}</div>
            <div className="flex items-center"><Phone className="h-4 w-4 mr-2" /> {booking.client_id.phone}</div>
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-white rounded-xl shadow-sm border p-6 space-y-3">
          <h3 className="text-lg font-semibold">Pricing Details</h3>
          <div className="flex justify-between text-gray-600">
            <span>Service Price</span>
            <span className="font-medium">${booking.booking_service_price}</span>
          </div>
          {booking.negotiated_price && (
            <div className="flex justify-between text-green-600">
              <span>Negotiated Price</span>
              <span className="font-medium">${booking.negotiated_price}</span>
            </div>
          )}
          <div className="border-t pt-3 flex justify-between text-lg font-bold">
            <span>Final Price</span>
            <span>${booking.final_price}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-4 justify-end">
          {canNegotiate(booking) && (
            <button onClick={() => onNegotiate(booking)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
              <DollarSign className="h-4 w-4 mr-2" /> Negotiate Price
            </button>
          )}
          <button className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
            <MessageSquare className="h-4 w-4 mr-2" /> Chat with Technician
          </button>
          {canCancel(booking) && (
            <button className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">
              <X className="h-4 w-4 mr-2" /> Cancel Booking
            </button>
          )}
        </div>

      </div>
    </div>
  )
}

export default BookingDetailsView
