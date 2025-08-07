import React, { useState, useEffect } from 'react'
import { Calendar, Clock, User, Phone, Mail, MapPin, XCircle, Star, MessageSquare, Navigation, Filter, ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'

const ClientBookingDashboard = () => {
  const { clientId } = useParams()

  const navigate = useNavigate()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState('')
  const [filters, setFilters] = useState({
    status: '',
    client_id: clientId,
    date_from: '',
    date_to: ''
  })
  const [pagination, setPagination] = useState({
    current_page: 1,
    total_pages: 1,
    total_bookings: 0
  })
  const [formData, setFormData] = useState({})

  const API_BASE = 'http://localhost:5000/api/bookings'

  const fetchBookings = async (page = 1) => {
    setLoading(true)
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v))
      })

      const response = await fetch(`${API_BASE}?${queryParams}`, {
        method: 'GET',
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      // DEBUG: Log the raw booking data to see what fields are available
      console.log('Raw booking data from API:', data.bookings)

      // DEBUG: Check specific booking fields
      if (data.bookings && data.bookings.length > 0) {
        data.bookings.forEach((booking, index) => {
          console.log(`Booking ${index}:`, {
            id: booking._id,
            status: booking.booking_status,
            cancelled_by: booking.cancelled_by,
            cancelled_by_type: typeof booking.cancelled_by,
            status_history: booking.status_history,
            previous_status: booking.previous_status,
            // Log all keys to see what's available
            all_keys: Object.keys(booking)
          })
        })
      }

      setBookings(data.bookings || [])
      setPagination(data.pagination || {})
    } catch (error) {
      console.error('Error fetching bookings:', error)
      alert('Error fetching bookings. Please try again.')
    }
    setLoading(false)
  }

  useEffect(() => {
    if (clientId) {
      fetchBookings()
    }
  }, [filters, clientId])

  const handleCancelBooking = async (bookingId, data = {}) => {
    try {
      const response = await fetch(`${API_BASE}/${bookingId}/cancel`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          cancelled_by: clientId,
          cancellation_reason: data.cancellation_reason
        })
      })

      if (response.ok) {
        await fetchBookings(pagination.current_page)
        setShowModal(false)
        setSelectedBooking(null)
        alert('Booking cancelled successfully')
      } else {
        const errorData = await response.json()
        alert(errorData.error || 'An error occurred')
      }
    } catch (error) {
      console.error('Error cancelling booking:', error)
      alert('An error occurred while cancelling the booking')
    }
  }

  const handleSubmitFeedback = async (bookingId, data) => {
    if (!data.rating) {
      alert('Please provide a rating before submitting')
      return
    }

    try {
      const response = await fetch(`${API_BASE}/${bookingId}/feedback`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          rating: parseInt(data.rating),
          feedback: data.feedback || ''
        })
      })

      if (response.ok) {
        await fetchBookings(pagination.current_page)
        setShowModal(false)
        setSelectedBooking(null)
        alert('Feedback submitted successfully')
      } else {
        const errorData = await response.json()
        alert(errorData.error || 'An error occurred')
      }
    } catch (error) {
      console.error('Error submitting feedback:', error)
      alert('An error occurred while submitting feedback')
    }
  }

  const handleRaiseIssue = async (bookingId, data) => {
    if (!data.issue_type || !data.issue_description?.trim()) {
      alert('Please fill in all required fields')
      return
    }

    try {
      const response = await fetch(`${API_BASE}/${bookingId}/raise-issue`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          issue_type: data.issue_type,
          issue_description: data.issue_description.trim(),
          severity: data.severity || 'medium'
        })
      })

      if (response.ok) {
        await fetchBookings(pagination.current_page)
        setShowModal(false)
        setSelectedBooking(null)
        alert('Issue reported successfully. Our team will review it shortly.')
      } else {
        const errorData = await response.json()
        alert(errorData.error || 'An error occurred while reporting the issue')
      }
    } catch (error) {
      console.error('Error raising issue:', error)
      alert('An error occurred while reporting the issue')
    }
  }

  const openModal = (type, booking = null) => {
    setModalType(type)
    setSelectedBooking(booking)
    setShowModal(true)
    // Reset form data appropriately
    if (type === 'rate') {
      setFormData({ rating: 0, feedback: '' })
    } else if (type === 'issue') {
      setFormData({ issue_type: '', issue_description: '', severity: 'medium' })
    } else if (type === 'cancel') {
      setFormData({ cancellation_reason: '' })
    } else {
      setFormData(booking || {})
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-purple-100 text-purple-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      rescheduled: 'bg-orange-100 text-orange-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const canCancelBooking = (booking) => {
    const status = booking.booking_status

    if (status === 'cancelled' || status === 'completed') {
      return false
    }

    if (status === 'pending' || status === 'confirmed') {
      // Check if booking is more than 24 hours away
      const scheduledDateTime = new Date(booking.scheduled_date)
      const now = new Date()
      const timeDiff = scheduledDateTime.getTime() - now.getTime()
      const hoursDiff = timeDiff / (1000 * 3600)

      return hoursDiff > 24 // Can cancel if more than 24 hours away
    }

    return false
  }

  const canRateBooking = (booking) => {
    return booking.booking_status === 'completed' && !booking.rating
  }

  const hasRating = (booking) => {
    return booking.rating && booking.rating > 0
  }


  const canRaiseIssue = (booking) => {
    // Only for cancelled bookings
    if (booking.booking_status !== 'cancelled') {
      return false
    }

    // Check if an issue has already been reported for this booking
    if (booking.issues && booking.issues.length > 0) {
      return false // Already has issues reported
    }

    // Check if booking was previously confirmed (accepted by technician)
    const wasConfirmed = booking.status_history &&
      Array.isArray(booking.status_history) &&
      booking.status_history.some(entry => entry.status === 'confirmed')

    const hadConfirmedStatus = booking.previous_status === 'confirmed'

    // If booking was never confirmed, client cannot raise issue
    if (!wasConfirmed && !hadConfirmedStatus) {
      return false
    }

    // Handle populated cancelled_by field (from .populate('cancelled_by', '-password'))
    let cancelledById = null

    if (booking.cancelled_by) {
      // Handle populated user object structure
      if (typeof booking.cancelled_by === 'object' && booking.cancelled_by._id) {
        cancelledById = booking.cancelled_by._id.toString()
      } else if (typeof booking.cancelled_by === 'string') {
        // Handle direct ID (fallback)
        cancelledById = booking.cancelled_by.toString()
      }
    }

    const currentClientId = clientId?.toString()

    // If cancelled_by is populated and it's the current client, don't allow issue reporting
    if (cancelledById && currentClientId && cancelledById === currentClientId) {
      return false
    }

    // Key fix: If cancelled_by is null (population failed or not set) but booking was confirmed,
    // allow issue reporting since it indicates technician/system cancellation
    if (!cancelledById && (wasConfirmed || hadConfirmedStatus)) {
      return true
    }

    // If cancelled by someone else (technician), allow issue reporting
    if (cancelledById && currentClientId && cancelledById !== currentClientId) {
      return true
    }

    return false
  }

  const hasIssues = (booking) => {
    return booking.issues && booking.issues.length > 0
  }

  const hasPendingIssues = (booking) => {
    return booking.issues && booking.issues.some(issue => issue.status === 'pending')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-gray-900">My Bookings</h1>
            <div className="text-sm text-gray-500">
              Total Bookings: {pagination.total_bookings || 0}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="rescheduled">Rescheduled</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date From</label>
              <input
                type="date"
                value={filters.date_from}
                onChange={(e) => setFilters({ ...filters, date_from: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date To</label>
              <input
                type="date"
                value={filters.date_to}
                onChange={(e) => setFilters({ ...filters, date_to: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={() => setFilters({
                  status: '',
                  client_id: clientId,
                  date_from: '',
                  date_to: ''
                })}
                className="w-full px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Bookings List */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Your Bookings ({pagination.total_bookings || 0})
            </h2>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-500">Loading bookings...</p>
            </div>
          ) : bookings.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500">No bookings found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Technician</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Schedule</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {bookings.map((booking) => {
                    // DEBUG: Log each booking as it's being rendered
                    console.log('Rendering booking:', booking._id, {
                      cancelled_by: booking.cancelled_by,
                      status: booking.booking_status,
                      canRaise: canRaiseIssue(booking)
                    })

                    return (
                      <tr key={booking._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{booking.service}</div>
                          {hasIssues(booking) && (
                            <div className="flex items-center mt-1">
                              <AlertTriangle className="h-3 w-3 text-orange-500 mr-1" />
                              <span className="text-xs text-orange-600">
                                {hasPendingIssues(booking) ? 'Issue Reported' : 'Issue Resolved'}
                              </span>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-8 w-8">
                              <div
                                className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center cursor-pointer"
                                onClick={() => {
                                  if (booking?.technician_id?.user?._id) {
                                    navigate(`/professionalProfilePage/${booking.technician_id.user._id}`)
                                  }
                                }}
                              >
                                {booking.technician_id?.profilePic ? (
                                  <img
                                    src={booking.technician_id.profilePic}
                                    className="h-8 w-8 rounded-full object-cover"
                                    alt="Profile"
                                  />
                                ) : (
                                  <User className="h-5 w-5 text-gray-600" />
                                )}
                              </div>
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900">
                                {booking.technician_id?.user?.fname} {booking.technician_id?.user?.lname}
                              </div>
                              <div className="text-sm text-gray-500">{booking.technician_id?.user?.username}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-500">
                            <Calendar className="h-4 w-4 mr-1" />
                            {new Date(booking.scheduled_date).toLocaleDateString()}
                          </div>
                          <div className="flex items-center text-sm text-gray-500">
                            <Clock className="h-4 w-4 mr-1" />
                            {booking.scheduled_StartTime}-{booking.scheduled_EndTime}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(booking.booking_status)}`}>
                            {booking.booking_status.replace('_', ' ').toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          Rs.{booking.final_price}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {hasRating(booking) ? (
                            <div className="flex items-center">
                              <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-4 w-4 ${i < booking.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                                  />
                                ))}
                              </div>
                              <span className="ml-1 text-sm text-gray-600">({booking.rating})</span>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">Not rated</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex flex-wrap gap-2">
                            <button
                              onClick={() => openModal('view', booking)}
                              className="text-blue-600 hover:text-blue-900 hover:bg-blue-50 px-3 py-1 rounded-lg transition-colors"
                            >
                              View Details
                            </button>
                            {canCancelBooking(booking) && (
                              <button
                                onClick={() => openModal('cancel', booking)}
                                className="text-red-600 hover:text-red-900 hover:bg-red-50 px-3 py-1 rounded-lg transition-colors"
                              >
                                Cancel
                              </button>
                            )}
                            {canRateBooking(booking) && (
                              <button
                                onClick={() => openModal('rate', booking)}
                                className="text-yellow-600 hover:text-yellow-900 hover:bg-yellow-50 px-3 py-1 rounded-lg transition-colors"
                              >
                                Rate Service
                              </button>
                            )}
                            {canRaiseIssue(booking) && (
                              <button
                                onClick={() => openModal('issue', booking)}
                                className="text-orange-600 hover:text-orange-900 hover:bg-orange-50 px-3 py-1 rounded-lg transition-colors flex items-center"
                              >
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                Raise Issue
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {pagination.total_pages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => fetchBookings(pagination.current_page - 1)}
                  disabled={pagination.current_page <= 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => fetchBookings(pagination.current_page + 1)}
                  disabled={pagination.current_page >= pagination.total_pages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing page <span className="font-medium">{pagination.current_page}</span> of{' '}
                    <span className="font-medium">{pagination.total_pages}</span> ({pagination.total_bookings} total bookings)
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() => fetchBookings(pagination.current_page - 1)}
                      disabled={pagination.current_page <= 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => fetchBookings(pagination.current_page + 1)}
                      disabled={pagination.current_page >= pagination.total_pages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && selectedBooking && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white max-h-[80vh] overflow-y-auto">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {modalType === 'view' && 'Booking Details'}
                  {modalType === 'cancel' && 'Cancel Booking'}
                  {modalType === 'rate' && 'Rate & Review Service'}
                  {modalType === 'issue' && 'Report Issue'}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              {modalType === 'view' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Service Information</h4>
                      <div className="space-y-2 text-sm">
                        <p><span className="font-medium">Service:</span> {selectedBooking.service}</p>
                        <p><span className="font-medium">Date:</span> {new Date(selectedBooking.scheduled_date).toLocaleDateString()}</p>
                        <p><span className="font-medium">Time:</span> {selectedBooking.scheduled_StartTime}-{selectedBooking.scheduled_EndTime}</p>
                        <p><span className="font-medium">Price:</span> Rs.{selectedBooking.final_price}</p>
                        <p><span className="font-medium">Status:</span>
                          <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedBooking.booking_status)}`}>
                            {selectedBooking.booking_status.replace('_', ' ').toUpperCase()}
                          </span>
                        </p>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Technician Information</h4>
                      <div className="space-y-2 text-sm">
                        <p><span className="font-medium">Name:</span> {selectedBooking.technician_id?.user?.fname} {selectedBooking.technician_id?.user?.lname}</p>
                        <p><span className="font-medium">Email:</span> {selectedBooking.technician_id?.user?.username}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Service Address</h4>
                    <p className="text-sm">
                      {selectedBooking.streetAddress}
                      {selectedBooking.apartMent && `, ${selectedBooking.apartMent}`}
                      <br />
                      {selectedBooking.cityAddress}
                    </p>
                  </div>

                  {selectedBooking.specialInstructions && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Special Instructions</h4>
                      <p className="text-sm text-gray-600">{selectedBooking.specialInstructions}</p>
                    </div>
                  )}

                  {selectedBooking.completion_notes && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Service Notes</h4>
                      <p className="text-sm text-gray-600">{selectedBooking.completion_notes}</p>
                    </div>
                  )}

                  {selectedBooking.cancellation_reason && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Cancellation Reason</h4>
                      <p className="text-sm text-gray-600">{selectedBooking.cancellation_reason}</p>
                    </div>
                  )}

                  {hasRating(selectedBooking) && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Your Rating & Review</h4>
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-5 w-5 ${i < selectedBooking.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-600">({selectedBooking.rating}/5)</span>
                      </div>
                      {selectedBooking.feedback && (
                        <p className="text-sm text-gray-600">{selectedBooking.feedback}</p>
                      )}
                    </div>
                  )}

                  {/* Show issues if any */}
                  {hasIssues(selectedBooking) && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Reported Issues</h4>
                      <div className="space-y-2">
                        {selectedBooking.issues.map((issue, index) => (
                          <div key={index} className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="text-sm font-medium text-orange-800">
                                  {issue.issue_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                </p>
                                <p className="text-sm text-orange-700 mt-1">{issue.issue_description}</p>
                                <p className="text-xs text-orange-600 mt-1">
                                  Severity: {issue.severity} | Status: {issue.status}
                                </p>
                              </div>
                              <span className={`px-2 py-1 text-xs rounded-full ${issue.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                  issue.status === 'resolved' ? 'bg-green-100 text-green-800' :
                                    'bg-gray-100 text-gray-800'
                                }`}>
                                {issue.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="border-t pt-4 mt-6 space-y-3">
                    {canRateBooking(selectedBooking) && (
                      <button
                        onClick={() => {
                          setShowModal(false)
                          setTimeout(() => openModal('rate', selectedBooking), 100)
                        }}
                        className="inline-flex items-center px-4 py-2 bg-yellow-600 text-white text-sm rounded-lg hover:bg-yellow-700 transition-colors mr-3"
                      >
                        <Star className="h-4 w-4 mr-2" />
                        Rate This Service
                      </button>
                    )}

                    {canRaiseIssue(selectedBooking) && (
                      <button
                        onClick={() => {
                          setShowModal(false)
                          setTimeout(() => openModal('issue', selectedBooking), 100)
                        }}
                        className="inline-flex items-center px-4 py-2 bg-orange-600 text-white text-sm rounded-lg hover:bg-orange-700 transition-colors"
                      >
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        Report Issue
                      </button>
                    )}
                  </div>
                </div>
              )}

              {modalType === 'cancel' && (
                <div className="space-y-4">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm text-yellow-800">
                      <strong>Note:</strong> You can only cancel bookings up to 24 hours before the scheduled date and time.
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cancellation Reason</label>
                    <textarea
                      value={formData.cancellation_reason || ''}
                      onChange={(e) => setFormData({ ...formData, cancellation_reason: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows="3"
                      placeholder="Please provide a reason for cancellation..."
                    />
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleCancelBooking(selectedBooking._id, formData)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Cancel Booking
                    </button>
                    <button
                      onClick={() => setShowModal(false)}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                    >
                      Keep Booking
                    </button>
                  </div>
                </div>
              )}

              {modalType === 'rate' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Rating *</label>
                    <div className="flex space-x-2">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <button
                          key={rating}
                          onClick={() => setFormData({ ...formData, rating })}
                          className="focus:outline-none transition-colors"
                          type="button"
                        >
                          <Star
                            className={`h-8 w-8 ${(formData.rating || 0) >= rating
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300 hover:text-yellow-300'
                              }`}
                          />
                        </button>
                      ))}
                    </div>
                    {formData.rating && (
                      <p className="text-sm text-gray-600 mt-1">
                        You rated this service {formData.rating} out of 5 stars
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Review (Optional)</label>
                    <textarea
                      value={formData.feedback || ''}
                      onChange={(e) => setFormData({ ...formData, feedback: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows="4"
                      placeholder="Share your experience with this service..."
                    />
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleSubmitFeedback(selectedBooking._id, formData)}
                      disabled={!formData.rating}
                      className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Submit Rating
                    </button>
                    <button
                      onClick={() => setShowModal(false)}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {modalType === 'issue' && (
                <div className="space-y-4">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 mr-2 flex-shrink-0" />
                      <div>
                        <h4 className="text-sm font-medium text-red-800">Reporting Issue for Cancelled Booking</h4>
                        <p className="text-sm text-red-700 mt-1">
                          This booking was accepted by the technician and then cancelled. Our team will investigate this issue.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Issue Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.issue_type || ''}
                      onChange={(e) => setFormData({ ...formData, issue_type: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select Issue Type</option>
                      <option value="technician_cancelled_after_acceptance">Technician cancelled after accepting</option>
                      <option value="last_minute_cancellation">Last minute cancellation</option>
                      <option value="unprofessional_behavior">Unprofessional behavior</option>
                      <option value="no_show">Technician didn't show up</option>
                      <option value="poor_communication">Poor communication</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Severity Level</label>
                    <select
                      value={formData.severity || 'medium'}
                      onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="low">Low - Minor inconvenience</option>
                      <option value="medium">Medium - Moderate impact</option>
                      <option value="high">High - Significant impact</option>
                      <option value="urgent">Urgent - Major disruption</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Issue Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={formData.issue_description || ''}
                      onChange={(e) => setFormData({ ...formData, issue_description: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows="4"
                      placeholder="Please describe the issue in detail. Include what happened, when it happened, and how it affected you..."
                      required
                    />
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm text-blue-800">
                      <strong>What happens next:</strong>
                      <br />
                      • Our team will review your report within 24 hours
                      <br />
                      • We may contact you for additional information
                      <br />
                      • Appropriate action will be taken against the technician if warranted
                      <br />
                      • You'll receive updates on the resolution status
                    </p>
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleRaiseIssue(selectedBooking._id, formData)}
                      disabled={!formData.issue_type || !formData.issue_description?.trim()}
                      className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-colors"
                    >
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Submit Issue Report
                    </button>
                    <button
                      onClick={() => setShowModal(false)}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ClientBookingDashboard