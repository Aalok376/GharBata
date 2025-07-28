import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../utils/api';

const BookingsList = ({ currentUser }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const { bookingId: currentBookingId } = useParams();

  useEffect(() => {
    fetchBookings();
  }, [currentUser]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError('');

      // Get user ID - handle different possible user object structures
      const userId = currentUser.id || currentUser._id || currentUser.userId;
      const userType = currentUser.userType || currentUser.role;

      if (!userId) {
        setError('User ID not found');
        setLoading(false);
        return;
      }

      // Fetch bookings based on user type
      const endpoint = userType === 'client'
        ? `/api/bookings/client/${userId}`
        : `/api/bookings/technician/${userId}`;

      console.log('Fetching bookings from:', endpoint);
      const response = await api.get(endpoint);

      // Only show bookings that are active (not cancelled or completed)
      const activeBookings = response.data.filter(booking =>
        ['confirmed', 'in_progress', 'pending', 'rescheduled'].includes(booking.booking_status)
      );

      setBookings(activeBookings);
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
      setError(error.response?.data?.error || 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const getOtherParticipant = (booking) => {
    const userId = currentUser.id || currentUser._id || currentUser.userId;
    const userType = currentUser.userType || currentUser.role;

    if (userType === 'client') {
      return {
        name: `${booking.technician_id?.fname || ''} ${booking.technician_id?.lname || ''}`.trim(),
        avatar: booking.technician_id?.profilePic,
        role: 'Technician',
        id: booking.technician_id?._id
      };
    } else {
      return {
        name: `${booking.client_id?.fname || ''} ${booking.client_id?.lname || ''}`.trim() ||
          `${booking.fname || ''} ${booking.lname || ''}`.trim(),
        avatar: booking.client_id?.profilePic,
        role: 'Client',
        id: booking.client_id?._id
      };
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays < 7) return date.toLocaleDateString('en-US', { weekday: 'short' });
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredBookings = bookings.filter(booking => {
    const otherParticipant = getOtherParticipant(booking);
    return (
      otherParticipant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.service.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const handleBookingClick = (booking) => {
    navigate(`/chat/${booking._id}`);
  };

  if (loading) {
    return (
      <div className="w-80 bg-white border-r border-gray-200 flex items-center justify-center">
        <div className="text-gray-500">Loading bookings...</div>
      </div>
    );
  }

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800 mb-3">Active Bookings</h2>

        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search bookings..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 pl-8 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <svg
            className="absolute left-2 top-2.5 h-4 w-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Bookings List */}
      <div className="flex-1 overflow-y-auto">
        {error && (
          <div className="p-4 text-red-500 text-sm">{error}</div>
        )}

        {filteredBookings.length === 0 ? (
          <div className="p-4 text-gray-500 text-center">
            {searchTerm ? 'No bookings found' : 'No active bookings'}
          </div>
        ) : (
          filteredBookings.map((booking) => {
            const otherParticipant = getOtherParticipant(booking);
            const isSelected = currentBookingId === booking._id;

            return (
              <div
                key={booking._id}
                onClick={() => handleBookingClick(booking)}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${isSelected ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                  }`}
              >
                <div className="flex items-start space-x-3">
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold relative">
                      {otherParticipant.avatar ? (
                        <img
                          src={otherParticipant.avatar}
                          alt={otherParticipant.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        otherParticipant.name.charAt(0).toUpperCase()
                      )}

                      {/* Online indicator (you can implement this based on socket connection) */}
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-sm font-semibold text-gray-900 truncate">
                        {otherParticipant.name || 'Unknown User'}
                      </h3>
                      <span className="text-xs text-gray-500">
                        {formatDate(booking.scheduled_date)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-gray-600 truncate">
                        {booking.service}
                      </p>
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(booking.booking_status)}`}>
                        {booking.booking_status.replace('_', ' ')}
                      </span>
                    </div>

                    {/* Last message preview (you can enhance this with actual last message) */}
                    <p className="text-xs text-gray-500 truncate">
                      Booking ID: #{booking._id.slice(-6)}
                    </p>

                    {/* Additional info */}
                    <div className="flex items-center mt-2 text-xs text-gray-400">
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="truncate">{booking.cityAddress}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={fetchBookings}
          className="w-full p-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
        >
          Refresh Bookings
        </button>
      </div>
    </div>
  );
};

export default BookingsList;