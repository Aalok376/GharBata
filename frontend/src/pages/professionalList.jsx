import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Star, MapPin, Clock, MessageCircle, Calendar, Filter, Search, X } from 'lucide-react'

const TechnicianDisplayPage = () => {
  const { serviceName } = useParams()
  const navigate = useNavigate()
  const [selectedService, setSelectedService] = useState(serviceName || 'Plumber')
  const [sortBy, setSortBy] = useState('price')
  const [searchTerm, setSearchTerm] = useState('')
  const [initialLoad, setInitialLoad] = useState(true)
  const [allTechnicians, setTechnicians] = useState([])
  const [showReviewsOverlay, setShowReviewsOverlay] = useState(false)
  const [selectedTechnicianReviews, setSelectedTechnicianReviews] = useState(null)

  useEffect(() => {
    if (!initialLoad && serviceName !== selectedService) {
      navigate(`/dashboard/bookservice/${selectedService}`, { replace: true })
    }
  }, [selectedService, serviceName, navigate, initialLoad])

  useEffect(() => {
    const getTechnicians = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/technicians/filteredTechnicians?category=${encodeURIComponent(selectedService)}`,{
            method:'GET',
            credentials: 'include',
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`)
        }

        const data = await response.json()

        console.log(data)

        const formatted = data.map((tech) => ({
          _id: tech._id,
          userId: tech.user._id,
          name: `${tech.user.fname} ${tech.user.lname}`,
          username: tech.user.username,
          profilePic: tech.profilePic,
          rating: tech.rating,
          reviews: tech.reviews,
          professions: tech.professions,
          serviceLocation: tech.serviceLocation,
          currentLocation: tech.currentLocation,
          specialties: tech.specialties,
          experience: tech.experience,
          hourlyRate: tech.hourlyRate, // Keep as object
          availability: tech.availability,
          responseTime: tech.responseTime,
          tasksCompleted: tech.tasksCompleted
        }))

        setTechnicians(formatted)
      } catch (err) {
        console.error('Failed to fetch technicians:', err)
      }
    }

    if (selectedService) {
      getTechnicians()
    }
  }, [selectedService])

  useEffect(() => {
    setInitialLoad(false)
  }, [])

  // Helper function to get hourly rate for selected service
  const getHourlyRateForService = (hourlyRateObj, service) => {
    if (typeof hourlyRateObj === 'object' && hourlyRateObj !== null) {
      return hourlyRateObj[service] || 0
    }
    return hourlyRateObj || 0
  }

  // Mock reviews data for testing - matching DB structure
  const getMockReviews = (technicianName, selectedService) => {
    // Mock reviews structured as Map with profession as key
    const reviewsMap = {
      'Plumber': [
        {
          userId: '507f1f77bcf86cd799439011',
          profession: 'Plumber',
          reviewText: "Excellent plumbing service! Fixed my kitchen sink leak quickly and professionally. Very satisfied with the work quality.",
          createdAt: new Date('2024-01-15'),
          // Mock user data that would come from populate
          user: {
            _id: '507f1f77bcf86cd799439011',
            fname: 'Sarah',
            lname: 'Johnson',
            profilePic: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=150&h=150&fit=crop&crop=face'
          }
        },
        {
          userId: '507f1f77bcf86cd799439012',
          profession: 'Plumber',
          reviewText: "Great experience! " + technicianName + " was punctual and explained everything clearly. Fair pricing too.",
          createdAt: new Date('2024-01-10'),
          user: {
            _id: '507f1f77bcf86cd799439012',
            fname: 'Michael',
            lname: 'Chen',
            profilePic: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
          }
        }
      ],
      'Electrician': [
        {
          userId: '507f1f77bcf86cd799439013',
          profession: 'Electrician',
          reviewText: "Outstanding electrical work! Rewired my entire basement safely and efficiently. Highly recommend for any electrical needs.",
          createdAt: new Date('2024-01-12'),
          user: {
            _id: '507f1f77bcf86cd799439013',
            fname: 'Emily',
            lname: 'Rodriguez',
            profilePic: 'https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=150&h=150&fit=crop&crop=face'
          }
        },
        {
          userId: '507f1f77bcf86cd799439014',
          profession: 'Electrician',
          reviewText: "Professional and knowledgeable. Fixed my electrical outlet issues and provided helpful tips for maintenance.",
          createdAt: new Date('2024-01-08'),
          user: {
            _id: '507f1f77bcf86cd799439014',
            fname: 'David',
            lname: 'Thompson',
            profilePic: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
          }
        }
      ],
      'HVAC-Technician': [
        {
          userId: '507f1f77bcf86cd799439015',
          profession: 'HVAC-Technician',
          reviewText: "Excellent HVAC service! Fixed my heating system just before winter. Very reliable and professional work.",
          createdAt: new Date('2024-01-14'),
          user: {
            _id: '507f1f77bcf86cd799439015',
            fname: 'Lisa',
            lname: 'Wilson',
            profilePic: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'
          }
        }
      ],
      'Handyman': [
        {
          userId: '507f1f77bcf86cd799439016',
          profession: 'Handyman',
          reviewText: "Great handyman service! Fixed multiple issues around my house efficiently. Will definitely call again.",
          createdAt: new Date('2024-01-11'),
          user: {
            _id: '507f1f77bcf86cd799439016',
            fname: 'Robert',
            lname: 'Brown',
            profilePic: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=face'
          }
        }
      ]
    }

    // Return reviews for the selected service, or all reviews if service not found
    return reviewsMap[selectedService] || reviewsMap['Plumber'] || []
  }

  // Mock rating data matching DB structure
  const getMockRating = (selectedService) => {
    const ratingsMap = {
      'Plumber': { average: 4.5, totalRatings: 12, sumRatings: 54 },
      'Electrician': { average: 4.8, totalRatings: 8, sumRatings: 38.4 },
      'HVAC-Technician': { average: 4.2, totalRatings: 5, sumRatings: 21 },
      'Handyman': { average: 4.6, totalRatings: 10, sumRatings: 46 }
    }

    return ratingsMap[selectedService] || ratingsMap['Plumber'] || { average: 0, totalRatings: 0, sumRatings: 0 }
  }

  const handleShowReviews = (technician) => {
    const mockReviews = getMockReviews(technician.name, selectedService)
    const mockRating = getMockRating(selectedService)

    setSelectedTechnicianReviews({
      technician: technician,
      reviews: mockReviews,
      rating: mockRating
    })
    setShowReviewsOverlay(true)
    // Prevent body scroll
    document.body.style.overflow = 'hidden'
  }

  const handleCloseReviews = () => {
    setShowReviewsOverlay(false)
    setSelectedTechnicianReviews(null)
    // Restore body scroll
    document.body.style.overflow = 'unset'
  }

  const handleBookNow = (technician) => {
    navigate(`/dashboard/booking/${selectedService}/${technician._id}`, {
      state: {
        service: selectedService,
        technician: technician
      }
    })
  }

  const handleMessage = (technician) => {
    navigate(`/dashboard/chat/${technician._id}`, {
      state: {
        technician: technician,
        service: selectedService
      }
    })
  }

  const formatAvailability = (availability, day) => {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()

    if (!availability[day] || !availability[day].available) {
      return { text: 'Not Available', status: 'unavailable' }
    }

    if (day === today) {
      return {
        text: `Available Today ${availability[day].startTime} - ${availability[day].endTime}`,
        status: 'today'
      }
    }

    return {
      text: `${day.charAt(0).toUpperCase() + day.slice(1)}: ${availability[day].startTime} - ${availability[day].endTime}`,
      status: 'available'
    }
  }

  const getNextAvailability = (availability) => {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    const todayIndex = days.indexOf(today)

    if (availability[today] && availability[today].available) {
      return formatAvailability(availability, today)
    }

    for (let i = 1; i < 7; i++) {
      const nextDayIndex = (todayIndex + i) % 7
      const nextDay = days[nextDayIndex]
      if (availability[nextDay] && availability[nextDay].available) {
        return formatAvailability(availability, nextDay)
      }
    }

    return { text: 'Not Available This Week', status: 'unavailable' }
  }

  const services = [
    { id: 'Plumber', name: 'Plumber', icon: '🔧', searchTerms: ['plumbing', 'plumber'] },
    { id: 'Electrician', name: 'Electrician', icon: '⚡', searchTerms: ['electrical', 'electrician'] },
    { id: 'HVAC-Technician', name: 'HVAC Technician', icon: '🌡️', searchTerms: ['hvac', 'heating', 'cooling'] },
    { id: 'Handyman', name: 'Handyman', icon: '🔨', searchTerms: ['handyman', 'repair', 'maintenance'] },
    { id: 'Cleaner', name: 'Cleaner', icon: '🧽', searchTerms: ['cleaning', 'cleaner'] },
    { id: 'Gardener', name: 'Gardener', icon: '🌿', searchTerms: ['gardening', 'landscaping'] },
    { id: 'Carpenter', name: 'Carpenter', icon: '🪚', searchTerms: ['carpentry', 'wood'] },
    { id: 'Painter', name: 'Painter', icon: '🎨', searchTerms: ['painting', 'paint'] },
    { id: 'Appliance-Repair', name: 'Appliance Repair', icon: '🔌', searchTerms: ['appliance', 'repair'] },
    { id: 'Locksmith', name: 'Locksmith', icon: '🔐', searchTerms: ['locksmith', 'lock'] },
    { id: 'Pest-Control', name: 'Pest Control', icon: '🐜', searchTerms: ['pest', 'exterminator'] },
    { id: 'Roofing-Specialist', name: 'Roofing Specialist', icon: '🏠', searchTerms: ['roofing', 'roof'] },
    { id: 'Flooring-Specialist', name: 'Flooring Specialist', icon: '🧱', searchTerms: ['flooring', 'floor'] },
    { id: 'Door-Installer', name: 'Door Installer', icon: '🚪', searchTerms: ['door', 'installation'] }
  ]

  const filteredAndSortedTechnicians = allTechnicians
    .filter(tech => {
      // Filter by profession
      const matchesProfession = tech.professions.some(profession =>
        profession.toLowerCase().includes(selectedService.toLowerCase()) ||
        selectedService.toLowerCase().includes(profession.toLowerCase())
      )

      // Filter by search term
      const matchesSearch = searchTerm === '' ||
        tech.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tech.specialties.some(specialty =>
          specialty.toLowerCase().includes(searchTerm.toLowerCase())
        ) ||
        tech.professions.some(profession =>
          profession.toLowerCase().includes(searchTerm.toLowerCase())
        )

      return matchesProfession && matchesSearch
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating
        case 'price':
          const rateA = getHourlyRateForService(a.hourlyRate, selectedService)
          const rateB = getHourlyRateForService(b.hourlyRate, selectedService)
          return rateA - rateB
        case 'availability':
          // Sort by tasks completed as a proxy for availability/popularity
          return b.tasksCompleted - a.tasksCompleted
        default:
          return 0
      }
    })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex flex-col gap-4">
            <div className="text-center lg:text-left">
              <h1 className="text-3xl font-bold text-gray-900 mb-1">Find a Service Provider</h1>
              <p className="text-gray-600">Professional service providers in your area</p>
            </div>

            {/* Service Selection */}
            <div className="flex flex-col gap-3">
              <h3 className="text-base font-semibold text-gray-800">Select a Service</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-2">
                {services.map(service => (
                  <button
                    key={service.id}
                    onClick={() => setSelectedService(service.id)}
                    className={`flex flex-col items-center gap-1 p-3 rounded-lg text-sm font-medium transition-all hover:scale-105 ${selectedService === service.id
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                  >
                    <span className="text-xl">{service.icon}</span>
                    <span className="text-center leading-tight">{service.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search providers, specialties, or professions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex gap-3">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="rating">Sort by Rating</option>
              <option value="price">Sort by Price</option>
              <option value="availability">Sort by Experience</option>
            </select>

            <button className="px-4 py-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Filters
            </button>
          </div>
        </div>

        {/* Technician Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredAndSortedTechnicians.map(technician => {
            const availability = getNextAvailability(technician.availability)
            const currentHourlyRate = getHourlyRateForService(technician.hourlyRate, selectedService)

            return (
              <div key={technician._id} className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start gap-4 mb-4">
                    <div>
                      <img
                        src={technician.profilePic || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"}
                        alt={technician.name}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3
                          onClick={() => navigate(`/professionalProfilePage/${technician.userId}`)}
                          className="text-xl font-semibold text-gray-900 cursor-pointer hover:text-blue-600 hover:underline transition-all"
                        >
                          {technician.name}
                        </h3>


                        <div className="text-right">
                          <div className="text-lg font-bold text-blue-600">
                            ${currentHourlyRate || 'N/A'}/hr
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium">
                            {typeof technician.rating === 'number'
                              ? technician.rating.toFixed(1)
                              : typeof technician.rating?.average === 'number'
                                ? technician.rating.average.toFixed(1)
                                : '0.0'}
                          </span>
                          <button
                            onClick={() => handleShowReviews(technician)}
                            className="text-gray-500 hover:text-blue-600 transition-colors cursor-pointer"
                          >
                            ({Array.isArray(technician.reviews) ? technician.reviews.length : 0} reviews)
                          </button>
                        </div>

                        <span className="text-gray-300">•</span>
                        <span className="text-gray-600">{technician.experience} experience</span>
                      </div>
                    </div>
                  </div>

                  {/* Professions */}
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Professions</h4>
                    <div className="flex flex-wrap gap-2">
                      {technician.professions.map((profession, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-purple-50 text-purple-700 text-sm rounded-full font-medium"
                        >
                          {profession}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Specialties */}
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Specialties</h4>
                    <div className="flex flex-wrap gap-2">
                      {technician.specialties.map((specialty, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full"
                        >
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Location and Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <div>
                        <div className="text-gray-600 font-medium">{technician.currentLocation}</div>
                        <div className="text-gray-500 text-xs">Serves: {technician.serviceLocation}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <div>
                        <div className="text-gray-600">Responds in {technician.responseTime}</div>
                        <div className="text-gray-500 text-xs">{technician.tasksCompleted} tasks completed</div>
                      </div>
                    </div>
                  </div>

                  {/* Availability */}
                  <div className="mb-4">
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${availability.status === 'today'
                      ? 'bg-green-100 text-green-700'
                      : availability.status === 'available'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-700'
                      }`}>
                      <div className={`w-2 h-2 rounded-full ${availability.status === 'today'
                        ? 'bg-green-500'
                        : availability.status === 'available'
                          ? 'bg-blue-500'
                          : 'bg-gray-500'
                        }`} />
                      {availability.text}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleBookNow(technician)}
                      className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <Calendar className="w-4 h-4" />
                      Book Now
                    </button>
                    <button
                      onClick={() => handleMessage(technician)}
                      className="px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center"
                      title={`Message ${technician.name}`}
                    >
                      <MessageCircle className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Empty State */}
        {filteredAndSortedTechnicians.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">No service providers found</h3>
            <p className="text-gray-600">Try adjusting your search or filters</p>
          </div>
        )}
      </div>

      {/* Reviews Overlay */}
      {showReviewsOverlay && selectedTechnicianReviews && (
        <div
          className="fixed inset-0 bg-[rgba(0,0,0,0.8)] flex items-center justify-center z-50 p-4 overflow-hidden"
          onClick={handleCloseReviews}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            overflowY: 'hidden'
          }}
        >
          <div
            className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <img
                  src={selectedTechnicianReviews.technician.profilePic || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"}
                  alt={selectedTechnicianReviews.technician.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Reviews for {selectedTechnicianReviews.technician.name}
                  </h2>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{selectedTechnicianReviews.rating.average}</span>
                      <span className="text-gray-500">({selectedTechnicianReviews.rating.totalRatings} reviews)</span>
                    </div>
                  </div>
                </div>
              </div>
              <button
                onClick={handleCloseReviews}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Reviews List */}
            <div className="overflow-y-auto max-h-[60vh] p-6">
              {selectedTechnicianReviews.reviews.length > 0 ? (
                <div className="space-y-6">
                  {selectedTechnicianReviews.reviews.map((review, index) => (
                    <div key={review.userId || index} className="border-b border-gray-100 pb-6 last:border-b-0 last:pb-0">
                      <div className="flex items-start gap-4">
                        <img
                          src={review.user?.profilePic || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"}
                          alt={`${review.user?.fname} ${review.user?.lname}`}
                          className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-gray-900">
                              {review.user?.fname} {review.user?.lname}
                            </h4>
                            <span className="text-sm text-gray-500">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                              {review.profession}
                            </span>
                          </div>
                          <p className="text-gray-700 leading-relaxed">{review.reviewText}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-400 text-4xl mb-2">💬</div>
                  <p className="text-gray-500">No reviews yet for {selectedService}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TechnicianDisplayPage