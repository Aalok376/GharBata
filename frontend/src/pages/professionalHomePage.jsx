import React, { useState, useEffect } from "react"
import ClientNavbar from "../components/NavBarForClientAndProfessional"
import SideBar from "../components/SideBar"
import SideBarOverlay from "../components/SideBarOverlay"
import { useNavigate } from 'react-router-dom'

const ProfessionalPage = () => {

    const [isSideBarOpen, setIsSideBarOpen] = useState(false)
    const [fname, setFname] = useState('')
    const [lname, setLname] = useState('')
    const [profilePic, setProfilePic] = useState('')
    const [technicianId, setTechnicianId] = useState('')
    const [userId, setUserId] = useState('')
    const [technicianData, setTechnicianData] = useState(null)
    const [todaysBookings, setTodaysBookings] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const navigate = useNavigate()
    const [stats, setStats] = useState({
        todaysEarnings: 0,
        weeklyEarnings: 0,
        monthlyEarnings: 0,
        completedJobs: 0,
        averageRating: 0,
        totalRevenue: 0,
        totalBookings: 0,
        pendingJobs: 0,
        confirmedJobs: 0,
        inProgressJobs: 0,
        cancelledJobs: 0,
        rescheduledJobs: 0
    })

    // Navigation functions
    const navigateToJobs = () => navigate(`/professional/bookings/${technicianId}`)
    const navigateToEarnings = () => navigate(`/professional/earnings/${technicianId}`)
    const navigateToReviews = () => navigate(`/professional/reviews/${technicianId}`)

    const Components = [
        { id: `/professional/dashboard`, icon: '📊', text: 'Dashboard' },
        { id: `/professional/bookings/${technicianId}`, icon: '💼', text: 'Jobs' },
        { id: `/professional/earnings/${technicianId}`, icon: '💰', text: 'Earnings' },
        { id: `/professional/reviews/${technicianId}`, icon: '⭐', text: 'Reviews' },
        { id: `/dashboard/chats/${userId}`, icon: '📱', text: 'Messages' },
        { id: '/logout', icon: '⚙️', text: 'Logout' },
    ]

    // Fetch technician profile data
    const fetchProfile = async () => {
        try {
            const profileResponse = await fetch('http://localhost:5000/api/technicians/getTechnicians', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({})
            })

            if (!profileResponse.ok) {
                throw new Error('Failed to fetch profile')
            }

            let profileData = await profileResponse.json()
            console.log('Profile data:', profileData)

            profileData = Array.isArray(profileData) ? profileData : [profileData]
            const prof = profileData[0].technician || {}

            if (prof) {
                setFname(prof.user?.fname || '')
                setLname(prof.user?.lname || '')
                setUserId(prof.user?._id || '')
                setTechnicianData(prof)
                setTechnicianId(prof._id || '')
                setProfilePic(prof?.profilePic || '')

                // Calculate average rating across all professions
                let totalRating = 0
                let totalCount = 0
                if (prof.rating) {
                    Object.values(prof.rating).forEach(rating => {
                        if (rating.average && rating.totalRatings) {
                            totalRating += rating.average * rating.totalRatings
                            totalCount += rating.totalRatings
                        }
                    })
                }
                const averageRating = totalCount > 0 ? (totalRating / totalCount).toFixed(1) : 0

                // Set initial stats from profile data
                setStats(prev => ({
                    ...prev,
                    averageRating: averageRating,
                    completedJobs: prof.tasksCompleted || 0
                }))

                // Fetch today's bookings and stats after getting technician ID
                if (prof._id) {
                    await fetchTodaysBookings(prof._id)
                    await fetchEarningsData(prof._id)
                    await fetchOverviewStats(prof._id) // Fetch overview stats from new API
                }
            }
        } catch (err) {
            console.error('Failed to fetch profile:', err)
            setError('Failed to load profile data')
        }
    }

    // Fetch today's bookings
    const fetchTodaysBookings = async (techId) => {
        try {
            const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD format

            const response = await fetch(`http://localhost:5000/api/bookings/technician/${techId}/today`, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    "Content-Type": "application/json",
                }
            })

            if (response.ok) {
                const bookings = await response.json()
                setTodaysBookings(bookings || [])
            } else {
                console.error('Failed to fetch today\'s bookings')
                setTodaysBookings([])
            }
        } catch (err) {
            console.error('Error fetching today\'s bookings:', err)
            setTodaysBookings([])
        }
    }

    // Fetch earnings data
    const fetchEarningsData = async (techId) => {
        try {
            const response = await fetch(`http://localhost:5000/api/bookings/technician/${techId}/earnings`, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    "Content-Type": "application/json",
                }
            })

            if (response.ok) {
                const earningsData = await response.json()
                setStats(prev => ({
                    ...prev,
                    todaysEarnings: earningsData.todaysEarnings || 0,
                    weeklyEarnings: earningsData.weeklyEarnings || 0,
                    monthlyEarnings: earningsData.monthlyEarnings || 0
                }))
            } else {
                console.error('Failed to fetch earnings data')
            }
        } catch (err) {
            console.error('Error fetching earnings data:', err)
        }
    }

    // Fetch overview stats from the new API - FIXED
    const fetchOverviewStats = async (techId) => {
        try {
            const response = await fetch(`http://localhost:5000/api/bookings/stats/overview?technician_id=${techId}`, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    "Content-Type": "application/json",
                }
            })

            if (response.ok) {
                const statsData = await response.json()
                console.log('Overview stats response:', statsData) // Debug log

                // Handle both array and direct object responses
                let overviewData = null
                if (Array.isArray(statsData) && statsData.length > 0) {
                    // If it's an array, get the first item
                    overviewData = statsData[0].stats || statsData[0]
                } else if (statsData && typeof statsData === 'object' && !Array.isArray(statsData)) {
                    // If it's an object, check if it has a 'stats' property
                    overviewData = statsData.stats || statsData
                }

                if (overviewData) {
                    console.log('Processing overview data:', overviewData) // Debug log
                    setStats(prev => ({
                        ...prev,
                        completedJobs: overviewData.completed || 0,
                        averageRating: overviewData.avg_rating ? parseFloat(overviewData.avg_rating).toFixed(1) : '0.0',
                        totalRevenue: overviewData.total_revenue || 0,
                        totalBookings: overviewData.total_bookings || 0,
                        pendingJobs: overviewData.pending || 0,
                        confirmedJobs: overviewData.confirmed || 0,
                        inProgressJobs: overviewData.in_progress || 0,
                        cancelledJobs: overviewData.cancelled || 0,
                        rescheduledJobs: overviewData.rescheduled || 0
                    }))
                } else {
                    console.log('No overview data found in response')
                }
            } else {
                console.error('Failed to fetch overview stats, status:', response.status)
                const errorText = await response.text()
                console.error('Error response:', errorText)
            }
        } catch (err) {
            console.error('Error fetching overview stats:', err)
        }
    }

    useEffect(() => {
        const loadData = async () => {
            setLoading(true)
            await fetchProfile()
            setLoading(false)
        }
        loadData()
    }, [])

    const handleLogout = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/auth/logoutuser', {
                method: 'GET',
                credentials: 'include',
            })
            const data = await response.json()

            if (data.success) {
                sessionStorage.clear()
                navigate('/gharbata/login', { replace: true })
                window.location.reload()
            } else {
                alert('Logout failed: ' + data.msg)
            }
        } catch (error) {
            console.error('Logout error:', error)
        }
    }

    const formatTime = (time) => {
        if (!time) return 'N/A'
        return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        })
    }

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A'
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        })
    }

    const getBookingStatusColor = (status) => {
        switch (status) {
            case 'confirmed': return 'bg-blue-500'
            case 'in_progress': return 'bg-orange-500'
            case 'completed': return 'bg-green-500'
            case 'pending': return 'bg-purple-500'
            case 'cancelled': return 'bg-red-500'
            default: return 'bg-gray-500'
        }
    }

    const getBookingStatusText = (status) => {
        switch (status) {
            case 'confirmed': return 'Confirmed'
            case 'in_progress': return 'In Progress'
            case 'completed': return 'Completed'
            case 'pending': return 'Pending'
            case 'cancelled': return 'Cancelled'
            default: return status
        }
    }

    const getBookingBorderColor = (status) => {
        switch (status) {
            case 'confirmed': return 'border-l-blue-500'
            case 'in_progress': return 'border-l-orange-500'
            case 'completed': return 'border-l-green-500'
            case 'pending': return 'border-l-purple-500'
            case 'cancelled': return 'border-l-red-500'
            default: return 'border-l-gray-400'
        }
    }

    const handleUpdateStatus = async (bookingId, newStatus) => {
        try {
            const response = await fetch(`http://localhost:5000/api/bookings/${bookingId}/status`, {
                method: 'PUT',
                credentials: 'include',
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    status: newStatus,
                    technician_id: technicianId
                })
            })

            if (response.ok) {
                // Refresh bookings data
                await fetchTodaysBookings(technicianId)
                await fetchEarningsData(technicianId)
                await fetchOverviewStats(technicianId) // Also refresh overview stats
            } else {
                console.error('Failed to update booking status')
            }
        } catch (err) {
            console.error('Error updating booking status:', err)
        }
    }

    // Show loading state
    if (loading) {
        return (
            <div className="font-inter bg-gradient-to-br from-slate-900 to-slate-800 min-h-screen flex items-center justify-center text-white">
                <div>Loading dashboard...</div>
            </div>
        )
    }

    // Show error state
    if (error) {
        return (
            <div className="font-inter bg-gradient-to-br from-slate-900 to-slate-800 min-h-screen flex items-center justify-center text-white">
                <div>Error: {error}</div>
            </div>
        )
    }

    const getGreeting = () => {
        const hour = new Date().getHours()
        if (hour < 12) return 'Good morning'
        if (hour < 17) return 'Good afternoon'
        return 'Good evening'
    }

    return (
        <>
            <div className="font-inter bg-gradient-to-br from-slate-900 to-slate-800 min-h-screen text-gray-800">
                <ClientNavbar
                    isOpen={isSideBarOpen}
                    setIsOpen={setIsSideBarOpen}
                    fname={fname}
                    lname={lname}
                    profilePic={profilePic}
                    userType={'technician'}
                    userId={userId}
                />
                <SideBarOverlay isSideBarOpen={isSideBarOpen} setIsSideBarOpen={setIsSideBarOpen} />
                <div className="flex mt-18">
                    <SideBar components={Components} isOpen={isSideBarOpen} onLogout={handleLogout} />
                    <main className="ml-70 p-8 overflow-y-auto transition-all duration-300 ease-in-out flex-1">
                        {/* Header */}
                        <header className="flex justify-between items-center mb-12 bg-white bg-opacity-90 backdrop-blur-lg p-6 rounded-2xl shadow-lg">
                            <div className="text-gray-800">
                                <h2 className="text-3xl font-semibold mb-2">{getGreeting()}, {fname}!</h2>
                                <p className="text-gray-600 text-lg">Ready for another productive day</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="text-center p-4 bg-slate-100 rounded-2xl text-slate-700">
                                    <div className="text-2xl font-bold">Rs.{stats.todaysEarnings}</div>
                                    <div className="text-sm opacity-80">Today's Earnings</div>
                                </div>
                            </div>
                        </header>

                        {/* Stats Grid */}
                        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
                            <div className="bg-white bg-opacity-90 backdrop-blur-lg rounded-2xl p-8 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                                <div className="flex justify-between items-center mb-4">
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-red-400 to-red-600 flex items-center justify-center text-2xl text-white">
                                        📋
                                    </div>
                                </div>
                                <div className="text-4xl font-bold text-gray-800 mb-2">{todaysBookings.length}</div>
                                <div className="text-gray-600">Jobs Today</div>
                            </div>

                            <div className="bg-white bg-opacity-90 backdrop-blur-lg rounded-2xl p-8 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                                <div className="flex justify-between items-center mb-4">
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-green-400 to-green-600 flex items-center justify-center text-2xl text-white">
                                        💵
                                    </div>
                                </div>
                                <div className="text-4xl font-bold text-gray-800 mb-2">Rs.{stats.weeklyEarnings}</div>
                                <div className="text-gray-600">This Week</div>
                            </div>

                            <div className="bg-white bg-opacity-90 backdrop-blur-lg rounded-2xl p-8 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                                <div className="flex justify-between items-center mb-4">
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center text-2xl text-white">
                                        ⭐
                                    </div>
                                </div>
                                <div className="text-4xl font-bold text-gray-800 mb-2">{stats.averageRating}</div>
                                <div className="text-gray-600">Average Rating</div>
                            </div>

                            <div className="bg-white bg-opacity-90 backdrop-blur-lg rounded-2xl p-8 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                                <div className="flex justify-between items-center mb-4">
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-purple-400 to-purple-600 flex items-center justify-center text-2xl text-white">
                                        ✅
                                    </div>
                                </div>
                                <div className="text-4xl font-bold text-gray-800 mb-2">{stats.completedJobs}</div>
                                <div className="text-gray-600">Total Completed</div>
                            </div>
                        </section>

                        {/* Today's Schedule */}
                        <section className="bg-white bg-opacity-90 backdrop-blur-lg rounded-2xl p-8 shadow-lg mb-12">
                            <div className="flex justify-between items-center mb-8">
                                <h3 className="text-2xl font-semibold text-gray-800">Today's Schedule</h3>
                                <button
                                    className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:from-blue-600 hover:to-blue-700"
                                    onClick={() => navigateToJobs()}
                                >
                                    View All Jobs
                                </button>
                            </div>

                            {todaysBookings.length > 0 ? (
                                todaysBookings.map((booking, index) => (
                                    <div key={booking._id || index} className={`flex flex-col lg:flex-row lg:items-center p-6 bg-white bg-opacity-70 rounded-2xl mb-4 transition-all duration-300 hover:translate-x-1 hover:bg-opacity-90 border-l-4 ${getBookingBorderColor(booking.booking_status)}`}>
                                        <div className="w-full lg:w-24 text-center font-bold text-slate-800 mb-4 lg:mb-0 lg:mr-8">
                                            <div className="text-lg">
                                                {formatTime(booking.scheduled_StartTime)} - {formatTime(booking.scheduled_EndTime)}
                                            </div>
                                            <div className="text-sm text-gray-600">
                                                {booking.scheduled_StartTime && booking.scheduled_EndTime &&
                                                    `${Math.ceil((new Date(`2000-01-01T${booking.scheduled_EndTime}`) - new Date(`2000-01-01T${booking.scheduled_StartTime}`)) / (1000 * 60))} min`
                                                }
                                            </div>
                                        </div>

                                        <div className="flex-1 mb-4 lg:mb-0">
                                            <div className="font-semibold text-gray-800 text-lg mb-2">{booking.service}</div>
                                            <div className="text-gray-600 text-sm flex flex-wrap gap-4 mb-2">
                                                <span>📍 {booking.streetAddress}, {booking.cityAddress}</span>
                                                <span>👤 {booking.fname} {booking.lname}</span>
                                                <span>💰 Rs.{booking.final_price}</span>
                                                <span>📞 {booking.phoneNumber}</span>
                                                <span>📅 {formatDate(booking.scheduled_date)}</span>
                                            </div>
                                            {booking.specialInstructions && (
                                                <div className="text-gray-700 text-sm italic mt-2 p-2 bg-yellow-100 rounded-lg">
                                                    📝 {booking.specialInstructions}
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex flex-col gap-2 items-end">
                                            <div className={`px-3 py-1 rounded-full text-sm font-semibold text-white text-center min-w-20 ${getBookingStatusColor(booking.booking_status)}`}>
                                                {getBookingStatusText(booking.booking_status)}
                                            </div>
                                            {booking.booking_status === 'confirmed' && (
                                                <button
                                                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg text-sm font-semibold transition-all duration-300 hover:scale-105 hover:from-amber-600 hover:to-orange-600 shadow-md hover:shadow-lg"
                                                    onClick={() => handleUpdateStatus(booking._id, 'in_progress')}
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1a3 3 0 015.83 1M15 11.05A3 3 0 0113 9H12m-1 5.83A3 3 0 019 13v1m6-4a4 4 0 11-8 0 4 4 0 018 0z" />
                                                    </svg>
                                                    Start Job
                                                </button>
                                            )}
                                            {booking.booking_status === 'in_progress' && (
                                                <button
                                                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg text-sm font-semibold transition-all duration-300 hover:scale-105 hover:from-green-600 hover:to-green-700 shadow-md hover:shadow-lg"
                                                    onClick={() => handleUpdateStatus(booking._id, 'completed')}
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                    Complete
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-12 text-gray-500">
                                    <div className="text-6xl mb-4">📅</div>
                                    <p className="text-xl mb-2">No appointments scheduled for today</p>
                                    <p className="opacity-70">Enjoy your free day!</p>
                                </div>
                            )}
                        </section>

                        {/* Weekly Availability - Enhanced Design */}
                        <section className="bg-white bg-opacity-90 backdrop-blur-lg rounded-2xl p-8 shadow-lg mb-12">
                            <div className="flex justify-between items-center mb-8">
                                <div>
                                    <h3 className="text-2xl font-semibold text-gray-800 mb-2">Weekly Availability</h3>
                                    <p className="text-gray-600">Manage your working hours for each day</p>
                                </div>
                                <button
                                    className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-1.5 rounded-md font-medium text-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:from-blue-600 hover:to-blue-700"
                                    onClick={() => navigate(`/professionalProfilePage/${userId}`)}
                                >
                                    Update Schedule
                                </button>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-4">
                                {technicianData?.availability && Object.entries(technicianData.availability).map(([day, schedule]) => (
                                    <div key={day} className={`relative p-6 rounded-2xl border-2 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${schedule.available
                                            ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 hover:border-green-300'
                                            : 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200 hover:border-gray-300'
                                        }`}>
                                        {/* Status Indicator */}
                                        <div className={`absolute top-2 right-2 w-3 h-3 rounded-full ${schedule.available ? 'bg-green-400' : 'bg-gray-400'
                                            }`}></div>

                                        <div className="text-center">
                                            <div className="font-bold text-gray-800 mb-3 text-lg capitalize">{day}</div>
                                            {schedule.available ? (
                                                <div className="space-y-2">
                                                    <div className="text-sm font-medium text-green-700 bg-green-200 px-3 py-2 rounded-full">
                                                        Available
                                                    </div>
                                                    <div className="text-sm text-gray-700 font-medium">
                                                        {formatTime(schedule.startTime)}
                                                    </div>
                                                    <div className="text-xs text-gray-500">to</div>
                                                    <div className="text-sm text-gray-700 font-medium">
                                                        {formatTime(schedule.endTime)}
                                                    </div>
                                                    <div className="text-xs text-gray-500 mt-2">
                                                        {schedule.startTime && schedule.endTime &&
                                                            `${Math.ceil((new Date(`2000-01-01T${schedule.endTime}`) - new Date(`2000-01-01T${schedule.startTime}`)) / (1000 * 60 * 60))} hours`
                                                        }
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="space-y-2">
                                                    <div className="text-sm font-medium text-gray-600 bg-gray-200 px-3 py-2 rounded-full">
                                                        Not Available
                                                    </div>
                                                    <div className="text-xs text-gray-500 mt-4">
                                                        Day off
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Your Services & Rates - REDUCED SIZE BY 50% */}
                        <section className="bg-white bg-opacity-90 backdrop-blur-lg rounded-2xl p-8 shadow-lg mb-12">
                            <div className="flex justify-between items-center mb-8">
                                <div>
                                    <h3 className="text-2xl font-semibold text-gray-800 mb-2">Your Services & Rates</h3>
                                    <p className="text-gray-600">Manage your service offerings and hourly rates</p>
                                </div>
                                <button
                                    className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-1.5 rounded-md font-medium text-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:from-blue-600 hover:to-blue-700"
                                    onClick={() => navigate(`/professionalProfilePage/${userId}`)}
                                >
                                    Update Rates
                                </button>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                                {technicianData?.professions?.map((profession, index) => (
                                    <div key={index} className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-4 border-2 border-gray-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-indigo-200">
                                        {/* Service Icon */}
                                        <div className="flex justify-center mb-3">
                                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-lg text-white shadow-md">
                                                {profession.includes('Plumb') ? '🔧' :
                                                    profession.includes('Electric') ? '⚡' :
                                                        profession.includes('Clean') ? '🧹' :
                                                            profession.includes('Garden') ? '🌱' :
                                                                profession.includes('Paint') ? '🎨' : '🔨'}
                                            </div>
                                        </div>

                                        {/* Service Name */}
                                        <div className="text-center mb-3">
                                            <h4 className="font-bold text-gray-800 mb-1 text-sm">{profession}</h4>
                                        </div>

                                        {/* Hourly Rate */}
                                        <div className="text-center">
                                            <div className="bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg p-3">
                                                <div className="text-xl font-bold text-green-600 mb-1">
                                                    Rs.{technicianData.hourlyRate?.[profession] || 0}
                                                </div>
                                                <div className="text-xs text-green-700 font-medium">per hour</div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Quick Actions */}
                        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="bg-white bg-opacity-90 backdrop-blur-lg rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:shadow-xl border-2 border-transparent hover:border-blue-300" onClick={() => navigateToJobs()}>
                                <div className="text-5xl mb-4 text-blue-500">📋</div>
                                <div className="font-semibold mb-2 text-gray-800">Manage Jobs</div>
                                <div className="text-gray-600 text-sm">View and update job statuses</div>
                            </div>

                            <div className="bg-white bg-opacity-90 backdrop-blur-lg rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:shadow-xl border-2 border-transparent hover:border-blue-300" onClick={() => navigate(`/professionalProfilePage/${userId}`)}>
                                <div className="text-5xl mb-4 text-blue-500">🕐</div>
                                <div className="font-semibold mb-2 text-gray-800">Update Availability</div>
                                <div className="text-gray-600 text-sm">Set your working hours</div>
                            </div>

                            <div className="bg-white bg-opacity-90 backdrop-blur-lg rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:shadow-xl border-2 border-transparent hover:border-blue-300" onClick={() => navigateToEarnings()}>
                                <div className="text-5xl mb-4 text-blue-500">💰</div>
                                <div className="font-semibold mb-2 text-gray-800">Earnings Report</div>
                                <div className="text-gray-600 text-sm">Track your income</div>
                            </div>

                            <div className="bg-white bg-opacity-90 backdrop-blur-lg rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:shadow-xl border-2 border-transparent hover:border-blue-300" onClick={() => navigateToReviews()}>
                                <div className="text-5xl mb-4 text-blue-500">💬</div>
                                <div className="font-semibold mb-2 text-gray-800">Customer Reviews</div>
                                <div className="text-gray-600 text-sm">View feedback and ratings</div>
                            </div>
                        </section>
                    </main>
                </div>
            </div>
        </>
    )
}

export default ProfessionalPage