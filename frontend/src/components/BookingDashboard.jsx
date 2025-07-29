import React, { useEffect, useState } from "react"
import { Calendar } from "lucide-react"

import BookingCard from "./BookingCard"
import BookingDetailsView from "./BookingDetailsView"
import FilterBar from "./FilterBar"
import Pagination from "./Pagination"
import NegotiationModal from "./NegotiationModal"
import { bookingService } from "../api/bookingService"

const BookingDashboard = () => {
  const [bookings, setBookings] = useState([])
  const [filteredBookings, setFilteredBookings] = useState([])

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
    )
  }

  // Main dashboard layout
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
          <p className="text-gray-600">
            Manage your service bookings and track their progress
          </p>
        </div>

        {/* Filters */}
        <FilterBar filters={filters} setFilters={setFilters} />

        {/* Booking List */}
        {loading ? (
          <div className="text-center py-10 text-gray-500">Loading bookings...</div>
        ) : error ? (
          <div className="text-center py-10 text-red-500">Error: {error}</div>
        ) : currentBookings.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
            <p className="text-gray-600">
              You haven't made any bookings yet or no results match your filters.
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {currentBookings.map((booking) => (
                <BookingCard
                  key={booking._id}
                  booking={booking}
                  onViewDetails={handleViewDetails}
                  onNegotiate={handleNegotiation}
                  canNegotiate={canNegotiate}
                />
              ))}
            </div>

            {/* Pagination */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              totalItems={filteredBookings.length}
              itemsPerPage={bookingsPerPage}
            />
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
    </div>
  )
}

export default BookingDashboard
