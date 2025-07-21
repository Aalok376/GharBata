import React, { useEffect, useState } from "react"
import { Calendar } from 'lucide-react'

import { mockBookings } from "../data/mockData"
import BookingCard from "./BookingCard"
import BookingDetailsView from './BookingDetailsView'
import FilterBar from './FilterBar'
import Pagination from "./Pagination"
import NegotiationModal from "./NegotiationModal"

const BookingDashboard = () => {
    const [bookings, setBookings] = useState(mockBookings)
    const [filteredBookings, setFilteredBookings] = useState(mockBookings)

    const [selectedBooking, setSelectedBooking] = useState(null)
    const [showDetails, setShowDetails] = useState(false)

    const [filters, setFilters] = useState({
        status: '',
        search: '',
        date: ''
    })

    const [currentPage, setCurrentPage] = useState(1)
    const [showNegotiationModal, setShowNegotiationModal] = useState(false)
    const [negotiationPrice, setNegotiationPrice] = useState('')

    const bookingsPerPage = 5

    // Filter bookings whenever filters or bookings change
    useEffect(() => {
        let filtered = bookings

        if (filters.status) {
            filtered = filtered.filter(booking => booking.booking_status === filters.status)
        }

        if (filters.search) {
            filtered = filtered.filter(booking =>
                booking.booking_id.toLowerCase().includes(filters.search.toLowerCase()) ||
                booking.technician_id.name.toLowerCase().includes(filters.search.toLowerCase()) ||
                booking.service_id.name.toLowerCase().includes(filters.search.toLowerCase())
            )
        }

        if (filters.date) {
            filtered = filtered.filter(booking => booking.scheduled_date === filters.date)
        }

        setFilteredBookings(filtered)
        setCurrentPage(1)
    }, [filters, bookings])

    // Pagination
    const indexOfLastBooking = currentPage * bookingsPerPage
    const indexOfFirstBooking = indexOfLastBooking - bookingsPerPage
    const currentBookings = filteredBookings.slice(indexOfFirstBooking, indexOfLastBooking)
    const totalPages = Math.ceil(filteredBookings.length / bookingsPerPage)

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

    // Submit negotiation (replace console with actual API call)
    const submitNegotiation = () => {
        console.log('Negotiating price:', negotiationPrice, 'for booking:', selectedBooking.booking_id)
        setShowNegotiationModal(false)
        setNegotiationPrice('')
    }

    // Can negotiate if booking is confirmed
    const canNegotiate = (booking) => {
        return booking.booking_status === 'confirmed'
    }

    // Can cancel if >24hrs before scheduled time and not cancelled/completed
    const canCancel = (booking) => {
        const scheduledDateTime = new Date(`${booking.scheduled_date}T${booking.scheduled_time}`)
        const now = new Date()
        const hoursDiff = (scheduledDateTime - now) / (1000 * 60 * 60)
        return hoursDiff > 24 && !['cancelled', 'completed'].includes(booking.booking_status)
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
                    <p className="text-gray-600">Manage your service bookings and track their progress</p>
                </div>

                {/* Filters */}
                <FilterBar filters={filters} setFilters={setFilters} />

                {/* Booking List */}
                <div className="space-y-4">
                    {currentBookings.length === 0 ? (
                        <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
                            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
                            <p className="text-gray-600">You haven't made any bookings yet or no results match your filters.</p>
                        </div>
                    ) : (
                        currentBookings.map((booking) => (
                            <BookingCard
                                key={booking._id}
                                booking={booking}
                                onViewDetails={handleViewDetails}
                                onNegotiate={handleNegotiation}
                                canNegotiate={canNegotiate}
                            />
                        ))
                    )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                        totalItems={filteredBookings.length}
                        itemsPerPage={bookingsPerPage}
                    />
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
