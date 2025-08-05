import React, { useState, useEffect } from 'react'
import { Calendar, Clock, MapPin, User, Phone, Mail, CreditCard, Home, CheckCircle, X } from 'lucide-react'

import { SelectLocationOverlay } from '../components/selectLocation'
import { useNavigate, useParams } from 'react-router-dom'

const API_BASE_URL = 'http://localhost:5000'

// Enhanced PaymentCallback with detailed debugging
const PaymentCallback = ({ onComplete }) => {
  const [paymentStatus, setPaymentStatus] = useState('verifying')
  const [paymentData, setPaymentData] = useState(null)
  const [bookingCreated, setBookingCreated] = useState(false)
  const [debugInfo, setDebugInfo] = useState([])

  const addDebugInfo = (message) => {
    console.log(`[PaymentCallback] ${message}`)
    setDebugInfo(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  useEffect(() => {
    addDebugInfo('PaymentCallback component mounted')
    verifyPayment()
  }, [])

  const verifyPayment = async () => {
    const urlParams = new URLSearchParams(window.location.search)
    const pidx = urlParams.get('pidx')
    const status = urlParams.get('status')

    addDebugInfo(`URL Parameters: pidx=${pidx}, status=${status}`)

    // Check sessionStorage contents
    const pendingData = sessionStorage.getItem('pendingBookingData')
    const khaltiData = sessionStorage.getItem('khaltiPaymentData')
    addDebugInfo(`SessionStorage - pendingBookingData: ${pendingData ? 'EXISTS' : 'MISSING'}`)
    addDebugInfo(`SessionStorage - khaltiPaymentData: ${khaltiData ? 'EXISTS' : 'MISSING'}`)

    if (!pidx) {
      addDebugInfo('ERROR: No pidx found in URL')
      setPaymentStatus('error')
      return
    }

    try {
      addDebugInfo('Starting payment verification...')
      const response = await fetch(`${API_BASE_URL}/api/payment/verify`, {
        method: 'POST',
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
        addDebugInfo(`Payment status set to: ${verifiedStatus}`)

        if (verifiedStatus === 'completed') {
          addDebugInfo('Payment completed, creating booking...')
          await completeBookingAfterPayment(result.data)
        }
      } else {
        addDebugInfo(`Payment verification failed: ${result.message || 'Unknown error'}`)
        setPaymentStatus('error')
      }
    } catch (error) {
      addDebugInfo(`Payment verification error: ${error.message}`)
      setPaymentStatus('error')
    }
  }

  const completeBookingAfterPayment = async (paymentResult) => {
    const pendingBookingDataStr = sessionStorage.getItem('pendingBookingData')

    if (!pendingBookingDataStr) {
      addDebugInfo('ERROR: No pending booking data found in sessionStorage')
      alert('Error: No booking data found. Please try booking again.')
      return
    }

    try {
      const bookingData = JSON.parse(pendingBookingDataStr)
      addDebugInfo(`Retrieved booking data: ${JSON.stringify(bookingData)}`)

      // Handle geocoding if needed
      let finalBookingData = { ...bookingData }

      if (!bookingData.latitude || !bookingData.longitude || bookingData.latitude === '0' || bookingData.longitude === '0') {
        addDebugInfo('Geocoding required - no valid coordinates found')
        const location = bookingData.streetAddress

        try {
          addDebugInfo(`Starting geocoding for address: ${location}`)
          const geoResponse = await fetch(`${API_BASE_URL}/geocode?q=${encodeURIComponent(location)}`, {
            method: 'GET',
            credentials: 'include',
          })

          addDebugInfo(`Geocoding API response status: ${geoResponse.status}`)
          const geoData = await geoResponse.json()

          if (geoData.error) {
            addDebugInfo(`Geocoding error: ${geoData.error}`)
            alert('Error getting location coordinates: ' + geoData.error)
            setPaymentStatus('error')
            return
          } else {
            addDebugInfo(`Geocoding successful - lat: ${geoData.lat}, lon: ${geoData.lon}`)
            finalBookingData.latitude = geoData.lat
            finalBookingData.longitude = geoData.lon
          }
        } catch (error) {
          addDebugInfo(`Geocoding network error: ${error.message}`)
          alert('Error getting location coordinates: ' + error.message)
          setPaymentStatus('error')
          return
        }
      } else {
        addDebugInfo(`Using existing coordinates - lat: ${bookingData.latitude}, lon: ${bookingData.longitude}`)
      }

      const completeBookingData = {
        ...finalBookingData,
        paymentStatus: 'completed',
        transactionId: paymentResult.transaction_id,
        khaltiPidx: paymentResult.pidx,
        paymentMethod: 'khalti'
      }

      addDebugInfo(`Sending booking creation request with coordinates...`)
      const bookingResponse = await fetch(`${API_BASE_URL}/api/bookings/create`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(completeBookingData)
      })

      addDebugInfo(`Booking API Response Status: ${bookingResponse.status}`)
      const bookingResult = await bookingResponse.json()

      if (bookingResponse.ok && bookingResult.booking) {
        addDebugInfo('Booking created successfully!')
        setBookingCreated(true)

        // Clear stored data
        sessionStorage.removeItem('pendingBookingData')
        sessionStorage.removeItem('khaltiPaymentData')
        addDebugInfo('SessionStorage cleared')

        // Redirect after delay
        setTimeout(() => {
          addDebugInfo('Calling onComplete(true)')
          onComplete(true)
        }, 3000)
      } else {
        addDebugInfo(`Booking creation failed: ${bookingResult.error || bookingResult.message}`)
        alert('Payment successful but booking creation failed: ' + (bookingResult.error || bookingResult.message))
        setPaymentStatus('error')
      }
    } catch (error) {
      addDebugInfo(`Booking completion error: ${error.message}`)
      alert('Payment successful but booking completion failed: ' + error.message)
      setPaymentStatus('error')
    }
  }

  const getStatusMessage = () => {
    switch (paymentStatus) {
      case 'completed':
        if (bookingCreated) {
          return {
            message: 'Booking Created Successfully!',
            subtitle: 'Redirecting to dashboard...',
            className: 'success',
            icon: '✅'
          }
        } else {
          return {
            message: 'Payment Successful!',
            subtitle: 'Creating your booking...',
            className: 'success',
            icon: '✅'
          }
        }
      case 'pending':
        return {
          message: 'Payment is being processed...',
          subtitle: 'Please wait while we verify your payment',
          className: 'pending',
          icon: '⏳'
        }
      case 'failed':
      case 'expired':
      case 'canceled':
        return {
          message: 'Payment Failed or Cancelled',
          subtitle: 'Your payment was not completed',
          className: 'error',
          icon: '❌'
        }
      case 'verifying':
        return {
          message: 'Verifying payment...',
          subtitle: 'Please wait while we confirm your payment',
          className: 'pending',
          icon: '🔄'
        }
      case 'error':
        return {
          message: 'An error occurred',
          subtitle: 'There was a problem processing your request',
          className: 'error',
          icon: '❌'
        }
      default:
        return {
          message: 'Unknown payment status',
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
            <h3 className="text-lg font-semibold text-purple-700 mb-3">Payment Details</h3>
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

        {paymentStatus === 'completed' && !bookingCreated && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-blue-800">
              Your payment was successful! We're now creating your booking...
            </p>
          </div>
        )}

        {bookingCreated && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-green-800">
              🎉 Your booking has been confirmed! You will be redirected to your dashboard shortly.
            </p>
          </div>
        )}

        <div className="flex gap-2">
          {(paymentStatus === 'failed' || paymentStatus === 'canceled' || paymentStatus === 'error') && (
            <button
              onClick={() => onComplete(false)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-all transform hover:scale-105"
            >
              Back to Booking
            </button>
          )}

          {/* Debug button - Only show in development */}
          {process.env.NODE_ENV === 'development' && (
            <button
              onClick={() => {
                console.log('Current debugInfo:', debugInfo)
                console.log('SessionStorage contents:', {
                  pendingBookingData: sessionStorage.getItem('pendingBookingData'),
                  khaltiPaymentData: sessionStorage.getItem('khaltiPaymentData')
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

// Enhanced Khalti Payment Overlay
const KhaltiPaymentOverlay = ({ isOpen, onClose, formData, startTime, endTime, onPaymentComplete }) => {
  const [customerInfo, setCustomerInfo] = useState(null)
  const [paymentInitiating, setPaymentInitiating] = useState(false)

  useEffect(() => {
    const fetchCustomerInfo = async () => {
      if (!isOpen || !formData.technician_id) return

      try {
        const response = await fetch(`${API_BASE_URL}/api/payment/getPaymentsdetails`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ technicianId: formData.technician_id })
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
  }, [isOpen, formData.technician_id])

  const handleKhaltiPayment = async () => {
    if (!customerInfo) return

    setPaymentInitiating(true)
    const orderId = `BOOKING_${Date.now()}`

    // Store complete booking data for after payment completion
    const completeBookingData = {
      technician_id: formData.technician_id,
      fname: formData.fname,
      lname: formData.lname,
      email: formData.email,
      phoneNumber: formData.phone,
      streetAddress: formData.address,
      apartMent: formData.apartment,
      cityAddress: formData.city,
      service: formData.service,
      emergencyContactName: formData.emergencyContact,
      emergencyContactPhone: formData.emergencyPhone,
      scheduled_date: formData.date,
      scheduled_StartTime: startTime,
      scheduled_EndTime: endTime,
      specialInstructions: formData.specialInstructions,
      contactPreference: formData.contactPreference,
      latitude: formData.latitude || '0',
      longitude: formData.longitude || '0',
      final_price: formData.final_price || '10',
      paymentMethod: 'khalti',
      orderId: orderId
    }

    // Store booking data for after payment
    sessionStorage.setItem('pendingBookingData', JSON.stringify(completeBookingData))

    const paymentData = {
      amount: parseInt(formData.final_price) || 10,
      orderId,
      customerInfo: {
        name: customerInfo.name,
        username: customerInfo.email,
        phone: customerInfo.phone
      },
      productDetails: {
        name: `Service Booking - ${formData.service}`,
        identity: orderId,
        quantity: 1
      },
      technicianId: formData.technician_id,
      service: formData.service
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/payment/initiate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      })

      const result = await response.json()

      if (result.success) {
        // Store payment info for callback handling
        sessionStorage.setItem('khaltiPaymentData', JSON.stringify(result.data))

        // Redirect to Khalti payment page
        window.location.href = result.data.payment_url
      } else {
        alert('Payment initiation failed: ' + result.message)
        setPaymentInitiating(false)
      }
    } catch (error) {
      console.error('Payment initiation error:', error)
      alert('Payment initiation failed: ' + error.message)
      setPaymentInitiating(false)
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
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CreditCard className="w-8 h-8 text-purple-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Khalti Payment</h2>
          <p className="text-gray-600">Complete your booking payment securely</p>
        </div>

        {customerInfo ? (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-3">Service Details</h3>
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">Service:</span> {formData.service}</p>
                <p><span className="font-medium">Date:</span> {formData.date}</p>
                <p><span className="font-medium">Time:</span> {startTime} - {endTime}</p>
                <p><span className="font-medium">Amount:</span> <span className="text-2xl font-bold text-purple-600">Rs. {formData.final_price}</span></p>
              </div>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="font-semibold text-purple-800 mb-3">Customer Information</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center">
                  <User className="w-4 h-4 text-purple-600 mr-2" />
                  <span>{customerInfo.name}</span>
                </div>
                <div className="flex items-center">
                  <Mail className="w-4 h-4 text-purple-600 mr-2" />
                  <span>{customerInfo.email}</span>
                </div>
                <div className="flex items-center">
                  <Phone className="w-4 h-4 text-purple-600 mr-2" />
                  <span>{customerInfo.phone}</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleKhaltiPayment}
              disabled={paymentInitiating}
              className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white font-bold py-3 px-6 rounded-lg hover:from-purple-700 hover:to-purple-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105"
            >
              {paymentInitiating ? 'Redirecting to Khalti...' : 'Pay with Khalti'}
            </button>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-red-600">Please complete personal information first</p>
            <button
              onClick={onClose}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Go Back
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// Main BookingForm component
export default function BookingForm() {
  const navigate = useNavigate()
  const { service, technicianId, finalPrice } = useParams()

  const [formData, setFormData] = useState({
    fname: '',
    lname: '',
    email: '',
    phone: '',
    address: '',
    apartment: '',
    city: '',
    date: '',
    specialInstructions: '',
    contactPreference: 'phone',
    emergencyContact: '',
    emergencyPhone: '',
    latitude: '',
    longitude: '',
    service: service,
    technician_id: technicianId,
    final_price: finalPrice,
    paymentMethod: 'cash'
  })

  const [showMapOverlay, setShowMapOverlay] = useState(false)
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [currentStep, setCurrentStep] = useState(1)
  const [agreed, setAgreed] = useState(false)
  const [errors, setErrors] = useState({})
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [showKhaltiOverlay, setShowKhaltiOverlay] = useState(false)
  const [showPaymentCallback, setShowPaymentCallback] = useState(false)
  const totalSteps = 5

  // Enhanced callback detection
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const allPidx = urlParams.getAll('pidx')
    const pidx = allPidx.find(p => p && p.trim() !== '') || null

    if (pidx) {
      setShowPaymentCallback(true)
    }
  }, [])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    if (name === 'startTime') {
      setStartTime(value)
    } else if (name === 'endTime') {
      setEndTime(value)
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  const validateStep = (step) => {
    const newErrors = {}

    if (step === 1) {
      if (!formData.fname.trim()) newErrors.fname = 'First name is required'
      else if (!/^[A-Za-z]+$/.test(formData.fname)) newErrors.fname = 'First name should contain alphabets only'

      if (!formData.lname.trim()) newErrors.lname = 'Last name is required'
      else if (!/^[A-Za-z]+$/.test(formData.lname)) newErrors.lname = 'Last name should contain alphabets only'

      if (!formData.email.trim()) newErrors.email = 'Email is required'
      else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid'

      if (!formData.phone.trim()) newErrors.phone = 'Phone number is required'
      else if (!/^\d{10}$/.test(formData.phone.trim())) newErrors.phone = 'Phone number must be of 10 digits'
    }

    if (step === 2) {
      if (!formData.address.trim()) newErrors.address = 'Street address is required'
      if (!formData.city.trim()) newErrors.city = 'City is required'
    }

    if (step === 3) {
      if (!formData.date) newErrors.date = 'Date is required'
      if (!startTime) newErrors.startTime = 'Start time is required'
      if (!endTime) newErrors.endTime = 'End time is required'
      if (startTime && endTime && startTime >= endTime) {
        newErrors.endTime = 'End time must be after start time'
      }
    }

    if (step === 4) {
      if (!agreed) newErrors.checkbox = 'Please accept terms and conditions'
    }

    if (step === 5) {
      if (!formData.paymentMethod) newErrors.paymentMethod = 'Please select a payment method'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const nextStep = () => {
    if (validateStep(currentStep) && currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
      setErrors({})
    }
  }

  const handleKhaltiPayment = () => {
    if (validateStep(5)) {
      setShowKhaltiOverlay(true)
    }
  }

  const handleCashBooking = async () => {
    if (!validateStep(5)) return

    let finalFormData = { ...formData }

    // Handle geocoding if needed
    if (!formData.latitude || !formData.longitude) {
      const location = formData.address

      try {
        const geoResponse = await fetch(`${API_BASE_URL}/geocode?q=${encodeURIComponent(location)}`, {
          method: 'GET',
          credentials: 'include',
        })
        const geoData = await geoResponse.json()

        if (geoData.error) {
          console.error(geoData.error)
          alert('Error getting location coordinates: ' + geoData.error)
          return
        } else {
          finalFormData.latitude = geoData.lat
          finalFormData.longitude = geoData.lon
        }
      } catch (error) {
        console.error('Geocoding error:', error)
        alert('Error getting location coordinates')
        return
      }
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/bookings/create`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          technician_id: finalFormData.technician_id,
          fname: finalFormData.fname,
          lname: finalFormData.lname,
          email: finalFormData.email,
          phoneNumber: finalFormData.phone,
          streetAddress: finalFormData.address,
          apartMent: finalFormData.apartment,
          cityAddress: finalFormData.city,
          service: finalFormData.service,
          emergencyContactName: finalFormData.emergencyContact,
          emergencyContactPhone: finalFormData.emergencyPhone,
          scheduled_date: finalFormData.date,
          scheduled_StartTime: startTime,
          scheduled_EndTime: endTime,
          specialInstructions: finalFormData.specialInstructions,
          contactPreference: finalFormData.contactPreference,
          latitude: finalFormData.latitude || '0',
          longitude: finalFormData.longitude || '0',
          final_price: finalFormData.final_price || '0',
          paymentMethod: finalFormData.paymentMethod
        })
      })

      const data = await response.json()

      if (response.ok) {
        setShowSuccessMessage(true)
        setTimeout(() => {
          navigate('/client/dashboard', { replace: true })
        }, 5000)
      } else {
        console.error('Error creating booking:', data.error)
        alert('Error creating booking: ' + data.error)
      }
    } catch (error) {
      console.error('Network error:', error)
      alert('Network error occurred while creating booking')
    }
  }

  // Show payment callback if needed
  if (showPaymentCallback) {
    return (
      <PaymentCallback
        onComplete={(success) => {
          if (success) {
            setShowSuccessMessage(true)
            setTimeout(() => {
              navigate('/client/dashboard', { replace: true })
            }, 3000)
          } else {
            sessionStorage.removeItem('pendingBookingData')
            sessionStorage.removeItem('khaltiPaymentData')
            setShowPaymentCallback(false)
            setFormData(prev => ({ ...prev, paymentMethod: 'cash' }))
            window.history.replaceState({}, document.title, window.location.pathname)
          }
        }}
      />
    )
  }

  const renderProgressBar = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-2">
        {[1, 2, 3, 4, 5].map((step) => (
          <div
            key={step}
            className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold ${step <= currentStep
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-600'
              }`}
          >
            {step}
          </div>
        ))}
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${(currentStep / totalSteps) * 100}%` }}
        ></div>
      </div>
      <div className="flex justify-between mt-2 text-xs text-gray-600">
        <span>Personal Info</span>
        <span>Address</span>
        <span>Schedule</span>
        <span>Review</span>
        <span>Payment</span>
      </div>
    </div>
  )

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="flex items-center mb-6">
        <User className="w-6 h-6 text-blue-600 mr-3" />
        <h2 className="text-2xl font-bold text-gray-800">Personal Information</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            First Name *
          </label>
          <input
            type="text"
            name="fname"
            value={formData.fname}
            onChange={handleInputChange}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.fname ? 'border-red-500' : 'border-gray-300'
              }`}
            required
          />
          {errors.fname && <p className="text-red-500 text-xs mt-1">{errors.fname}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Last Name *
          </label>
          <input
            type="text"
            name="lname"
            value={formData.lname}
            onChange={handleInputChange}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.lname ? 'border-red-500' : 'border-gray-300'
              }`}
            required
          />
          {errors.lname && <p className="text-red-500 text-xs mt-1">{errors.lname}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Mail className="w-4 h-4 inline mr-1" />
            Email Address *
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
            required
          />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Phone className="w-4 h-4 inline mr-1" />
            Phone Number *
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            placeholder='9800000000'
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.phone ? 'border-red-500' : 'border-gray-300'
              }`}
            required
          />
          {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Preferred Contact Method
        </label>
        <div className="flex space-x-4">
          <label className="flex items-center">
            <input
              type="radio"
              name="contactPreference"
              value="phone"
              checked={formData.contactPreference === 'phone'}
              onChange={handleInputChange}
              className="mr-2"
            />
            Phone
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="contactPreference"
              value="email"
              checked={formData.contactPreference === 'email'}
              onChange={handleInputChange}
              className="mr-2"
            />
            Email
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="contactPreference"
              value="text"
              checked={formData.contactPreference === 'text'}
              onChange={handleInputChange}
              className="mr-2"
            />
            Text Message
          </label>
        </div>
      </div>
    </div>
  )

  const renderStep2 = () => (
    <>
      <div className="space-y-6">
        <div className="flex items-center mb-6">
          <MapPin className="w-6 h-6 text-blue-600 mr-3" />
          <h2 className="text-2xl font-bold text-gray-800">Service Address</h2>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Street Address *
          </label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            placeholder="123 Main Street"
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.address ? 'border-red-500' : 'border-gray-300'
              }`}
            required
          />
          {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Apartment/Unit (Optional)
          </label>
          <input
            type="text"
            name="apartment"
            value={formData.apartment}
            onChange={handleInputChange}
            placeholder="Apt 4B, Unit 205, etc."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            City *
          </label>
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleInputChange}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.city ? 'border-red-500' : 'border-gray-300'
              }`}
            required
          />
          {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
        </div>

        <button
          type="button"
          onClick={() => {
            setFormData(prev => ({ ...prev, address: prev.address || " ", city: prev.city || ' ' }))
            setShowMapOverlay(true)
          }}
          className="px-4 py-3 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-lg text-sm font-medium"
        >
          Select from Map
        </button>

        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">Emergency Contact (Optional)</h3>
          <p className="text-sm text-blue-700 mb-3">
            In case we need to reach someone if you're not available during the service.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              name="emergencyContact"
              value={formData.emergencyContact}
              onChange={handleInputChange}
              placeholder="Emergency contact name"
              className="px-3 py-2 border border-blue-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="tel"
              name="emergencyPhone"
              value={formData.emergencyPhone}
              onChange={handleInputChange}
              placeholder="Emergency contact phone"
              className="px-3 py-2 border border-blue-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {showMapOverlay && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="relative w-[100vw] h-[100vh] bg-white rounded shadow-xl">
            <SelectLocationOverlay
              onClose={() => setShowMapOverlay(false)}
              onLocationConfirm={({ lat, lon, name, cityName }) => {
                setFormData(prev => ({ ...prev, address: name, latitude: lat, longitude: lon, city: cityName }))
                setShowMapOverlay(false)
              }}
            />
          </div>
        </div>
      )}
    </>
  )

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="flex items-center mb-6">
        <Calendar className="w-6 h-6 text-blue-600 mr-3" />
        <h2 className="text-2xl font-bold text-gray-800">Schedule Service</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Preferred Date *
          </label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleInputChange}
            min={new Date().toISOString().split('T')[0]}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.date ? 'border-red-500' : 'border-gray-300'
              }`}
            required
          />
          {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Clock className="w-4 h-4 inline mr-1" />
            Time Slot *
          </label>
          <div className="flex gap-2">
            <input
              type="time"
              name="startTime"
              value={startTime}
              onChange={handleInputChange}
              className={`flex-1 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.startTime ? 'border-red-500' : 'border-gray-300'
                }`}
              required
            />
            <input
              type="time"
              name="endTime"
              value={endTime}
              onChange={handleInputChange}
              className={`flex-1 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.endTime ? 'border-red-500' : 'border-gray-300'
                }`}
              required
            />
          </div>
          {(errors.startTime || errors.endTime) && (
            <p className="text-red-500 text-xs mt-1">
              {errors.startTime || errors.endTime}
            </p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Special Instructions (Optional)
        </label>
        <textarea
          name="specialInstructions"
          value={formData.specialInstructions}
          onChange={handleInputChange}
          rows="4"
          placeholder="Any specific instructions for our service provider? (e.g., parking instructions, gate codes, pet information, etc.)"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
        ></textarea>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="font-semibold text-yellow-800 mb-2">Important Notes:</h3>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>• Please ensure someone 18+ is present during the service</li>
          <li>• Our service provider will call 15-30 minutes before arrival</li>
          <li>• Cancellations must be made at least 24 hours in advance</li>
        </ul>
      </div>
    </div>
  )

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="flex items-center mb-6">
        <CheckCircle className="w-6 h-6 text-blue-600 mr-3" />
        <h2 className="text-2xl font-bold text-gray-800">Review & Terms</h2>
      </div>

      <div className="bg-gray-50 rounded-lg p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-gray-800 mb-3">Contact Information</h3>
            <div className="space-y-2 text-sm">
              <p><span className="font-medium">Name:</span> {formData.fname} {formData.lname}</p>
              <p><span className="font-medium">Email:</span> {formData.email}</p>
              <p><span className="font-medium">Phone:</span> {formData.phone}</p>
              <p><span className="font-medium">Contact via:</span> {formData.contactPreference}</p>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-800 mb-3">Service Address</h3>
            <div className="space-y-2 text-sm">
              <p>{formData.address}</p>
              {formData.apartment && <p>{formData.apartment}</p>}
              <p>{formData.city}</p>
            </div>
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-gray-800 mb-3">Service Schedule</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <p><span className="font-medium">Date:</span> {formData.date}</p>
            <p><span className="font-medium">Time:</span> {startTime} - {endTime}</p>
          </div>
          {formData.specialInstructions && (
            <div className="mt-3">
              <p className="font-medium text-sm">Special Instructions:</p>
              <p className="text-sm text-gray-600 mt-1">{formData.specialInstructions}</p>
            </div>
          )}
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 mb-2">Service Cost</h3>
          <div className="text-2xl font-bold text-blue-900">Rs. {finalPrice || '0'}</div>
          <p className="text-sm text-blue-700 mt-1">Final price includes all applicable taxes and fees</p>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center mb-2">
          <input
            type="checkbox"
            id="terms"
            className="mr-3 h-4 w-4 text-blue-600"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
          />
          <label htmlFor="terms" className="text-sm font-medium text-blue-900">
            I agree to the Terms of Service and Privacy Policy *
          </label>
        </div>
        {errors.checkbox && <p className="text-red-500 text-xs mt-1">{errors.checkbox}</p>}
      </div>
    </div>
  )

  const renderStep5 = () => (
    <div className="space-y-6">
      <div className="flex items-center mb-6">
        <CreditCard className="w-6 h-6 text-blue-600 mr-3" />
        <h2 className="text-2xl font-bold text-gray-800">Payment Method</h2>
      </div>

      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="font-semibold text-gray-800 mb-4">Choose Your Payment Method *</h3>
        <div className="space-y-4">
          <label className={`w-full flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${formData.paymentMethod === 'khalti'
            ? 'border-purple-400 bg-purple-50'
            : 'border-gray-200 bg-white hover:border-gray-300'
            }`}>
            <input
              type="radio"
              name="paymentMethod"
              value="khalti"
              checked={formData.paymentMethod === 'khalti'}
              onChange={handleInputChange}
              className="mr-4 h-4 w-4 text-purple-600"
            />
            <div className="flex-1">
              <div className={`font-medium text-lg ${formData.paymentMethod === 'khalti' ? 'text-purple-800' : 'text-gray-800'
                }`}>
                Pay with Khalti
              </div>
              <div className={`text-sm ${formData.paymentMethod === 'khalti' ? 'text-purple-600' : 'text-gray-600'
                }`}>
                Secure digital wallet payment
              </div>
            </div>
            {formData.paymentMethod === 'khalti' && (
              <div className="ml-4 w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-white" />
              </div>
            )}
          </label>

          <label className={`w-full flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${formData.paymentMethod === 'cash'
            ? 'border-green-400 bg-green-50'
            : 'border-gray-200 bg-white hover:border-gray-300'
            }`}>
            <input
              type="radio"
              name="paymentMethod"
              value="cash"
              checked={formData.paymentMethod === 'cash'}
              onChange={handleInputChange}
              className="mr-4 h-4 w-4 text-green-600"
            />
            <div className="flex-1">
              <div className={`font-medium text-lg ${formData.paymentMethod === 'cash' ? 'text-green-800' : 'text-gray-800'
                }`}>
                Cash on Service Completion
              </div>
              <div className={`text-sm ${formData.paymentMethod === 'cash' ? 'text-green-600' : 'text-gray-600'
                }`}>
                Pay in cash after the service is completed
              </div>
            </div>
            {formData.paymentMethod === 'cash' && (
              <div className="ml-4 w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-white" />
              </div>
            )}
          </label>
        </div>
        {errors.paymentMethod && <p className="text-red-500 text-xs mt-2">{errors.paymentMethod}</p>}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-800 mb-2">Service Cost</h3>
        <div className="text-2xl font-bold text-blue-900">Rs. {finalPrice || '0'}</div>
        <p className="text-sm text-blue-700 mt-1">Final price includes all applicable taxes and fees</p>
      </div>
    </div>
  )

  // Success Message Component
  const SuccessMessage = () => (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Booking Confirmed!</h2>
        <p className="text-gray-600 mb-4">
          Your service has been successfully booked. You will receive a confirmation email shortly.
        </p>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
          <p className="text-sm text-green-800">
            <strong>What's next?</strong><br />
            • You'll receive booking confirmation via email<br />
            • Our technician will contact you before the scheduled time<br />
            • Redirecting to dashboard in a few seconds...
          </p>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      {showSuccessMessage && <SuccessMessage />}

      {/* Khalti Payment Overlay */}
      <KhaltiPaymentOverlay
        isOpen={showKhaltiOverlay}
        onClose={() => setShowKhaltiOverlay(false)}
        formData={formData}
        startTime={startTime}
        endTime={endTime}
        onPaymentComplete={() => {
          setShowKhaltiOverlay(false)
        }}
      />

      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Book Your Service</h1>
                <p className="text-blue-100">Schedule your in-home service in just a few steps</p>
              </div>
              <Home className="w-12 h-12 text-white opacity-80" />
            </div>
          </div>

          <div className="px-8 py-8">
            {renderProgressBar()}

            <div>
              {currentStep === 1 && renderStep1()}
              {currentStep === 2 && renderStep2()}
              {currentStep === 3 && renderStep3()}
              {currentStep === 4 && renderStep4()}
              {currentStep === 5 && renderStep5()}

              <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${currentStep === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                >
                  Previous
                </button>

                <div className="text-sm text-gray-500">
                  Step {currentStep} of {totalSteps}
                </div>

                {currentStep < totalSteps ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all duration-200 transform hover:scale-105"
                  >
                    Next Step
                  </button>
                ) : (
                  <div className="flex gap-3">
                    {formData.paymentMethod === 'cash' ? (
                      <button
                        type="button"
                        onClick={handleCashBooking}
                        disabled={!formData.paymentMethod}
                        className="px-8 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
                      >
                        Confirm Booking
                      </button>
                    ) : formData.paymentMethod === 'khalti' ? (
                      <button
                        type="button"
                        onClick={handleKhaltiPayment}
                        className="px-8 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-all duration-200 transform hover:scale-105"
                      >
                        Pay Now
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled
                        className="px-8 py-3 bg-gray-400 text-white rounded-lg font-semibold cursor-not-allowed"
                      >
                        Select Payment Method
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}