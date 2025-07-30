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
  User,
  Star,
  Award,
  Shield,
  AlertCircle,
  CheckCircle,
  Timer,
  Zap,
  Sparkles
} from "lucide-react";


const BookingDetailsView = ({
  booking,
  onBack,
  onNegotiate,
  onCancel,
  canNegotiate,
  canCancel,
}) => {
 // Helper functions
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    return timeString;
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: <Timer className="w-5 h-5" />,
      confirmed: <CheckCircle className="w-5 h-5" />,
      in_progress: <Zap className="w-5 h-5" />,
      completed: <Sparkles className="w-5 h-5" />,
      cancelled: <X className="w-5 h-5" />,
      rescheduled: <Calendar className="w-5 h-5" />
    };
    return icons[status] || <AlertCircle className="w-5 h-5" />;
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-amber-100 text-amber-800 border-amber-200',
      confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
      in_progress: 'bg-purple-100 text-purple-800 border-purple-200',
      completed: 'bg-green-100 text-green-800 border-green-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200',
      rescheduled: 'bg-indigo-100 text-indigo-800 border-indigo-200'
    };
    return colors[status] || colors.pending;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-pink-400/10 to-rose-400/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-emerald-400/5 to-cyan-400/5 rounded-full blur-3xl animate-pulse" style={{animationDelay: '4s'}}></div>
      </div>

      <div className="relative max-w-6xl mx-auto px-6 py-8 space-y-8">
        {/* Header */}
        <div className="animate-fade-in">
          <button
            onClick={onBack}
            className="group flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6 px-4 py-2 rounded-xl hover:bg-white/50 transition-all duration-300 font-medium"
          >
            <ChevronLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
            Back to Bookings
          </button>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-2">
                  Booking Details
                </h1>
                <p className="text-gray-600 flex items-center gap-2">
                  <span className="px-3 py-1 bg-gray-100 rounded-full text-sm font-mono">
                    #{booking._id?.slice(-8) || booking.booking_id || "N/A"}
                  </span>
                  <span className="text-sm">
                    Created: {booking.created_at ? new Date(booking.created_at).toLocaleDateString() : "N/A"}
                  </span>
                </p>
              </div>
              
              <div className={`flex items-center gap-2 px-6 py-3 rounded-2xl border font-semibold ${getStatusColor(booking.booking_status)}`}>
                {getStatusIcon(booking.booking_status)}
                <span>
                  {booking.booking_status
                    ? booking.booking_status.charAt(0).toUpperCase() + booking.booking_status.slice(1).replace(/_/g, " ")
                    : "Unknown"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Schedule & Location */}
          <div className="lg:col-span-2 space-y-6">
            {/* Schedule & Service */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-8 animate-fade-in" style={{animationDelay: '200ms'}}>
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                Schedule & Service
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl border border-blue-100">
                    <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 font-medium">Date</p>
                      <p className="font-bold text-gray-900">{formatDate(booking.scheduled_date)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-100">
                    <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center">
                      <Clock className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 font-medium">Time</p>
                      <p className="font-bold text-gray-900">{formatTime(booking.scheduled_time)}</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-2xl border border-emerald-100">
                    <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center">
                      <Award className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 font-medium">Service</p>
                      <p className="font-bold text-gray-900">{booking.service || "N/A"}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl border border-orange-100">
                    <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center">
                      <MapPin className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 font-medium">Location</p>
                      <p className="font-bold text-gray-900 text-sm">
                        {booking.streetAddress || "No address"}
                        {booking.apartMent ? `, ${booking.apartMent}` : ""}
                        {booking.cityAddress ? `, ${booking.cityAddress}` : ""}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Technician Information */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-8 animate-fade-in" style={{animationDelay: '400ms'}}>
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                Technician Information
              </h3>
              
              <div className="flex items-center gap-6 p-6 bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                  {(booking.fname || booking.technician_id?.name || 'T')[0].toUpperCase()}
                </div>
                <div className="flex-1">
                  <h4 className="text-xl font-bold text-gray-900 mb-1">
                    {booking.fname || "N/A"} {booking.lname || ""}
                  </h4>
                  <p className="text-blue-600 font-medium mb-3">{booking.technician_id?.profession || "Professional"}</p>
                  <div className="flex items-center gap-1 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                    <span className="text-sm text-gray-600 ml-2">4.9 (127 reviews)</span>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-700">{booking.email || "N/A"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-700">{booking.phoneNumber || "N/A"}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Emergency Contact */}
            {(booking.emergencyContactName || booking.emergencyContactPhone) && (
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-8 animate-fade-in" style={{animationDelay: '600ms'}}>
                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl flex items-center justify-center">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  Emergency Contact
                </h3>
                
                <div className="p-6 bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl border border-orange-200">
                  <div className="space-y-2">
                    {booking.emergencyContactName && (
                      <div className="flex items-center gap-3">
                        <User className="w-5 h-5 text-orange-600" />
                        <span className="font-semibold text-gray-900">{booking.emergencyContactName}</span>
                      </div>
                    )}
                    {booking.emergencyContactPhone && (
                      <div className="flex items-center gap-3">
                        <Phone className="w-5 h-5 text-orange-600" />
                        <span className="text-gray-700">{booking.emergencyContactPhone}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Pricing & Actions */}
          <div className="space-y-6">
            {/* Pricing */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-8 animate-fade-in" style={{animationDelay: '800ms'}}>
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-white" />
                </div>
                Pricing
              </h3>
              
              <div className="p-6 bg-gradient-to-r from-emerald-50 to-green-50 rounded-2xl border border-emerald-200">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">Final Price</p>
                  <p className="text-4xl font-bold text-emerald-600">
                    NPR {booking.final_price !== undefined ? booking.final_price.toLocaleString() : "N/A"}
                  </p>
                  <p className="text-sm text-gray-500 mt-2">All inclusive</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-8 animate-fade-in" style={{animationDelay: '1000ms'}}>
              <h3 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h3>
              
              <div className="space-y-4">
                {canNegotiate && canNegotiate(booking) && (
                  <button
                    onClick={() => onNegotiate(booking)}
                    className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    <DollarSign className="w-5 h-5" />
                    Negotiate Price
                  </button>
                )}

                <button className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-2xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
                  <MessageSquare className="w-5 h-5" />
                  Chat with Technician
                </button>

                {canCancel && canCancel(booking) && (
                  <button
                    onClick={() => onCancel(booking._id)}
                    className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-2xl font-semibold hover:from-red-700 hover:to-rose-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    <X className="w-5 h-5" />
                    Cancel Booking
                  </button>
                )}
              </div>
            </div>

            {/* Quick Info */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-8 animate-fade-in" style={{animationDelay: '1200ms'}}>
              <h3 className="text-xl font-bold text-gray-900 mb-6">Need Help?</h3>
              
              <div className="space-y-4 text-sm">
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
                  <Phone className="w-4 h-4 text-blue-600" />
                  <span className="text-gray-700">Support: +977-1-4567890</span>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl">
                  <MessageSquare className="w-4 h-4 text-green-600" />
                  <span className="text-gray-700">Live Chat Available</span>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-xl">
                  <Mail className="w-4 h-4 text-purple-600" />
                  <span className="text-gray-700">help@servicepro.com</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }
      `}</style>
      </div>
  );
}
export default BookingDetailsView;
    