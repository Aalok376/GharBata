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
    const [selectedProfession, setSelectedProfession] = useState('all')
    const [sortBy, setSortBy] = useState('newest')
    const [loading, setLoading] = useState(true)

   const Components = [
        { id: `/professional/dashboard`, icon: '📊', text: 'Dashboard' },
        { id: `/professional/jobs/${userId}`, icon: '💼', text: 'Jobs' },
        { id: `/professional/earnings/${userId}`, icon: '💰', text: 'Earnings' },
        { id: `/professional/reviews/${userId}`, icon: '⭐', text: 'Reviews' },
        { id: `/professional/messages/${userId}`, icon: '📱', text: 'Messages' },
        { id: '/logout', icon: '⚙️', text: 'Logout' },
    ]

    useEffect(() => {
        const fetchTechnicianData = async () => {
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
                profileData = Array.isArray(profileData) ? profileData : [profileData]
                const prof = profileData[0].technician || {}

                if (prof) {
                    setFname(prof.user?.fname || '')
                    setLname(prof.user?.lname || '')
                    setUserId(prof.user?._id || '')
                    setTechnicianData(prof)
                    
                    // Set default profession filter to first profession if available
                    if (prof.professions && prof.professions.length > 0) {
                        setSelectedProfession(prof.professions[0])
                    }
                }

                setProfilePic(prof?.profilePic || '')
                setLoading(false)

            } catch (err) {
                console.error('Failed to fetch technician data:', err)
                setLoading(false)
            }
        }

        fetchTechnicianData()
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
                window.location.href = '/technician_login'
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

    const getInitials = (fname, lname) => {
        return `${fname?.charAt(0) || ''}${lname?.charAt(0) || ''}`.toUpperCase()
    }

    const getAllReviews = () => {
        if (!technicianData?.reviews) return []
        
        let allReviews = []
        Object.entries(technicianData.reviews).forEach(([profession, reviews]) => {
            reviews.forEach(review => {
                allReviews.push({
                    ...review,
                    profession: profession
                })
            })
        })

        // Filter by profession
        if (selectedProfession !== 'all') {
            allReviews = allReviews.filter(review => review.profession === selectedProfession)
        }

        // Sort reviews
        allReviews.sort((a, b) => {
            if (sortBy === 'newest') {
                return new Date(b.createdAt) - new Date(a.createdAt)
            } else if (sortBy === 'oldest') {
                return new Date(a.createdAt) - new Date(b.createdAt)
            }
            return 0
        })

        return allReviews
    }

    const getOverallStats = () => {
        if (!technicianData?.rating) return { totalReviews: 0, averageRating: 0 }
        
        let totalReviews = 0
        let totalRatingSum = 0
        let totalRatingCount = 0

        Object.values(technicianData.rating).forEach(rating => {
            if (rating.totalRatings) {
                totalReviews += rating.totalRatings
                totalRatingSum += rating.sumRatings || 0
                totalRatingCount += rating.totalRatings
            }
        })

        const averageRating = totalRatingCount > 0 ? (totalRatingSum / totalRatingCount).toFixed(1) : 0

        return { totalReviews, averageRating }
    }

    const getRatingForProfession = (profession) => {
        if (!technicianData?.rating?.[profession]) return { average: 0, totalRatings: 0 }
        return technicianData.rating[profession]
    }

    const renderStars = (rating) => {
        const stars = []
        const fullStars = Math.floor(rating)
        const hasHalfStar = rating % 1 !== 0

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

    const allReviews = getAllReviews()
    const overallStats = getOverallStats()

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 flex items-center justify-center">
                <div className="text-white text-xl">Loading reviews...</div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700">
            <ClientNavbar isOpen={isSideBarOpen} setIsOpen={setIsSideBarOpen} fname={fname} lname={lname} profilePic={profilePic} userType={'technician'} userId={userId}></ClientNavbar>
            <SideBarOverlay isSideBarOpen={isSideBarOpen} setIsSideBarOpen={setIsSideBarOpen} />
            <div className="dashboard">
                <SideBar components={Components} isOpen={isSideBarOpen} onLogout={handleLogout}></SideBar>
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
                                <div className="text-4xl font-bold text-gray-800 mb-2">{overallStats.averageRating}</div>
                                <div className="text-gray-600 mb-2">Overall Rating</div>
                                <div className="flex gap-1">
                                    {renderStars(parseFloat(overallStats.averageRating))}
                                </div>
                            </div>
                        </div>

                        <div className="bg-white/90 backdrop-blur-lg rounded-3xl p-8 shadow-2xl hover:shadow-3xl transform hover:-translate-y-2 transition-all duration-300 flex items-center gap-6">
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-900 to-blue-700 rounded-2xl flex items-center justify-center text-3xl">
                                💬
                            </div>
                            <div className="flex-1">
                                <div className="text-4xl font-bold text-gray-800 mb-2">{overallStats.totalReviews}</div>
                                <div className="text-gray-600">Total Reviews</div>
                            </div>
                        </div>

                        <div className="bg-white/90 backdrop-blur-lg rounded-3xl p-8 shadow-2xl hover:shadow-3xl transform hover:-translate-y-2 transition-all duration-300 flex items-center gap-6">
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-900 to-blue-700 rounded-2xl flex items-center justify-center text-3xl">
                                ✅
                            </div>
                            <div className="flex-1">
                                <div className="text-4xl font-bold text-gray-800 mb-2">{technicianData?.tasksCompleted || 0}</div>
                                <div className="text-gray-600">Jobs Completed</div>
                            </div>
                        </div>
                    </section>

                    {/* Ratings by Service */}
                    <section className="bg-white/90 backdrop-blur-lg rounded-3xl p-8 mb-12 shadow-2xl">
                        <h3 className="text-2xl font-bold text-gray-800 mb-6">Ratings by Service</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {technicianData?.professions?.map((profession, index) => {
                                const rating = getRatingForProfession(profession)
                                return (
                                    <div key={index} className="bg-white/70 rounded-2xl p-6 text-center hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300">
                                        <div className="font-bold text-gray-800 mb-4 text-lg">{profession}</div>
                                        <div className="mb-2">
                                            <span className="text-3xl font-bold text-yellow-500">{rating.average?.toFixed(1) || '0.0'}</span>
                                            <div className="flex justify-center gap-1 my-2">
                                                {renderStars(rating.average || 0)}
                                            </div>
                                        </div>
                                        <div className="text-gray-500 text-sm">({rating.totalRatings || 0} reviews)</div>
                                    </div>
                                )
                            })}
                        </div>
                    </section>

                    {/* Reviews Section */}
                    <section className="bg-white/90 backdrop-blur-lg rounded-3xl p-8 shadow-2xl">
                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
                            <h3 className="text-2xl font-bold text-gray-800">Customer Reviews</h3>
                            <div className="flex gap-4 w-full lg:w-auto">
                                <select 
                                    value={selectedProfession} 
                                    onChange={(e) => setSelectedProfession(e.target.value)}
                                    className="px-4 py-3 border-2 border-gray-200 rounded-xl bg-white text-gray-800 font-semibold cursor-pointer transition-all duration-300 focus:outline-none focus:border-blue-500 flex-1 lg:flex-none"
                                >
                                    <option value="all">All Services</option>
                                    {technicianData?.professions?.map((profession, index) => (
                                        <option key={index} value={profession}>{profession}</option>
                                    ))}
                                </select>
                                
                                <select 
                                    value={sortBy} 
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="px-4 py-3 border-2 border-gray-200 rounded-xl bg-white text-gray-800 font-semibold cursor-pointer transition-all duration-300 focus:outline-none focus:border-blue-500 flex-1 lg:flex-none"
                                >
                                    <option value="newest">Newest First</option>
                                    <option value="oldest">Oldest First</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-6">
                            {allReviews.length > 0 ? (
                                allReviews.map((review, index) => (
                                    <div key={index} className="bg-white/70 rounded-2xl p-8 transition-all duration-300 border-l-4 border-blue-600 hover:shadow-lg hover:translate-x-2">
                                        <div className="flex flex-col lg:flex-row justify-between items-start mb-6 gap-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-gradient-to-br from-blue-900 to-blue-700 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                                    {review.userId ? 
                                                        getInitials(review.userId.fname, review.userId.lname) : 
                                                        'AN'
                                                    }
                                                </div>
                                                <div>
                                                    <div className="font-bold text-gray-800">
                                                        {review.userId ? 
                                                            `${review.userId.fname} ${review.userId.lname}` : 
                                                            'Anonymous Customer'
                                                        }
                                                    </div>
                                                    <div className="text-gray-500 text-sm">
                                                        {formatDate(review.createdAt)}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-semibold">
                                                {review.profession}
                                            </div>
                                        </div>
                                        
                                        <div className="leading-relaxed">
                                            <p className="text-gray-600 italic">{review.reviewText}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-16">
                                    <div className="text-6xl mb-4">💭</div>
                                    <h4 className="text-2xl font-bold text-gray-800 mb-4">No reviews yet</h4>
                                    <p className="text-lg text-gray-600">Complete more jobs to start receiving customer reviews!</p>
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