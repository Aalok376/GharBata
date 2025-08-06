import React, { useState, useEffect } from 'react'
import { Calendar, Clock, User, Phone, Mail, MapPin, CheckCircle, XCircle, Play, Square, Edit, Eye, Filter, ChevronLeft, ChevronRight, Star, MessageSquare, Navigation, BarChart3, Search, CreditCard, X } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'

const API_BASE_URL = 'https://gharbata.onrender.com'
const FRONTEND_URL = 'http://localhost:5173'

// Enhanced Refund Payment Callback Component with detailed debugging
const RefundPaymentCallback = ({ onComplete }) => {
  const [paymentStatus, setPaymentStatus] = useState('verifying')
  const [paymentData, setPaymentData] = useState(null)
  const [refundProcessed, setRefundProcessed] = useState(false)
  const [debugInfo, setDebugInfo] = useState([])

  const addDebugInfo = (message) => {
    console.log(`[RefundPaymentCallback] ${message}`)
    setDebugInfo(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  useEffect(() => {
    addDebugInfo('RefundPaymentCallback component mounted')
    verifyPayment()
  }, [])

  const verifyPayment = async () => {
    const urlParams = new URLSearchParams(window.location.search)
    const pidx = urlParams.get('pidx')
    const status = urlParams.get('status')

    addDebugInfo(`URL Parameters: pidx=${pidx}, status=${status}`)

    // Check stored data
    const refundData = sessionStorage.getItem('refundPaymentData')
    addDebugInfo(`SessionStorage - refundPaymentData: ${refundData ? 'EXISTS' : 'MISSING'}`)

    if (!pidx) {
      addDebugInfo('ERROR: No pidx found in URL')
      setPaymentStatus('error')
      return
    }

    try {
      addDebugInfo('Starting refund payment verification...')
      const response = await fetch(`${API_BASE_URL}/api/payment/verify`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pidx }),
      })

      addDebugInfo(`Verify API Response Status: ${response.status}`)
      const result = await response.json()
      addDebugInfo(`Verify API Response: ${JSON.stringify(result)}`)

      if (result.success && result.data) {
        setPaymentData(result.data)
        const verifiedStatus = result.data.status.toLowerCase()
        setPaymentStatus(verifiedStatus)
        addDebugInfo(`Refund payment status set to: ${verifiedStatus}`)

        if (verifiedStatus === 'completed') {
          addDebugInfo('Refund payment completed, processing refund...')
          await completeRefundAfterPayment(result.data)
        }
      } else {
        addDebugInfo(`Refund payment verification failed: ${result.message || 'Unknown error'}`)
        setPaymentStatus('error')
      }
    } catch (error) {
      addDebugInfo(`Refund payment verification error: ${error.message}`)
      setPaymentStatus('error')
    }
  }

  const completeRefundAfterPayment = async (paymentResult) => {
    const refundDataStr = sessionStorage.getItem('refundPaymentData')

    if (!refundDataStr) {
      addDebugInfo('ERROR: No refund data found in sessionStorage')
      alert('Error: No refund data found. Please try again.')
      return
    }

    try {
      const refundData = JSON.parse(refundDataStr)
      addDebugInfo(`Retrieved refund data: ${JSON.stringify(refundData)}`)

      // Update booking refund status
      addDebugInfo(`Calling refund API for booking: ${refundData.booking_id}`)
      const refundResponse = await fetch(`${API_BASE_URL}/api/bookings/${refundData.booking_id}/refund`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      const refundResult = await refundResponse.json()
      addDebugInfo(`Refund API Response: ${JSON.stringify(refundResult)}`)

      if (refundResult.success) {
        addDebugInfo('Refund processing completed successfully!')
        setRefundProcessed(true)
      } else {
        throw new Error(refundResult.message || 'Failed to update refund status')
      }

      // Clear stored data
      sessionStorage.removeItem('refundPaymentData')
      addDebugInfo('SessionStorage cleared')

      // Redirect after delay
      setTimeout(() => {
        addDebugInfo('Calling onComplete(true)')
        onComplete(true)
      }, 3000)

    } catch (error) {
      addDebugInfo(`Refund completion error: ${error.message}`)
      alert('Refund payment successful but processing failed: ' + error.message)
      setPaymentStatus('error')
    }
  }

  const getStatusMessage = () => {
    switch (paymentStatus) {
      case 'completed':
        if (refundProcessed) {
          return {
            message: 'Refund Processed Successfully!',
            subtitle: 'Returning to dashboard...',
            className: 'success',
            icon: '✅'
          }
        } else {
          return {
            message: 'Refund Payment Successful!',
            subtitle: 'Processing your refund...',
            className: 'success',
            icon: '✅'
          }
        }
      case 'pending':
        return {
          message: 'Refund payment is being processed...',
          subtitle: 'Please wait while we verify your refund payment',
          className: 'pending',
          icon: '⏳'
        }
      case 'failed':
      case 'expired':
      case 'canceled':
        return {
          message: 'Refund Payment Failed or Cancelled',
          subtitle: 'The refund payment was not completed',
          className: 'error',
          icon: '❌'
        }
      case 'verifying':
        return {
          message: 'Verifying refund payment...',
          subtitle: 'Please wait while we confirm your refund payment',
          className: 'pending',
          icon: '🔄'
        }
      case 'error':
        return {
          message: 'An error occurred',
          subtitle: 'There was a problem processing your refund',
          className: 'error',
          icon: '❌'
        }
      default:
        return {
          message: 'Unknown refund status',
          subtitle: 'Please contact support if this persists',
          className: 'error',
          icon: '❓'
        }
    }
  }

  const statusInfo = getStatusMessage()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className={`bg-white p-8 rounded-xl shadow-lg text-center max-w-2xl mx-auto border-t-4 ${statusInfo.className === 'success' ? 'border-green-500' :
        statusInfo.className === 'error' ? 'border-red-500' : 'border-yellow-500'
        }`}>
        <div className="text-5xl mb-4">{statusInfo.icon}</div>
        <h2 className="text-2xl font-bold mb-2 text-gray-800">{statusInfo.message}</h2>
        <p className="text-gray-600 mb-6">{statusInfo.subtitle}</p>

        {paymentData && (
          <div className="bg-gray-50 p-4 rounded-lg mb-6 text-left">
            <h3 className="text-lg font-semibold text-purple-700 mb-3">Refund Payment Details</h3>
            <div className="space-y-2 text-sm">
              <p><strong>Amount:</strong> NPR {paymentData.amount}</p>
              <p><strong>Transaction ID:</strong> {paymentData.transaction_id || 'N/A'}</p>
              <p><strong>Status:</strong> {paymentData.status}</p>
              {paymentData.pidx && <p><strong>Payment ID:</strong> {paymentData.pidx}</p>}
            </div>
          </div>
        )}

        {/* Debug Information Panel - Only show in development */}
        {process.env.NODE_ENV === 'development' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4 text-left">
            <h4 className="font-bold text-yellow-800 mb-2">Debug Information:</h4>
            <div className="max-h-40 overflow-y-auto text-xs text-yellow-700 space-y-1">
              {debugInfo.map((info, index) => (
                <div key={index} className="font-mono">{info}</div>
              ))}
            </div>
          </div>
        )}

        {paymentStatus === 'completed' && !refundProcessed && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-blue-800">
              Your refund payment was successful! We're now processing your refund...
            </p>
          </div>
        )}

        {refundProcessed && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-green-800">
              🎉 Your refund has been processed successfully! You will be redirected to the dashboard shortly.
            </p>
          </div>
        )}

        <div className="flex gap-2">
          {(paymentStatus === 'failed' || paymentStatus === 'canceled' || paymentStatus === 'error') && (
            <button
              onClick={() => onComplete(false)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-all transform hover:scale-105"
            >
              Back to Dashboard
            </button>
          )}

          {/* Debug button - Only show in development */}
          {process.env.NODE_ENV === 'development' && (
            <button
              onClick={() => {
                console.log('Current debugInfo:', debugInfo)
                console.log('SessionStorage contents:', {
                  refundPaymentData: sessionStorage.getItem('refundPaymentData')
                })
              }}
              className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg text-sm"
            >
              Log Debug Info
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// Enhanced Khalti Refund Overlay Component
const KhaltiRefundOverlay = ({ isOpen, onClose, booking, onRefundComplete }) => {
  const [customerInfo, setCustomerInfo] = useState(null)
  const [refundInitiating, setRefundInitiating] = useState(false)
  const { technicianId } = useParams()

  useEffect(() => {
    const fetchCustomerInfo = async () => {
      if (!isOpen || !booking?.client_id) return

      try {
        const response = await fetch(`${API_BASE_URL}/api/payment/getPaymentsdetails`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ clientId: booking.client_id })
        })

        const result = await response.json()

        setCustomerInfo({
          name: `${result.fname} ${result.lname}`,
          email: result.username,
          phone: result.khaltiNumber
        })
      } catch (error) {
        console.error('Error fetching customer info:', error)
      }
    }

    fetchCustomerInfo()
  }, [isOpen, booking?.client_id])

  const handleKhaltiRefund = async () => {

    if (!customerInfo) return

    setRefundInitiating(true)
    const orderId = `REFUND_${Date.now()}`

    // Store refund data for after payment completion
    const completeRefundData = {
      booking_id: booking._id,
      client_id: booking.client_id,
      original_amount: booking.final_price,
      refund_reason: 'Booking cancelled',
      orderId: orderId
    }

    // Store refund data for after payment
    sessionStorage.setItem('refundPaymentData', JSON.stringify(completeRefundData))

    const refundData = {
      amount: parseInt(booking.final_price) || 10,
      orderId,
      customerInfo: {
        name: customerInfo.name,
        username: customerInfo.email,
        phone: customerInfo.phone
      },
      productDetails: {
        name: `Refund - ${booking.service}`,
        identity: orderId,
        quantity: 1
      },
      returnUrl: `${FRONTEND_URL}/professional/bookings/${technicianId}`
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/payment/initiate`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(refundData),
      })

      const result = await response.json()

      if (result.success) {
        // Store payment info for callback handling
        sessionStorage.setItem('khaltiRefundData', JSON.stringify(result.data))

        // Redirect to Khalti payment page for refund
        window.location.href = result.data.payment_url
      } else {
        alert('Refund initiation failed: ' + result.message)
        setRefundInitiating(false)
      }
    } catch (error) {
      console.error('Refund initiation error:', error)
      alert('Refund initiation failed: ' + error.message)
      setRefundInitiating(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CreditCard className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Process Refund</h2>
          <p className="text-gray-600">Process refund for cancelled booking</p>
        </div>

        {customerInfo ? (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-3">Booking Details</h3>
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">Service:</span> {booking.service}</p>
                <p><span className="font-medium">Customer:</span> {booking.fname} {booking.lname}</p>
                <p><span className="font-medium">Date:</span> {new Date(booking.scheduled_date).toLocaleDateString()}</p>
                <p><span className="font-medium">Refund Amount:</span> <span className="text-2xl font-bold text-red-600">Rs. {booking.final_price}</span></p>
              </div>
            </div>

            <div className="bg-red-50 p-4 rounded-lg">
              <h3 className="font-semibold text-red-800 mb-3">Customer Information</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center">
                  <User className="w-4 h-4 text-red-600 mr-2" />
                  <span>{customerInfo.name}</span>
                </div>
                <div className="flex items-center">
                  <Mail className="w-4 h-4 text-red-600 mr-2" />
                  <span>{customerInfo.email}</span>
                </div>
                <div className="flex items-center">
                  <Phone className="w-4 h-4 text-red-600 mr-2" />
                  <span>{customerInfo.phone}</span>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> This will initiate a refund process through Khalti.
                The customer will need to complete the refund authorization.
              </p>
            </div>

            <button
              onClick={handleKhaltiRefund}
              disabled={refundInitiating}
              className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white font-bold py-3 px-6 rounded-lg hover:from-red-700 hover:to-red-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105"
            >
              {refundInitiating ? 'Redirecting to Khalti...' : 'Process Refund via Khalti'}
            </button>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-red-600">Loading customer information...</p>
          </div>
        )}
      </div>
    </div>
  )
}

const BookingDashboard = () => {
  // Get technician_id from URL params or use a default for demo
  const { technicianId } = useParams()
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState('bookings')
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState('')
  const [showRefundOverlay, setShowRefundOverlay] = useState(false)
  const [showRefundCallback, setShowRefundCallback] = useState(false)
  const [filters, setFilters] = useState({
    status: '',
    technician_id: technicianId,
    date_from: '',
    date_to: ''
  })
  const [pagination, setPagination] = useState({
    current_page: 1,
    total_pages: 1,
    total_bookings: 0
  })
  const [stats, setStats] = useState({})
  const [formData, setFormData] = useState({})
  const [formErrors, setFormErrors] = useState({})

  const API_BASE = 'https://gharbata.onrender.com/api/bookings'

  // Enhanced callback detection for refund - similar to first code
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const allPidx = urlParams.getAll('pidx')
    const pidx = allPidx.find(p => p && p.trim() !== '') || null

    if (pidx) {
      console.log('Refund callback detected with pidx:', pidx)
      setShowRefundCallback(true)
    }
  }, [])

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
      const data = await response.json()
      console.log(data)

      setBookings(data.bookings || [])
      setPagination(data.pagination || {})
    } catch (error) {
      console.error('Error fetching bookings:', error)
    }
    setLoading(false)
  }

  const fetchStats = async () => {
    try {
      const queryParams = new URLSearchParams()
      if (technicianId) queryParams.append('technician_id', technicianId)

      const response = await fetch(`${API_BASE}/stats/overview?${queryParams}`, {
        method: 'GET',
        credentials: 'include',
      })
      const data = await response.json()
      setStats(data.stats || {})
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  useEffect(() => {
    fetchBookings()
    fetchStats()
  }, [filters])

  const validateForm = (type, data) => {
    const errors = {}

    switch (type) {
      case 'reject':
        if (!data.rejection_reason || data.rejection_reason.trim() === '') {
          errors.rejection_reason = 'Rejection reason is required'
        }
        break
      case 'cancel':
        if (!data.cancellation_reason || data.cancellation_reason.trim() === '') {
          errors.cancellation_reason = 'Cancellation reason is required'
        }
        break
    }

    return errors
  }

  const handleBookingAction = async (bookingId, action, data = {}) => {
    // Validate form for actions that require mandatory fields
    if (['reject', 'cancel'].includes(action)) {
      const errors = validateForm(action, data)
      if (Object.keys(errors).length > 0) {
        setFormErrors(errors)
        return
      }
    }

    try {
      const response = await fetch(`${API_BASE}/${bookingId}/${action}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })

      if (response.ok) {
        fetchBookings(pagination.current_page)
        fetchStats()
        setShowModal(false)
        setSelectedBooking(null)
        setFormErrors({})
      } else {
        const errorData = await response.json()
        alert(errorData.error || 'An error occurred')
      }
    } catch (error) {
      console.error(`Error ${action} booking:`, error)
      alert('An error occurred while processing the request')
    }
  }

  const openModal = (type, booking = null) => {
    setModalType(type)
    setSelectedBooking(booking)
    setShowModal(true)
    setFormData(booking || {})
    setFormErrors({})
  }

  const openRefundModal = (booking) => {
    setSelectedBooking(booking)
    setShowRefundOverlay(true)
  }

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-purple-100 text-purple-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'text-green-600',
      normal: 'text-blue-600',
      high: 'text-orange-600',
      urgent: 'text-red-600'
    }
    return colors[priority] || 'text-gray-600'
  }

  const getTechnicianId = (booking) => {
    return typeof booking.technician_id === 'object'
      ? booking.technician_id._id
      : booking.technician_id
  }

  // Check if booking is refundable (cancelled, khalti payment, not already refunded)
  const isRefundable = (booking) => {
    return booking.booking_status === 'cancelled' &&
      booking.paymentMethod === 'khalti' &&
      !booking.refunded
  }

  // Show refund payment callback if needed - similar to first code's payment callback
  if (showRefundCallback) {
    return (
      <RefundPaymentCallback
        onComplete={(success) => {
          if (success) {
            // Clear session storage
            sessionStorage.removeItem('refundPaymentData')
            sessionStorage.removeItem('khaltiRefundData')
            setShowRefundCallback(false)
            // Clear URL parameters
            window.history.replaceState({}, document.title, window.location.pathname)
            // Refresh bookings
            fetchBookings(pagination.current_page)
            fetchStats()
          } else {
            sessionStorage.removeItem('refundPaymentData')
            sessionStorage.removeItem('khaltiRefundData')
            setShowRefundCallback(false)
            window.history.replaceState({}, document.title, window.location.pathname)
          }
        }}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Khalti Refund Overlay */}
      <KhaltiRefundOverlay
        isOpen={showRefundOverlay}
        onClose={() => setShowRefundOverlay(false)}
        booking={selectedBooking}
        onRefundComplete={() => {
          setShowRefundOverlay(false)
          fetchBookings(pagination.current_page)
        }}
      />

      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-gray-900">Booking Management</h1>
            <div className="flex space-x-4">
              <button
                onClick={() => setActiveTab('bookings')}
                className={`px-4 py-2 rounded-lg font-medium ${activeTab === 'bookings'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
                  }`}
              >
                Bookings
              </button>
              <button
                onClick={() => setActiveTab('stats')}
                className={`px-4 py-2 rounded-lg font-medium ${activeTab === 'stats'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
                  }`}
              >
                Statistics
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'bookings' && (
          <>
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
                      technician_id: technicianId || '',
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
                  Bookings ({pagination.total_bookings})
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
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Schedule</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {bookings.map((booking) => (
                        <tr key={booking._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center cursor-pointer" onClick={() => {
                                  if (booking?.client_id?.client_id) {
                                    navigate(`/clientProfileSetupPage/${booking.client_id.client_id}`)
                                  }
                                }}>
                                  {booking.client_id?.profilePic ? (
                                    <img
                                      src={booking.client_id.profilePic}
                                      className="h-10 w-10 rounded-full object-cover"
                                      alt="Profile"
                                    />
                                  ) : (
                                    <User className="h-5 w-5 text-gray-600" />
                                  )}
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {booking.fname} {booking.lname}
                                </div>
                                <div className="text-sm text-gray-500">{booking.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{booking.service}</div>
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
                            {booking.refunded && (
                              <div className="mt-1">
                                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                  REFUNDED
                                </span>
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            Rs.{booking.final_price}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => openModal('view', booking)}
                                className="text-blue-600 hover:text-blue-900 hover:bg-blue-50 px-3 py-1 rounded-lg transition-colors"
                              >
                                View Details
                              </button>
                              {/* Add Refund Button for cancelled Khalti bookings that are not already refunded */}
                              {isRefundable(booking) && (
                                <button
                                  onClick={() => openRefundModal(booking)}
                                  className="text-red-600 hover:text-red-900 hover:bg-red-50 px-3 py-1 rounded-lg transition-colors"
                                >
                                  Refund
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination */}
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
            </div>
          </>
        )}

        {activeTab === 'stats' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.total_bookings || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.completed || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.pending || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Star className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-semibold text-gray-900">Rs.{stats.total_revenue?.toFixed(2) || '0.00'}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <Star className="h-6 w-6 text-indigo-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Avg Rating</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.avg_rating?.toFixed(1) || 'N/A'}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-gray-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Avg Booking Value</p>
                  <p className="text-2xl font-semibold text-gray-900">Rs.{stats.avg_booking_value?.toFixed(2) || '0.00'}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Play className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">In Progress</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.in_progress || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <XCircle className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Cancelled</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.cancelled || 0}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {modalType === 'view' && 'Booking Details'}
                  {modalType === 'accept' && 'Accept Booking'}
                  {modalType === 'reject' && 'Reject Booking'}
                  {modalType === 'start' && 'Start Service'}
                  {modalType === 'complete' && 'Complete Service'}
                  {modalType === 'cancel' && 'Cancel Booking'}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              {modalType === 'view' && selectedBooking && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Customer Information</h4>
                      <div className="space-y-2 text-sm">
                        <p><span className="font-medium">Name:</span> {selectedBooking.fname} {selectedBooking.lname}</p>
                        <p><span className="font-medium">Email:</span> {selectedBooking.email}</p>
                        <p><span className="font-medium">Phone:</span> {selectedBooking.phoneNumber}</p>
                        {selectedBooking.emergencyContactName && (
                          <p><span className="font-medium">Emergency Contact:</span> {selectedBooking.emergencyContactName} ({selectedBooking.emergencyContactPhone})</p>
                        )}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Service Details</h4>
                      <div className="space-y-2 text-sm">
                        <p><span className="font-medium">Service:</span> {selectedBooking.service}</p>
                        <p><span className="font-medium">Date:</span> {new Date(selectedBooking.scheduled_date).toLocaleDateString()}</p>
                        <p><span className="font-medium">Time:</span> {selectedBooking.scheduled_StartTime}-{selectedBooking.scheduled_EndTime}</p>
                        <p><span className="font-medium">Price:</span> Rs.{selectedBooking.final_price}</p>
                        <p><span className="font-medium">Payment:</span> {selectedBooking.paymentMethod || 'cash'}</p>
                        <p><span className="font-medium">Status:</span>
                          <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedBooking.booking_status)}`}>
                            {selectedBooking.booking_status.replace('_', ' ').toUpperCase()}
                          </span>
                        </p>
                        {selectedBooking.refunded && (
                          <p><span className="font-medium">Refund Status:</span>
                            <span className="ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                              REFUNDED
                            </span>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Address</h4>
                    <p className="text-sm">
                      {selectedBooking.streetAddress}
                      {selectedBooking.apartMent && `, ${selectedBooking.apartMent}`}
                      <br />
                      {selectedBooking.cityAddress}
                    </p>
                    {selectedBooking.latitude && selectedBooking.longitude && (
                      <button
                        onClick={() => {
                          navigate(
                            `/bookings/direction/${selectedBooking.latitude}/${selectedBooking.longitude}`
                          )
                        }}
                        className="mt-2 inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg shadow-md hover:bg-blue-700 transition duration-300"
                      >
                        <Navigation className="h-4 w-4 mr-2" />
                        Get Directions
                      </button>
                    )}
                  </div>

                  {selectedBooking.specialInstructions && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Special Instructions</h4>
                      <p className="text-sm text-gray-600">{selectedBooking.specialInstructions}</p>
                    </div>
                  )}

                  {selectedBooking.completion_notes && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Completion Notes</h4>
                      <p className="text-sm text-gray-600">{selectedBooking.completion_notes}</p>
                    </div>
                  )}

                  {selectedBooking.rating && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Rating & Feedback</h4>
                      <div className="flex items-center space-x-2">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${i < selectedBooking.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-600">({selectedBooking.rating})</span>
                      </div>
                      {selectedBooking.feedback && (
                        <p className="text-sm text-gray-600 mt-2">{selectedBooking.feedback}</p>
                      )}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="border-t pt-4 mt-6">
                    <h4 className="font-medium text-gray-900 mb-3">Available Actions</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedBooking.booking_status === 'pending' && (
                        <>
                          <button
                            onClick={() => {
                              setShowModal(false)
                              setTimeout(() => openModal('accept', selectedBooking), 100)
                            }}
                            className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Accept Booking
                          </button>
                          <button
                            onClick={() => {
                              setShowModal(false)
                              setTimeout(() => openModal('reject', selectedBooking), 100)
                            }}
                            className="inline-flex items-center px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Reject Booking
                          </button>
                        </>
                      )}

                      {selectedBooking.booking_status === 'confirmed' && (
                        <>
                          <button
                            onClick={() => {
                              setShowModal(false)
                              setTimeout(() => openModal('start', selectedBooking), 100)
                            }}
                            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors"
                          >
                            <Play className="h-4 w-4 mr-2" />
                            Start Service
                          </button>
                          <button
                            onClick={() => {
                              setShowModal(false)
                              setTimeout(() => openModal('cancel', selectedBooking), 100)
                            }}
                            className="inline-flex items-center px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Cancel Booking
                          </button>
                        </>
                      )}

                      {selectedBooking.booking_status === 'in_progress' && (
                        <button
                          onClick={() => {
                            setShowModal(false)
                            setTimeout(() => openModal('complete', selectedBooking), 100)
                          }}
                          className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <Square className="h-4 w-4 mr-2" />
                          Complete Service
                        </button>
                      )}

                      {/* Refund button for cancelled Khalti bookings that are not already refunded */}
                      {isRefundable(selectedBooking) && (
                        <button
                          onClick={() => {
                            setShowModal(false)
                            setTimeout(() => openRefundModal(selectedBooking), 100)
                          }}
                          className="inline-flex items-center px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
                        >
                          <CreditCard className="h-4 w-4 mr-2" />
                          Process Refund
                        </button>
                      )}

                      {selectedBooking.booking_status === 'completed' && (
                        <div className="text-sm text-gray-500 italic py-2">
                          No actions available for completed bookings.
                        </div>
                      )}

                      {selectedBooking.booking_status === 'cancelled' && !isRefundable(selectedBooking) && (
                        <div className="text-sm text-gray-500 italic py-2">
                          {selectedBooking.refunded
                            ? 'Booking has already been refunded.'
                            : selectedBooking.paymentMethod !== 'khalti'
                              ? 'No actions available for cancelled cash bookings.'
                              : 'No actions available.'}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {modalType === 'accept' && (
                <div className="space-y-4">
                  <p>Are you sure you want to accept this booking?</p>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleBookingAction(selectedBooking._id, 'accept', {
                        technician_id: getTechnicianId(selectedBooking)
                      })}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      Accept Booking
                    </button>
                    <button
                      onClick={() => setShowModal(false)}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {modalType === 'reject' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Rejection Reason <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={formData.rejection_reason || ''}
                      onChange={(e) => {
                        setFormData({ ...formData, rejection_reason: e.target.value })
                        if (formErrors.rejection_reason) {
                          setFormErrors({ ...formErrors, rejection_reason: '' })
                        }
                      }}
                      className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${formErrors.rejection_reason ? 'border-red-500' : 'border-gray-300'
                        }`}
                      rows="3"
                      placeholder="Please provide a reason for rejection..."
                    />
                    {formErrors.rejection_reason && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.rejection_reason}</p>
                    )}
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleBookingAction(selectedBooking._id, 'reject', {
                        technician_id: getTechnicianId(selectedBooking),
                        rejection_reason: formData.rejection_reason
                      })}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      Reject Booking
                    </button>
                    <button
                      onClick={() => setShowModal(false)}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {modalType === 'start' && (
                <div className="space-y-4">
                  <p>Are you ready to start the service?</p>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleBookingAction(selectedBooking._id, 'start', {
                        technician_id: getTechnicianId(selectedBooking)
                      })}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                    >
                      Start Service
                    </button>
                    <button
                      onClick={() => setShowModal(false)}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {modalType === 'complete' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Completion Notes</label>
                    <textarea
                      value={formData.completion_notes || ''}
                      onChange={(e) => setFormData({ ...formData, completion_notes: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows="3"
                      placeholder="Describe the work completed..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Actual Price (Optional)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.actual_price || ''}
                      onChange={(e) => setFormData({ ...formData, actual_price: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter actual price if different from estimate"
                    />
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleBookingAction(selectedBooking._id, 'complete', {
                        technician_id: getTechnicianId(selectedBooking),
                        completion_notes: formData.completion_notes,
                        actual_price: formData.actual_price ? parseFloat(formData.actual_price) : undefined
                      })}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      Complete Service
                    </button>
                    <button
                      onClick={() => setShowModal(false)}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {modalType === 'cancel' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cancellation Reason <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={formData.cancellation_reason || ''}
                      onChange={(e) => {
                        setFormData({ ...formData, cancellation_reason: e.target.value })
                        if (formErrors.cancellation_reason) {
                          setFormErrors({ ...formErrors, cancellation_reason: '' })
                        }
                      }}
                      className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${formErrors.cancellation_reason ? 'border-red-500' : 'border-gray-300'
                        }`}
                      rows="3"
                      placeholder="Please provide a reason for cancellation..."
                    />
                    {formErrors.cancellation_reason && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.cancellation_reason}</p>
                    )}
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleBookingAction(selectedBooking._id, 'cancel', {
                        cancelled_by: getTechnicianId(selectedBooking),
                        cancellation_reason: formData.cancellation_reason
                      })}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      Cancel Booking
                    </button>
                    <button
                      onClick={() => setShowModal(false)}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                    >
                      Back
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

export default BookingDashboard