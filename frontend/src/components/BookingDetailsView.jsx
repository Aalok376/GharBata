import React from "react";
import {
  Calendar,
  Clock,
  MapPin,
  Mail,
  Phone,
  DollarSign,
  ChevronLeft,
  X,
  MessageSquare,
} from "lucide-react";
import {
  getStatusColor,
  getStatusIcon,
  formatDate,
  formatTime,
} from "../utils/helpers.jsx";

const BookingDetailsView = ({
  booking,
  onBack,
  onNegotiate,
  onCancel,
  canNegotiate,
  canCancel,
}) => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-6 space-y-8">
        {/* Header */}
        <div>
          <button
            onClick={onBack}
            className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            <ChevronLeft className="h-5 w-5 mr-1" />
            Back to Bookings
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">
            Booking Details
          </h1>
          <p className="text-gray-600">
            Booking ID:{" "}
            <span className="font-medium">
              #{booking._id || booking.booking_id || "N/A"}
            </span>
          </p>
        </div>

        {/* Status & Schedule */}
        <div className="bg-white rounded-xl shadow-sm border p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {getStatusIcon(booking.booking_status)}
              <span
                className={`ml-2 px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(
                  booking.booking_status
                )}`}
              >
                {booking.booking_status
                  ? booking.booking_status.charAt(0).toUpperCase() +
                    booking.booking_status.slice(1).replace(/_/g, " ")
                  : "Unknown"}
              </span>
            </div>
            <div className="text-sm text-gray-500">
              Created:{" "}
              {booking.created_at
                ? new Date(booking.created_at).toLocaleDateString()
                : "N/A"}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-3">Schedule</h3>
              <div className="space-y-2 text-gray-700 text-sm">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  {formatDate(booking.scheduled_date)}
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2" />
                  {formatTime(booking.scheduled_time)}
                </div>
                <div className="flex items-start">
                  <MapPin className="h-4 w-4 mr-2 mt-1" />
                  {booking.streetAddress || "No address"}
                  {booking.apartMent ? `, ${booking.apartMent}` : ""}
                  {booking.cityAddress ? `, ${booking.cityAddress}` : ""}
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Service</h3>
              <p className="font-medium text-gray-900">{booking.service || "N/A"}</p>
            </div>
          </div>
        </div>

        {/* Technician Info */}
        <div className="bg-white rounded-xl shadow-sm border p-6 space-y-4">
          <h3 className="text-lg font-semibold">Technician Information</h3>
          <div className="space-y-1 text-gray-700 text-sm">
            <p>
              <span className="font-medium">Name: </span>
              {booking.fname || "N/A"} {booking.lname || ""}
            </p>
            <p>
              <span className="font-medium">Email: </span>
              {booking.email || "N/A"}
            </p>
            <p>
              <span className="font-medium">Phone: </span>
              {booking.phoneNumber || "N/A"}
            </p>
          </div>
        </div>

        {/* Emergency Contact Info */}
        {(booking.emergencyContactName || booking.emergencyContactPhone) && (
          <div className="bg-white rounded-xl shadow-sm border p-6 space-y-4">
            <h3 className="text-lg font-semibold">Emergency Contact</h3>
            <div className="space-y-1 text-gray-700 text-sm">
              {booking.emergencyContactName && (
                <p>
                  <span className="font-medium">Name: </span>
                  {booking.emergencyContactName}
                </p>
              )}
              {booking.emergencyContactPhone && (
                <p>
                  <span className="font-medium">Phone: </span>
                  {booking.emergencyContactPhone}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Pricing */}
        <div className="bg-white rounded-xl shadow-sm border p-6 space-y-3">
          <h3 className="text-lg font-semibold">Pricing Details</h3>
          <div className="flex justify-between text-gray-600">
            <span>Final Price</span>
            <span className="font-medium">
              NPR {booking.final_price !== undefined ? booking.final_price : "N/A"}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-4 justify-end">
          {canNegotiate(booking) && (
            <button
              onClick={() => onNegotiate(booking)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <DollarSign className="h-4 w-4 mr-2" />
              Negotiate Price
            </button>
          )}

          <button className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
            <MessageSquare className="h-4 w-4 mr-2" />
            Chat with Technician
          </button>

          {canCancel(booking) && (
            <button
              onClick={() => onCancel(booking._id)}
              className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel Booking
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingDetailsView;
