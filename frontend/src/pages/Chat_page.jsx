import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ChatBox from '../components/chatBox';
import BookingsList from '../components/BookingsList';
import ClientNavbar from '../components/NavBarForClientAndProfessional';
import SideBar from "../components/SideBar";
import SideBarOverlay from "../components/SideBarOverlay";
import api from '../utils/api';

const ChatPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false); // used for universal SideBar
  const { bookingId } = useParams();
  const [user, setUser] = useState(null);
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const Componentss = [
    { id: '/dashboard', icon: '📊', text: 'Dashboard' },
    { id: '/schedule', icon: '📋', text: 'My Orders' },
    { id: '/earnings', icon: '💰', text: 'Payment' },
    { id: '/chat', icon: '📱', text: 'Messages' },
    { id: '/logout', icon: '⚙️', text: 'Logout' },
  ];

  const handleLogout = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/logoutuser', {
        method: 'GET',
        credentials: 'include',
      });
      const data = await response.json();
      if (data.success) {
        navigate('/client_login', { replace: true });
      } else {
        alert('Logout failed: ' + data.msg);
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    setUser(userData);

    const fetchBooking = async () => {
      if (!bookingId) {
        setLoading(false);
        return;
      }
      try {
        const response = await api.get(`/api/bookings/${bookingId}`);
        setBooking(response.data);
      } catch (error) {
        console.error('Failed to fetch booking:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [bookingId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <ClientNavbar
          isOpen={sidebarOpen}
          setIsOpen={setSidebarOpen}
          fname={user?.fname || ''}
          lname={user?.lname || ''}
          profilePic={user?.profilePic}
          userType={user?.userType}
        />
        <div className="pt-20 flex items-center justify-center h-screen">
          <div className="text-lg">Loading...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Access Denied</h2>
          <p className="text-gray-600">Please log in to access chat.</p>
        </div>
      </div>
    );
  }

  // Determine the other participant
  let otherParticipantId = null;
  let otherParticipantName = '';

  if (booking) {
    const isClient = user.id === booking.client_id?._id;
    otherParticipantId = isClient ? booking.technician_id?._id : booking.client_id?._id;
    otherParticipantName = isClient
      ? `${booking.technician_id?.fname || ''} ${booking.technician_id?.lname || ''}`.trim()
      : `${booking.client_id?.fname || ''} ${booking.client_id?.lname || ''}`.trim();
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <ClientNavbar
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        fname={user.fname}
        lname={user.lname}
        profilePic={user.profilePic}
        userType={user.userType}
      />

      {/* Sidebar Components */}
      <SideBar components={Componentss} isOpen={sidebarOpen} onLogout={handleLogout} />
      <SideBarOverlay isSideBarOpen={sidebarOpen} setIsSideBarOpen={setSidebarOpen} />

      {/* Main layout */}
      <div className="pt-20 flex h-screen lg:ml-[280px]">
        {/* Chat sidebar with bookings */}
        <div className="hidden lg:block w-[300px] border-r bg-white">
          <BookingsList currentUser={user} />
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {bookingId && booking ? (
            <>
              {/* Chat Header */}
              <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setSidebarOpen(true)}
                    className="lg:hidden p-2 rounded-md hover:bg-gray-100"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>

                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                    {otherParticipantName.charAt(0).toUpperCase()}
                  </div>

                  <div>
                    <h2 className="text-lg font-semibold text-gray-800">
                      {otherParticipantName || 'Unknown User'}
                    </h2>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <span>{booking.service}</span>
                      <span>•</span>
                      <span className={`px-2 py-1 text-xs rounded-full ${booking.booking_status === 'confirmed' ? 'bg-green-100 text-green-800' :
                          booking.booking_status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                            'bg-yellow-100 text-yellow-800'
                        }`}>
                        {booking.booking_status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* ChatBox */}
              <div className="flex-1 overflow-hidden">
                <ChatBox
                  bookingId={bookingId}
                  userId={user.id}
                  technicianId={user.userType === 'client' ? otherParticipantId : user.id}
                />
              </div>
            </>
          ) : (
            /* Welcome screen if no booking selected */
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-semibold text-gray-800 mb-2">Welcome to Chat</h2>
                <p className="text-gray-600 mb-4">Select a booking from the sidebar to start chatting</p>
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Open Menu
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
