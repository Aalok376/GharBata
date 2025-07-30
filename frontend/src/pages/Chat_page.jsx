import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import ChatBox from '../components/chatBox'
import api from '../utils/api'

const ChatPage = () => {
  const { bookingId } = useParams()
  const [booking, setBooking] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentUserId, setCurrentUserId] = useState(null)
  const [showMobileBookings, setShowMobileBookings] = useState(false)

  useEffect(() => {
    const fetchBooking = async () => {
      if (!bookingId) {
        setLoading(false)
        return
      }
      try {
        const response = await api.get(`/api/bookings/${bookingId}`)
        setBooking(response.data)
        
        // Get current user ID from localStorage
        const userData = JSON.parse(localStorage.getItem('user') || '{}')
        setCurrentUserId(userData.id)
      } catch (error) {
        console.error('Failed to fetch booking:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchBooking()
  }, [bookingId])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 flex items-center space-x-4">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
          <div className="text-xl font-medium text-gray-700">Loading chat...</div>
        </div>
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Booking Not Found</h2>
          <p className="text-gray-600">The requested booking could not be found or you don't have access to it.</p>
        </div>
      </div>
    )
  }

  // Determine the other participant
  let otherParticipantId = null
  let otherParticipantName = ''
  let isClient = false

  if (booking && currentUserId) {
    isClient = currentUserId === booking.client_id?._id
    otherParticipantId = isClient ? booking.technician_id?._id : booking.client_id?._id
    otherParticipantName = isClient
      ? `${booking.technician_id?.fname || ''} ${booking.technician_id?.lname || ''}`.trim()
      : `${booking.client_id?.fname || ''} ${booking.client_id?.lname || ''}`.trim()
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200'
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    }
  }

  return (
    <div className="h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex overflow-hidden">
      {/* Mobile Bookings Overlay */}
      {showMobileBookings && (
        <div className="md:hidden fixed inset-0 z-50 bg-black bg-opacity-50" onClick={() => setShowMobileBookings(false)}>
          <div className="bg-white w-80 h-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b bg-gradient-to-r from-blue-600 to-purple-600 text-white">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Your Conversations</h2>
                <button
                  onClick={() => setShowMobileBookings(false)}
                  className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <BookingsList currentUserId={currentUserId} />
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className="hidden md:flex w-80 bg-white border-r border-gray-200 shadow-lg flex-col">
        <div className="p-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <h2 className="text-xl font-bold">Your Conversations</h2>
          <p className="text-blue-100 text-sm mt-1">Select a booking to start chatting</p>
        </div>
        <div className="flex-1 overflow-hidden">
          <BookingsList currentUserId={currentUserId} />
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {bookingId && booking ? (
          <>
            {/* Enhanced Chat Header */}
            <div className="bg-white border-b border-gray-200 shadow-sm">
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {/* Mobile Menu Button */}
                  <button
                    onClick={() => setShowMobileBookings(true)}
                    className="md:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>

                  {/* User Avatar */}
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                      {otherParticipantName.charAt(0).toUpperCase()}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                  </div>

                  {/* User Info */}
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-gray-800">
                      {otherParticipantName || 'Unknown User'}
                    </h2>
                    <div className="flex items-center space-x-3 mt-1">
                      <span className="text-sm text-gray-600 font-medium">{booking.service}</span>
                      <span className="text-gray-300">•</span>
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(booking.booking_status)}`}>
                        {booking.booking_status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </button>
                  <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* ChatBox */}
            <div className="flex-1 overflow-hidden bg-gray-50">
              <ChatBox
                bookingId={bookingId}
                userId={currentUserId}
                technicianId={isClient ? otherParticipantId : currentUserId}
              />
            </div>
          </>
        ) : (
          /* Enhanced Welcome Screen */
          <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 p-8">
            <div className="text-center max-w-md">
              <div className="w-32 h-32 mx-auto mb-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-2xl">
                <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Welcome to Chat</h2>
              <p className="text-gray-600 mb-8 text-lg leading-relaxed">
                Select a booking from the sidebar to start your conversation and connect with your service provider or client.
              </p>
              <button
                onClick={() => setShowMobileBookings(true)}
                className="md:hidden px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                Browse Conversations
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ChatPage 