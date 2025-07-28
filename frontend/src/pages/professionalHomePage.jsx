import React, { useState, useEffect } from "react"
import ClientNavbar from "../components/NavBarForClientAndProfessional"
import SideBar from "../components/SideBar"
import SideBarOverlay from "../components/SideBarOverlay"
import { useParams, useNavigate } from 'react-router-dom'

const ProfessionalPage = () => {

    const [isSideBarOpen, setIsSideBarOpen] = useState(false)
    const [fname, setFname] = useState('')
    const [lname, setLname] = useState('')
    const [profilePic, setProfilePic] = useState('')
    const [userId, setuserId] = useState('')
    const [technicianData, setTechnicianData] = useState(null)
    const [todaysBookings, setTodaysBookings] = useState([])
    const [stats, setStats] = useState({
        todaysEarnings: 0,
        weeklyEarnings: 0,
        completedJobs: 0,
        averageRating: 0
    })
    // Navigation functions would use your routing system
    const navigateToJobs = () => console.log('Navigate to jobs')
    const navigateToEarnings = () => console.log('Navigate to earnings')
    const navigateToReviews = () => console.log('Navigate to reviews')

     const Components = [
        { id: `/professional/dashboard`, icon: '📊', text: 'Dashboard' },
        { id: `/professional/jobs/${userId}`, icon: '💼', text: 'Jobs' },
        { id: `/professional/earnings/${userId}`, icon: '💰', text: 'Earnings' },
        { id: `/professional/reviews/${userId}`, icon: '⭐', text: 'Reviews' },
        { id: `/professional/messages/${userId}`, icon: '📱', text: 'Messages' },
        { id: '/logout', icon: '⚙️', text: 'Logout' },
    ]
    useEffect(() => {
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

                let profileData = await profileResponse.json()
                console.log(profileData)
                profileData = Array.isArray(profileData) ? profileData : [profileData]
                const prof = profileData[0].technician || {}

                if (prof) {
                    setFname(prof.user?.fname || '')
                    setLname(prof.user?.lname || '')
                    setuserId(prof.user?._id || '')
                    setTechnicianData(prof)

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

                    setStats(prev => ({
                        ...prev,
                        averageRating: averageRating,
                        completedJobs: prof.tasksCompleted || 0
                    }))
                }

                setProfilePic(prof?.profilePic || '')

            } catch (err) {
                console.error('Failed to fetch profile:', err)
            }
        }

        fetchProfile()
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
                // Use your navigation system here
                window.location.href = '/technician_login'
            } else {
                alert('Logout failed: ' + data.msg)
            }
        } catch (error) {
            console.error('Logout error:', error)
        }
    }

    const formatTime = (time) => {
        return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        })
    }

    const getBookingStatusColor = (status) => {
        switch (status) {
            case 'confirmed': return '#3498db'
            case 'in_progress': return '#f39c12'
            case 'completed': return '#2ecc71'
            case 'pending': return '#9b59b6'
            case 'cancelled': return '#e74c3c'
            default: return '#95a5a6'
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

    return (
        <>
            <div style={{
                fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                background: "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)",
                minHeight: "100vh",
                color: "#333"
            }}>
                <ClientNavbar isOpen={isSideBarOpen} setIsOpen={setIsSideBarOpen} fname={fname} lname={lname} profilePic={profilePic} userType={'technician'} userId={userId}></ClientNavbar>
                <SideBarOverlay isSideBarOpen={isSideBarOpen} setIsSideBarOpen={setIsSideBarOpen} />
                <div className="dashboard">
                    <SideBar components={Components} isOpen={isSideBarOpen} onLogout={handleLogout}></SideBar>
                    <main className="main-content" id="mainContent">
                        <header className="header">
                            <div className="welcome">
                                <h2>Good morning, {fname}!</h2>
                                <p>Ready for another productive day</p>
                            </div>
                            <div className="header-actions">
                                <div className="earnings-display">
                                    <div className="earnings-amount">${stats.todaysEarnings}</div>
                                    <div className="earnings-label">Today's Earnings</div>
                                </div>
                            </div>
                        </header>

                        <section className="stats-grid">
                            <div className="stat-card jobs-today">
                                <div className="stat-header">
                                    <div className="stat-icon">📋</div>
                                </div>
                                <div className="stat-value">{todaysBookings.length}</div>
                                <div className="stat-label">Jobs Today</div>
                            </div>

                            <div className="stat-card total-earnings">
                                <div className="stat-header">
                                    <div className="stat-icon">💵</div>
                                </div>
                                <div className="stat-value">${stats.weeklyEarnings}</div>
                                <div className="stat-label">This Week</div>
                            </div>

                            <div className="stat-card avg-rating">
                                <div className="stat-header">
                                    <div className="stat-icon">⭐</div>
                                </div>
                                <div className="stat-value">{stats.averageRating}</div>
                                <div className="stat-label">Average Rating</div>
                            </div>

                            <div className="stat-card completed-jobs">
                                <div className="stat-header">
                                    <div className="stat-icon">✅</div>
                                </div>
                                <div className="stat-value">{stats.completedJobs}</div>
                                <div className="stat-label">Total Completed</div>
                            </div>
                        </section>

                        <section className="schedule-section">
                            <div className="section-header">
                                <h3>Today's Schedule</h3>
                                <button className="view-all-btn" onClick={() => navigateToJobs()}>
                                    View All Jobs
                                </button>
                            </div>

                            {todaysBookings.length > 0 ? (
                                todaysBookings.map((booking, index) => (
                                    <div key={index} className={`appointment-item ${booking.booking_status}`}>
                                        <div className="appointment-time">
                                            {formatTime(booking.scheduled_time)}
                                        </div>
                                        <div className="appointment-details">
                                            <div className="appointment-title">{booking.service}</div>
                                            <div className="appointment-info">
                                                <span>📍 {booking.streetAddress}, {booking.cityAddress}</span>
                                                <span>👤 {booking.fname} {booking.lname}</span>
                                                <span>💰 ${booking.final_price}</span>
                                                <span>📞 {booking.phoneNumber}</span>
                                            </div>
                                            {booking.specialInstructions && (
                                                <div className="special-instructions">
                                                    📝 {booking.specialInstructions}
                                                </div>
                                            )}
                                        </div>
                                        <div className="appointment-actions">
                                            <div
                                                className="status-badge"
                                                style={{ backgroundColor: getBookingStatusColor(booking.booking_status) }}
                                            >
                                                {getBookingStatusText(booking.booking_status)}
                                            </div>
                                            <button className="action-btn contact-btn" onClick={() => { }}>
                                                Contact
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="no-appointments">
                                    <div className="no-appointments-icon">📅</div>
                                    <p>No appointments scheduled for today</p>
                                    <p className="no-appointments-sub">Enjoy your free day!</p>
                                </div>
                            )}
                        </section>

                        <section className="availability-section">
                            <div className="section-header">
                                <h3>Weekly Availability</h3>
                                <button className="update-btn" onClick={() => { }}>
                                    Update Schedule
                                </button>
                            </div>
                            <div className="availability-grid">
                                {technicianData?.availability && Object.entries(technicianData.availability).map(([day, schedule]) => (
                                    <div key={day} className="availability-day">
                                        <div className="day-name">{day.charAt(0).toUpperCase() + day.slice(1)}</div>
                                        {schedule.available ? (
                                            <div className="time-slot available">
                                                {formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}
                                            </div>
                                        ) : (
                                            <div className="time-slot unavailable">Not Available</div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section className="professions-section">
                            <div className="section-header">
                                <h3>Your Services & Rates</h3>
                                <button className="update-btn" onClick={() => { }}>
                                    Update Rates
                                </button>
                            </div>
                            <div className="professions-grid">
                                {technicianData?.professions?.map((profession, index) => (
                                    <div key={index} className="profession-card">
                                        <div className="profession-name">{profession}</div>
                                        <div className="profession-rate">
                                            ${technicianData.hourlyRate?.[profession] || 0}/hr
                                        </div>
                                        {technicianData.rating?.[profession] && (
                                            <div className="profession-rating">
                                                ⭐ {technicianData.rating[profession].average?.toFixed(1) || 0}
                                                <span className="rating-count">
                                                    ({technicianData.rating[profession].totalRatings || 0} reviews)
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section className="quick-actions">
                            <div className="quick-action-card" onClick={() => navigateToJobs()}>
                                <div className="quick-action-icon">📋</div>
                                <div className="quick-action-title">Manage Jobs</div>
                                <div className="quick-action-desc">View and update job statuses</div>
                            </div>

                            <div className="quick-action-card" onClick={() => { }}>
                                <div className="quick-action-icon">🕐</div>
                                <div className="quick-action-title">Update Availability</div>
                                <div className="quick-action-desc">Set your working hours</div>
                            </div>

                            <div className="quick-action-card" onClick={() => navigateToEarnings()}>
                                <div className="quick-action-icon">💰</div>
                                <div className="quick-action-title">Earnings Report</div>
                                <div className="quick-action-desc">Track your income</div>
                            </div>

                            <div className="quick-action-card" onClick={() => navigateToReviews()}>
                                <div className="quick-action-icon">💬</div>
                                <div className="quick-action-title">Customer Reviews</div>
                                <div className="quick-action-desc">View feedback and ratings</div>
                            </div>
                        </section>
                    </main>
                </div>
            </div>
            <style>
                {`
                .dashboard {
                    display: flex;
                    margin-top: 70px;
                    min-height: calc(100vh - 70px);
                }
        
                .main-content {
                    margin-left: 280px;
                    padding: 2rem;
                    overflow-y: auto;
                    transition: all 0.3s ease;
                    flex: 1;
                }
        
                .main-content.expanded {
                    margin-left: 0;
                }
        
                .header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 3rem;
                    background: rgba(255, 255, 255, 0.9);
                    backdrop-filter: blur(20px);
                    padding: 1.5rem 2rem;
                    border-radius: 20px;
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
                }
        
                .welcome {
                    color: #333;
                }
        
                .welcome h2 {
                    font-size: 2rem;
                    margin-bottom: 0.5rem;
                }
        
                .welcome p {
                    color: #666;
                    font-size: 1.1rem;
                }
        
                .header-actions {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }
        
                .earnings-display {
                    text-align: center;
                    padding: 1rem;
                    background: rgba(52, 152, 219, 0.1);
                    border-radius: 15px;
                    color: #3498db;
                }
        
                .earnings-amount {
                    font-size: 1.5rem;
                    font-weight: 700;
                }
        
                .earnings-label {
                    font-size: 0.8rem;
                    opacity: 0.8;
                }
        
                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 2rem;
                    margin-bottom: 3rem;
                }
        
                .stat-card {
                    background: rgba(255, 255, 255, 0.9);
                    backdrop-filter: blur(20px);
                    border-radius: 20px;
                    padding: 2rem;
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
                    transition: all 0.3s ease;
                }
        
                .stat-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15);
                }
        
                .stat-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1rem;
                }
        
                .stat-icon {
                    width: 50px;
                    height: 50px;
                    border-radius: 15px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.5rem;
                    color: white;
                }
        
                .jobs-today .stat-icon {
                    background: linear-gradient(135deg, #ff6b6b, #ee5a24);
                }
        
                .total-earnings .stat-icon {
                    background: linear-gradient(135deg, #2ecc71, #27ae60);
                }
        
                .avg-rating .stat-icon {
                    background: linear-gradient(135deg, #f39c12, #e67e22);
                }
        
                .completed-jobs .stat-icon {
                    background: linear-gradient(135deg, #9b59b6, #8e44ad);
                }
        
                .stat-value {
                    font-size: 2.5rem;
                    font-weight: 700;
                    color: #333;
                    margin-bottom: 0.5rem;
                }
        
                .stat-label {
                    color: #666;
                    font-size: 1rem;
                }
        
                .schedule-section, .availability-section, .professions-section {
                    background: rgba(255, 255, 255, 0.9);
                    backdrop-filter: blur(20px);
                    border-radius: 20px;
                    padding: 2rem;
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
                    margin-bottom: 3rem;
                }
        
                .section-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 2rem;
                }
        
                .section-header h3 {
                    font-size: 1.5rem;
                    color: #333;
                }
        
                .view-all-btn, .update-btn {
                    background: linear-gradient(135deg, #1e3c72, #2a5298);
                    color: white;
                    border: none;
                    padding: 0.8rem 1.5rem;
                    border-radius: 10px;
                    cursor: pointer;
                    font-weight: 600;
                    transition: all 0.3s ease;
                }
        
                .view-all-btn:hover, .update-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 5px 15px rgba(30, 60, 114, 0.4);
                }
        
                .appointment-item {
                    display: flex;
                    align-items: center;
                    padding: 1.5rem;
                    background: rgba(255, 255, 255, 0.7);
                    border-radius: 15px;
                    margin-bottom: 1rem;
                    transition: all 0.3s ease;
                    border-left: 4px solid #ddd;
                }
        
                .appointment-item:hover {
                    transform: translateX(5px);
                    background: rgba(255, 255, 255, 0.9);
                }
        
                .appointment-item.pending {
                    border-left-color: #9b59b6;
                }
        
                .appointment-item.confirmed {
                    border-left-color: #3498db;
                }
        
                .appointment-item.in_progress {
                    border-left-color: #f39c12;
                }
        
                .appointment-item.completed {
                    border-left-color: #2ecc71;
                }
        
                .appointment-item.cancelled {
                    border-left-color: #e74c3c;
                }
        
                .appointment-time {
                    width: 100px;
                    text-align: center;
                    font-weight: 700;
                    color: #1e3c72;
                    margin-right: 2rem;
                }
        
                .appointment-details {
                    flex: 1;
                }
        
                .appointment-title {
                    font-weight: 600;
                    margin-bottom: 0.5rem;
                    color: #333;
                    font-size: 1.1rem;
                }
        
                .appointment-info {
                    color: #666;
                    font-size: 0.9rem;
                    display: flex;
                    flex-wrap: wrap;
                    gap: 1rem;
                    margin-bottom: 0.5rem;
                }
        
                .special-instructions {
                    color: #555;
                    font-size: 0.85rem;
                    font-style: italic;
                    margin-top: 0.5rem;
                    padding: 0.5rem;
                    background: rgba(241, 196, 15, 0.1);
                    border-radius: 8px;
                }
        
                .appointment-actions {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                    align-items: flex-end;
                }
        
                .status-badge {
                    padding: 0.4rem 0.8rem;
                    border-radius: 20px;
                    font-size: 0.8rem;
                    font-weight: 600;
                    color: white;
                    text-align: center;
                    min-width: 80px;
                }
        
                .action-btn {
                    padding: 0.5rem 1rem;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 0.8rem;
                    font-weight: 600;
                    transition: all 0.3s ease;
                }
        
                .contact-btn {
                    background: rgba(52, 152, 219, 0.2);
                    color: #3498db;
                }
        
                .action-btn:hover {
                    transform: scale(1.05);
                }
        
                .no-appointments {
                    text-align: center;
                    padding: 3rem 2rem;
                    color: #666;
                }
        
                .no-appointments-icon {
                    font-size: 4rem;
                    margin-bottom: 1rem;
                }
        
                .no-appointments p {
                    font-size: 1.2rem;
                    margin-bottom: 0.5rem;
                }
        
                .no-appointments-sub {
                    font-size: 1rem;
                    opacity: 0.7;
                }
        
                .availability-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                    gap: 1rem;
                }
        
                .availability-day {
                    text-align: center;
                    padding: 1rem;
                    background: rgba(255, 255, 255, 0.7);
                    border-radius: 10px;
                }
        
                .day-name {
                    font-weight: 700;
                    color: #333;
                    margin-bottom: 0.5rem;
                    text-transform: capitalize;
                }
        
                .time-slot {
                    font-size: 0.9rem;
                    padding: 0.3rem 0.6rem;
                    border-radius: 15px;
                }
        
                .time-slot.available {
                    background: rgba(46, 204, 113, 0.2);
                    color: #27ae60;
                }
        
                .time-slot.unavailable {
                    background: rgba(149, 165, 166, 0.2);
                    color: #7f8c8d;
                }
        
                .professions-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 1.5rem;
                }
        
                .profession-card {
                    background: rgba(255, 255, 255, 0.7);
                    border-radius: 15px;
                    padding: 1.5rem;
                    text-align: center;
                    transition: all 0.3s ease;
                }
        
                .profession-card:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
                }
        
                .profession-name {
                    font-weight: 700;
                    color: #333;
                    margin-bottom: 0.5rem;
                    font-size: 1.1rem;
                }
        
                .profession-rate {
                    font-size: 1.3rem;
                    color: #2ecc71;
                    font-weight: 700;
                    margin-bottom: 0.5rem;
                }
        
                .profession-rating {
                    color: #f39c12;
                    font-size: 0.9rem;
                }
        
                .rating-count {
                    color: #666;
                    font-size: 0.8rem;
                }
        
                .quick-actions {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 1.5rem;
                }
        
                .quick-action-card {
                    background: rgba(255, 255, 255, 0.9);
                    backdrop-filter: blur(20px);
                    border-radius: 15px;
                    padding: 2rem;
                    text-align: center;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    border: 2px solid transparent;
                }
        
                .quick-action-card:hover {
                    transform: translateY(-8px);
                    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
                    border-color: rgba(30, 60, 114, 0.3);
                }
        
                .quick-action-icon {
                    font-size: 3rem;
                    margin-bottom: 1rem;
                    color: #1e3c72;
                }
        
                .quick-action-title {
                    font-weight: 600;
                    margin-bottom: 0.5rem;
                    color: #333;
                }
        
                .quick-action-desc {
                    color: #666;
                    font-size: 0.9rem;
                }
        
                @media (max-width: 768px) {
                    .dashboard {
                        grid-template-columns: 1fr;
                    }
        
                    .main-content {
                        margin-left: 0;
                    }
        
                    .stats-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }
        
                    .appointment-item {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 1rem;
                    }
        
                    .appointment-time {
                        margin-bottom: 0;
                        margin-right: 0;
                        width: auto;
                    }
        
                    .appointment-info {
                        flex-direction: column;
                        gap: 0.5rem;
                    }
        
                    .appointment-actions {
                        align-items: flex-start;
                    }
        
                    .header {
                        flex-direction: column;
                        gap: 1rem;
                        text-align: center;
                    }
        
                    .availability-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }
        
                    .professions-grid {
                        grid-template-columns: 1fr;
                    }
                }
                `}
            </style>
        </>
    )
}

export default ProfessionalPage