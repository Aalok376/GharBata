import React, { useEffect, useState } from "react";
import { Calendar, Plus, Search, Filter, TrendingUp, Clock, CheckCircle, XCircle, Loader, Sparkles } from "lucide-react";

import BookingCard from "./BookingCard"
import BookingDetailsView from "./BookingDetailsView"
import FilterBar from "./FilterBar"
import Pagination from "./Pagination"
import NegotiationModal from "./NegotiationModal"
import { bookingService } from "../api/bookingService"

const BookingDashboard = () => {
  const [bookings, setBookings] = useState([]);

  const [filteredBookings, setFilteredBookings] = useState([]);

  const [selectedBooking, setSelectedBooking] = useState(null)
  const [showDetails, setShowDetails] = useState(false)

  const [filters, setFilters] = useState({
    status: "",
    search: "",
    date: "",
  })

  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [showNegotiationModal, setShowNegotiationModal] = useState(false)
  const [negotiationPrice, setNegotiationPrice] = useState("")

  const bookingsPerPage = 5

  // Fetch bookings from backend
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true)
        const params = {
          status: filters.status || undefined,
          page: currentPage,
          limit: bookingsPerPage,
        }
        const response = await bookingService.getClientBookings(params)
        const dataBookings = response.bookings || []
        const total = response.pagination?.totalBookings || 0

        setBookings(dataBookings)
        setTotalPages(Math.ceil(total / bookingsPerPage))
        setError(null)
      } catch (error) {
        setError(error.message || "Failed to fetch bookings")
      } finally {
        setLoading(false)
      }
    }
    fetchBookings()
  }, [filters.status, currentPage])

  // Filter bookings whenever filters or bookings change
  useEffect(() => {
    let filtered = bookings

    if (filters.status) {
      filtered = filtered.filter(
        (booking) => booking.booking_status === filters.status
      )
    }

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase()
      filtered = filtered.filter((booking) => {
        return (
          (booking._id &&
            booking._id.toString().toLowerCase().includes(searchTerm)) ||
          (booking.technician_id?.name
            ?.toLowerCase()
            .includes(searchTerm)) ||
          (booking.service?.toLowerCase().includes(searchTerm))
        )
      })
    }

    if (filters.date) {
      filtered = filtered.filter(
        (booking) =>
          new Date(booking.scheduled_date).toISOString().slice(0, 10) ===
          filters.date
      )
    }

    setFilteredBookings(filtered)
  }, [filters.search, filters.date, filters.status, bookings])

  // Pagination variables
  const indexOfLastBooking = currentPage * bookingsPerPage
  const indexOfFirstBooking = indexOfLastBooking - bookingsPerPage
  const currentBookings = filteredBookings.slice(
    indexOfFirstBooking,
    indexOfLastBooking
  )

  // Open booking details
  const handleViewDetails = (booking) => {
    setSelectedBooking(booking)
    setShowDetails(true)
  }

  // Open negotiation modal
  const handleNegotiation = (booking) => {
    setSelectedBooking(booking)
    setNegotiationPrice(booking.final_price.toString())
    setShowNegotiationModal(true)
  }

  // Submit negotiation (placeholder for API call)
  const submitNegotiation = () => {
    console.log(
      "Negotiating price:",
      negotiationPrice,
      "for booking:",
      selectedBooking._id
    )
    setShowNegotiationModal(false)
    setNegotiationPrice("")
  }

  // Can negotiate if booking is confirmed
  const canNegotiate = (booking) => {
    return booking.booking_status === "confirmed"
  }

  // Can cancel if >24hrs before scheduled time and not cancelled/completed
  const canCancel = (booking) => {
    const scheduledDateTime = new Date(
      `${booking.scheduled_date}T${booking.scheduled_time}`
    )
    const now = new Date()
    const hoursDiff = (scheduledDateTime - now) / (1000 * 60 * 60)
    return (
      hoursDiff > 24 && !["cancelled", "completed"].includes(booking.booking_status)
    )
  }

  // Show details view if selected
  if (showDetails && selectedBooking) {
    return (
      <BookingDetailsView
        booking={selectedBooking}
        onBack={() => setShowDetails(false)}
        onNegotiate={handleNegotiation}
        canNegotiate={canNegotiate}
        canCancel={canCancel}
      />
    );
  }

  const getStatusStats = () => {
    const stats = bookings.reduce((acc, booking) => {
      acc[booking.booking_status] = (acc[booking.booking_status] || 0) + 1;
      return acc;
    }, {});
    
    return [
      { label: 'Total', value: bookings.length, icon: Calendar, color: 'from-blue-500 to-blue-600' },
      { label: 'Pending', value: stats.pending || 0, icon: Clock, color: 'from-amber-500 to-orange-500' },
      { label: 'Confirmed', value: stats.confirmed || 0, icon: CheckCircle, color: 'from-green-500 to-emerald-500' },
      { label: 'Completed', value: stats.completed || 0, icon: Sparkles, color: 'from-purple-500 to-pink-500' }
    ];
  };

  const handleCancel = (bookingId) => {
    console.log('Canceling booking:', bookingId);
    // Add your cancel booking API call here
  };

  const stats = getStatusStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-pink-400/20 to-rose-400/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      <div className="relative max-w-7xl mx-auto p-6">
        {/* Modern Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-2">
                My Bookings
              </h1>
              <p className="text-gray-600 text-lg">
                Manage your service bookings with style ✨
              </p>
            </div>
            <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
              <Plus className="w-5 h-5" />
              New Booking
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="group relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 border border-white/50 overflow-hidden transform hover:-translate-y-1">
                  <div className={`absolute inset-0 bg-gradient-to-r ${stat.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
                  <div className="relative">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-2xl flex items-center justify-center shadow-lg`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                        <p className="text-sm text-gray-600 font-medium">{stat.label}</p>
                      </div>
                    </div>
                    <div className={`h-2 bg-gradient-to-r ${stat.color} rounded-full opacity-20`}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Enhanced Filters */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50 mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Filter className="w-5 h-5 text-gray-400" />
            <span className="font-semibold text-gray-700">Filter & Search</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <select 
                value={filters.status} 
                onChange={(e) => setFilters({...filters, status: e.target.value})}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 font-medium"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search technician, service..."
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 font-medium"
              />
            </div>
            
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="date"
                value={filters.date}
                onChange={(e) => setFilters({...filters, date: e.target.value})}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 font-medium"
              />
            </div>
          </div>
        </div>

        {/* Booking List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
              <p className="text-gray-600 font-medium">Loading your bookings...</p>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-10 text-red-500">Error: {error}</div>
        ) : currentBookings.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-12 text-center">
            <div className="w-24 h-24 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Calendar className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">No bookings found</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              You haven't made any bookings yet or no results match your filters. Start by creating your first booking!
            </p>
            <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg">
              Create First Booking
            </button>
          </div>
        ) : (
          <>
            <div className="space-y-6">
              {currentBookings.map((booking, index) => (
                <div 
                  key={booking._id} 
                  className="animate-fade-in"
                  style={{animationDelay: `${index * 100}ms`}}
                >
                  <BookingCard
                    key={booking._id}
                    booking={booking}
                    onViewDetails={handleViewDetails}
                    onNegotiate={handleNegotiation}
                    canNegotiate={canNegotiate}
                    onCancel={handleCancel}
                  />
                </div>
              ))}
            </div>

            {/* Enhanced Filters - using custom filter bar styling */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50 mb-8">
              <div className="flex items-center gap-4 mb-4">
                <Filter className="w-5 h-5 text-gray-400" />
                <span className="font-semibold text-gray-700">Filter & Search</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                  <select 
                    value={filters.status} 
                    onChange={(e) => setFilters({...filters, status: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 font-medium"
                  >
                    <option value="">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search technician, service..."
                    value={filters.search}
                    onChange={(e) => setFilters({...filters, search: e.target.value})}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 font-medium"
                  />
                </div>
                
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="date"
                    value={filters.date}
                    onChange={(e) => setFilters({...filters, date: e.target.value})}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Enhanced Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center mt-12 gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-white/80 backdrop-blur-sm text-gray-700 rounded-xl font-medium hover:bg-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed border border-white/50"
                >
                  Previous
                </button>
                
                {Array.from({length: totalPages}, (_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                      currentPage === i + 1
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                        : 'bg-white/80 backdrop-blur-sm text-gray-700 hover:bg-white border border-white/50'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-white/80 backdrop-blur-sm text-gray-700 rounded-xl font-medium hover:bg-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed border border-white/50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}

        {/* Negotiation Modal */}
        {showNegotiationModal && (
          <NegotiationModal
            booking={selectedBooking}
            negotiationPrice={negotiationPrice}
            setNegotiationPrice={setNegotiationPrice}
            onSubmit={submitNegotiation}
            onClose={() => setShowNegotiationModal(false)}
          />
        )}
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
};
export default BookingDashboard;