import React, { useState, useEffect } from "react"
import ClientNavbar from "../components/NavBarForClientAndProfessional"
import SideBar from "../components/SideBar"
import SideBarOverlay from "../components/SideBarOverlay"
import { useParams, useNavigate } from 'react-router-dom'

const TechnicianReviewsPage = () => {
    const [isSideBarOpen, setIsSideBarOpen] = useState(false)
    const [fname, setFname] = useState('')
    const [lname, setLname] = useState('')
    const [profilePic, setProfilePic] = useState('')
    const [userId, setUserId] = useState('')
    const [technicianData, setTechnicianData] = useState(null)
    const [reviewsData, setReviewsData] = useState(null)
    const [selectedService, setSelectedService] = useState('all')
    const [sortBy, setSortBy] = useState('newest')
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const { technicianId } = useParams()
    console.log(technicianId)
    const navigate = useNavigate()

    const Components = [
        { id: `/professional/dashboard`, icon: '📊', text: 'Dashboard' },
        { id: `/professional/bookings/${technicianId}`, icon: '💼', text: 'Jobs' },
        { id: `/professional/earnings/${technicianId}`, icon: '💰', text: 'Earnings' },
        { id: `/professional/reviews/${technicianId}`, icon: '⭐', text: 'Reviews' },
        { id: `/dashboard/chat/${userId}`, icon: '📱', text: 'Messages' },
        { id: '/logout', icon: '⚙️', text: 'Logout' },
    ]

    useEffect(() => {
        if (!technicianId) {
            setError('Technician ID not found')
            setLoading(false)
            return
        }

        const fetchTechnicianReviews = async () => {
            try {
                setLoading(true)
                setError(null)

                // Fetch technician reviews and profile data
                const response = await fetch(`http://localhost:5000/api/bookings/${technicianId}/reviews`, {
                    method: 'GET',
                    credentials: 'include',
                    headers: {
                        "Content-Type": "application/json",
                    }
                })

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`)
                }

                const data = await response.json()

                if (!data.success) {
                    throw new Error(data.message || 'Failed to fetch technician data')
                }

                const { technician, reviews } = data.data

                // Set technician data
                setTechnicianData(technician)
                setReviewsData(reviews)

                // Set default service filter to first profession if available
                if (technician.professions && technician.professions.length > 0) {
                    setSelectedService('all') // Start with all services
                }

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

                profileData = Array.isArray(profileData) ? profileData : [profileData]
                const prof = profileData[0].technician || {}

                if (prof) {
                    setFname(prof.user?.fname || '')
                    setLname(prof.user?.lname || '')
                    setUserId(prof.user?._id || '')
                    setProfilePic(prof?.profilePic || '')
                }

            } catch (err) {
                console.error('Failed to fetch technician reviews:', err)
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }

        fetchTechnicianReviews()
    }, [technicianId])

    const handleLogout = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/auth/logoutuser', {
                method: 'GET',
                credentials: 'include',
            })
            const data = await response.json()

            if (data.success) {
                sessionStorage.clear()
                navigate('/gharbata/login')
            } else {
                alert('Logout failed: ' + data.msg)
            }
        } catch (error) {
            console.error('Logout error:', error)
        }
    }

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

    const getFilteredAndSortedReviews = () => {
        if (!reviewsData?.allReviews) return []

        let filteredReviews = [...reviewsData.allReviews]

        // Filter by service
        if (selectedService !== 'all') {
            filteredReviews = filteredReviews.filter(review => review.service === selectedService)
        }

        // Sort reviews
        filteredReviews.sort((a, b) => {
            if (sortBy === 'newest') {
                return new Date(b.reviewDate) - new Date(a.reviewDate)
            } else if (sortBy === 'oldest') {
                return new Date(a.reviewDate) - new Date(b.reviewDate)
            } else if (sortBy === 'highest') {
                return b.rating - a.rating
            } else if (sortBy === 'lowest') {
                return a.rating - b.rating
            }
            return 0
        })

        return filteredReviews
    }

    const renderStars = (rating) => {
        const stars = []
        const fullStars = Math.floor(rating)
        const hasHalfStar = rating % 1 >= 0.5

        for (let i = 0; i < fullStars; i++) {
            stars.push(<span key={i} className="text-yellow-400">⭐</span>)
        }

        if (hasHalfStar) {
            stars.push(<span key="half" className="text-yellow-400">⭐</span>)
        }

        const emptyStars = 5 - Math.ceil(rating)
        for (let i = 0; i < emptyStars; i++) {
            stars.push(<span key={`empty-${i}`} className="text-gray-300">☆</span>)
        }

        return stars
    }

    const getAvailableServices = () => {
        if (!reviewsData?.byService) return []
        return Object.keys(reviewsData.byService)
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 flex items-center justify-center">
                <div className="text-white text-xl">Loading reviews...</div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 flex items-center justify-center">
                <div className="bg-white/90 backdrop-blur-lg rounded-3xl p-8 text-center">
                    <div className="text-red-500 text-6xl mb-4">⚠️</div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Error Loading Reviews</h2>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        )
    }

    const filteredReviews = getFilteredAndSortedReviews()
    const availableServices = getAvailableServices()

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700">
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
            <div className="dashboard">
                <SideBar components={Components} isOpen={isSideBarOpen} onLogout={handleLogout} />
                <main className="ml-72 p-8 flex-1 transition-all duration-300 mt-16">
                    {/* Page Header */}
                    <header className="bg-white/90 backdrop-blur-lg rounded-3xl p-8 mb-8 shadow-2xl">
                        <div>
                            <h1 className="text-4xl font-bold text-gray-800 mb-2">Customer Reviews</h1>
                            <p className="text-gray-600 text-lg">See what your customers are saying about your work</p>
                        </div>
                    </header>

                    {/* Stats Overview */}
                    <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                        <div className="bg-white/90 backdrop-blur-lg rounded-3xl p-8 shadow-2xl hover:shadow-3xl transform hover:-translate-y-2 transition-all duration-300 flex items-center gap-6">
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-900 to-blue-700 rounded-2xl flex items-center justify-center text-3xl">
                                ⭐
                            </div>
                            <div className="flex-1">
                                <div className="text-4xl font-bold text-gray-800 mb-2">
                                    {reviewsData?.overall?.average || '0.0'}
                                </div>
                                <div className="text-gray-600 mb-2">Overall Rating</div>
                                <div className="flex gap-1">
                                    {renderStars(reviewsData?.overall?.average || 0)}
                                </div>
                            </div>
                        </div>

                        <div className="bg-white/90 backdrop-blur-lg rounded-3xl p-8 shadow-2xl hover:shadow-3xl transform hover:-translate-y-2 transition-all duration-300 flex items-center gap-6">
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-900 to-blue-700 rounded-2xl flex items-center justify-center text-3xl">
                                💬
                            </div>
                            <div className="flex-1">
                                <div className="text-4xl font-bold text-gray-800 mb-2">
                                    {reviewsData?.total || 0}
                                </div>
                                <div className="text-gray-600">Total Reviews</div>
                            </div>
                        </div>

                        <div className="bg-white/90 backdrop-blur-lg rounded-3xl p-8 shadow-2xl hover:shadow-3xl transform hover:-translate-y-2 transition-all duration-300 flex items-center gap-6">
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-900 to-blue-700 rounded-2xl flex items-center justify-center text-3xl">
                                ✅
                            </div>
                            <div className="flex-1">
                                <div className="text-4xl font-bold text-gray-800 mb-2">
                                    {technicianData?.tasksCompleted || 0}
                                </div>
                                <div className="text-gray-600">Jobs Completed</div>
                            </div>
                        </div>
                    </section>

                    {/* Ratings by Service */}
                    {availableServices.length > 0 && (
                        <section className="bg-white/90 backdrop-blur-lg rounded-3xl p-8 mb-12 shadow-2xl">
                            <h3 className="text-2xl font-bold text-gray-800 mb-6">Ratings by Service</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {availableServices.map((service, index) => {
                                    const serviceRating = reviewsData.byService[service]
                                    return (
                                        <div key={index} className="bg-white/70 rounded-2xl p-6 text-center hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300">
                                            <div className="font-bold text-gray-800 mb-4 text-lg">{service}</div>
                                            <div className="mb-2">
                                                <span className="text-3xl font-bold text-yellow-500">
                                                    {serviceRating.average.toFixed(1)}
                                                </span>
                                                <div className="flex justify-center gap-1 my-2">
                                                    {renderStars(serviceRating.average)}
                                                </div>
                                            </div>
                                            <div className="text-gray-500 text-sm">
                                                ({serviceRating.totalRatings} reviews)
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </section>
                    )}

                    {/* Reviews Section */}
                    <section className="bg-white/90 backdrop-blur-lg rounded-3xl p-8 shadow-2xl">
                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
                            <h3 className="text-2xl font-bold text-gray-800">Customer Reviews</h3>
                            <div className="flex gap-4 w-full lg:w-auto">
                                <select
                                    value={selectedService}
                                    onChange={(e) => setSelectedService(e.target.value)}
                                    className="px-4 py-3 border-2 border-gray-200 rounded-xl bg-white text-gray-800 font-semibold cursor-pointer transition-all duration-300 focus:outline-none focus:border-blue-500 flex-1 lg:flex-none"
                                >
                                    <option value="all">All Services</option>
                                    {availableServices.map((service, index) => (
                                        <option key={index} value={service}>{service}</option>
                                    ))}
                                </select>

                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="px-4 py-3 border-2 border-gray-200 rounded-xl bg-white text-gray-800 font-semibold cursor-pointer transition-all duration-300 focus:outline-none focus:border-blue-500 flex-1 lg:flex-none"
                                >
                                    <option value="newest">Newest First</option>
                                    <option value="oldest">Oldest First</option>
                                    <option value="highest">Highest Rating</option>
                                    <option value="lowest">Lowest Rating</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-6">
                            {filteredReviews.length > 0 ? (
                                filteredReviews.map((review, index) => (

                                    <div key={review._id || index} className="bg-white/70 rounded-2xl p-8 transition-all duration-300 border-l-4 border-blue-600 hover:shadow-lg hover:translate-x-2">
                                        <div className="flex flex-col lg:flex-row justify-between items-start mb-6 gap-4">
                                            <div className="flex items-center gap-4">
                                                {review.client?.profilePic ? (
                                                    <img
                                                        src={review.client.profilePic}
                                                        alt={`${review.client.fname} ${review.client.lname}`}
                                                        className="w-12 h-12 rounded-full object-cover border-2 border-blue-200"
                                                    />
                                                ) : (
                                                    <div className="w-12 h-12 bg-gradient-to-br from-blue-900 to-blue-700 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                                        {review.client?.initials || 'AN'}
                                                    </div>
                                                )}
                                                <div>
                                                    <div
                                                        className="font-bold text-gray-800 hover:text-blue-600 cursor-pointer transition-colors duration-200"
                                                        onClick={() => navigate(`/clientProfileSetupPage/${review.client._id}`)}
                                                    >
                                                        {review.client
                                                            ? `${review.client.fname} ${review.client.lname}`
                                                            : 'Anonymous Customer'}
                                                    </div>

                                                    <div className="text-gray-500 text-sm">
                                                        {formatDate(review.reviewDate)}
                                                    </div>
                                                    <div className="flex gap-1 mt-1">
                                                        {renderStars(review.rating)}
                                                        <span className="ml-2 text-sm text-gray-600">
                                                            ({review.rating}/5)
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-semibold">
                                                {review.service}
                                            </div>
                                        </div>

                                        <div className="leading-relaxed">
                                            <p className="text-gray-700">{review.feedback}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-16">
                                    <div className="text-6xl mb-4">💭</div>
                                    <h4 className="text-2xl font-bold text-gray-800 mb-4">No reviews yet</h4>
                                    <p className="text-lg text-gray-600">
                                        {selectedService === 'all'
                                            ? 'Complete more jobs to start receiving customer reviews!'
                                            : `No reviews found for ${selectedService} service.`
                                        }
                                    </p>
                                </div>
                            )}
                        </div>
                    </section>
                </main>
            </div>
        </div>
    )
}

export default TechnicianReviewsPage