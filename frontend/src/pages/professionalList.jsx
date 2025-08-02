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
  const [loadingReviews, setLoadingReviews] = useState(false)
  const [technicianRatings, setTechnicianRatings] = useState({})

  useEffect(() => {
    if (!initialLoad && serviceName !== selectedService) {
      navigate(`/client/dashboard/bookservice/${selectedService}`, { replace: true })
    }
  }, [selectedService, serviceName, navigate, initialLoad])

  useEffect(() => {
    const getTechnicians = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/technicians/filteredTechnicians?category=${encodeURIComponent(selectedService)}`, {
          method: 'GET',
          credentials: 'include',
        }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`)
        }

        const data = await response.json()

        const formatted = data.map((tech) => ({
          _id: tech._id || '',
          userId: tech.user._id,
          name: `${tech.user.fname} ${tech.user.lname}`,
          username: tech.user.username,
          profilePic: tech.profilePic,
          rating: tech.rating,
          overallRating: tech.overallRating || 0,
          reviews: tech.reviews,
          professions: tech.professions,
          serviceLocation: tech.serviceLocation,
          currentLocation: tech.currentLocation,
          specialties: tech.specialties,
          experience: tech.experience,
          hourlyRate: tech.hourlyRate,
          availability: tech.availability,
          responseTime: tech.responseTime,
          tasksCompleted: tech.tasksCompleted
        }))

        setTechnicians(formatted)

        // Fetch ratings for each technician for the selected service
        fetchTechniciansRatings(formatted)
      } catch (err) {
        console.error('Failed to fetch technicians:', err)
      }
    }

    if (selectedService) {
      getTechnicians()
    }
  }, [selectedService])

  // Updated function to fetch both ratings and reviews data
  const fetchTechniciansRatings = async (technicians) => {
    const ratingsData = {}

    await Promise.all(
      technicians.map(async (tech) => {
        try {
          // Try to fetch ratings from reviews endpoint first
          const reviewsResponse = await fetch(
            `http://localhost:5000/api/bookings/${tech._id}/reviews`,
            {
              method: 'GET',
              credentials: 'include',
            }
          )

          if (reviewsResponse.ok) {
            const reviewsData = await reviewsResponse.json()
            if (reviewsData.success) {
              // Get rating for current service
              const serviceRating = reviewsData.data.reviews.byService[selectedService] ||
                Object.entries(reviewsData.data.reviews.byService).find(([key]) =>
                  key.toLowerCase() === selectedService.toLowerCase() ||
                  selectedService.toLowerCase().includes(key.toLowerCase()) ||
                  key.toLowerCase().includes(selectedService.toLowerCase())
                )?.[1] || { average: 0, totalRatings: 0 }

              ratingsData[tech._id] = serviceRating
              return
            }
          }

          // If reviews endpoint fails, try to fetch from ratings endpoint (if exists)
          try {
            const ratingsResponse = await fetch(
              `http://localhost:5000/api/technicians/${tech._id}/ratings?service=${encodeURIComponent(selectedService)}`,
              {
                method: 'GET',
                credentials: 'include',
              }
            )

            if (ratingsResponse.ok) {
              const ratingsData_alt = await ratingsResponse.json()
              if (ratingsData_alt.success) {
                ratingsData[tech._id] = {
                  average: ratingsData_alt.data.average || 0,
                  totalRatings: ratingsData_alt.data.totalRatings || 0
                }
                return
              }
            }
          } catch (ratingsError) {
            console.log('Ratings endpoint not available, using fallback')
          }

          // Fallback to technician's built-in rating data
          if (tech.rating && typeof tech.rating === 'object') {
            const professionRating = tech.rating[selectedService] ||
              Object.entries(tech.rating).find(([key]) =>
                key.toLowerCase() === selectedService.toLowerCase() ||
                selectedService.toLowerCase().includes(key.toLowerCase()) ||
                key.toLowerCase().includes(selectedService.toLowerCase())
              )?.[1]

            if (professionRating && typeof professionRating.average === 'number') {
              ratingsData[tech._id] = {
                average: professionRating.average,
                totalRatings: professionRating.totalRatings || 0
              }
              return
            }
          }

          // Final fallback
          ratingsData[tech._id] = { average: tech.overallRating || 0, totalRatings: 0 }

        } catch (error) {
          console.error(`Error fetching ratings for ${tech.name}:`, error)
          ratingsData[tech._id] = { average: tech.overallRating || 0, totalRatings: 0 }
        }
      })
    )

    setTechnicianRatings(ratingsData)
  }

  useEffect(() => {
    setInitialLoad(false)
  }, [])

  // Helper function to parse experience string into numerical value for sorting
  const parseExperience = (experienceString) => {
    if (!experienceString || typeof experienceString !== 'string') return 0

    const exp = experienceString.toLowerCase().trim()

    // Handle special cases
    if (exp.includes('less than')) return 0.5 // Less than 1 year
    if (exp.includes('more than')) {
      const match = exp.match(/more than (\d+)/)
      return match ? parseFloat(match[1]) + 0.5 : 0
    }
    if (exp.includes('-')) {
      const match = exp.match(/(\d+\.?\d*)\s*-\s*(\d+\.?\d*)/)
      if (match) {
        const low = parseFloat(match[1])
        const high = parseFloat(match[2])
        return (low + high) / 2 // Average the range
      }
    }

    // Default number extraction
    const numberMatch = exp.match(/(\d+(\.\d+)?)/)
    const number = numberMatch ? parseFloat(numberMatch[1]) : 0

    // Convert months to years if needed
    if (exp.includes('month')) return number / 12

    return number // Years
  }

  const createConversations = async (receiverId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/chats/createConversations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials:'include',
        body: JSON.stringify({ receiverId }),
      })
      const data = await response.json()

      return { data }
    } catch (error) {
      console.error(error)
    }
  }

  // Updated function to get hourly rate for a specific service/profession
  const getHourlyRateForService = (hourlyRateObj, service) => {

    if (!hourlyRateObj || typeof hourlyRateObj !== 'object') {
      console.log('Invalid hourlyRateObj:', hourlyRateObj)
      return 0
    }

    // First try exact match
    if (hourlyRateObj[service]) {
      console.log('Found exact match:', hourlyRateObj[service])
      return hourlyRateObj[service]
    }

    // Try case-insensitive match
    const serviceKeys = Object.keys(hourlyRateObj)
    const matchingKey = serviceKeys.find(key =>
      key.toLowerCase() === service.toLowerCase()
    )

    if (matchingKey) {
      console.log('Found case-insensitive match:', hourlyRateObj[matchingKey])
      return hourlyRateObj[matchingKey]
    }

    // Try partial matches for service names that might be different
    const partialMatch = serviceKeys.find(key => {
      const keyLower = key.toLowerCase()
      const serviceLower = service.toLowerCase()

      // Handle special cases
      if (serviceLower.includes('hvac') && keyLower.includes('hvac')) return true
      if (serviceLower.includes('appliance') && keyLower.includes('appliance')) return true
      if (serviceLower.includes('pest') && keyLower.includes('pest')) return true
      if (serviceLower.includes('roofing') && keyLower.includes('roof')) return true
      if (serviceLower.includes('flooring') && keyLower.includes('floor')) return true
      if (serviceLower.includes('door') && keyLower.includes('door')) return true

      // General substring matching
      return keyLower.includes(serviceLower) || serviceLower.includes(keyLower)
    })

    if (partialMatch) {
      console.log('Found partial match:', hourlyRateObj[partialMatch])
      return hourlyRateObj[partialMatch]
    }

    // If no match found, return the first available rate or 0
    const firstRate = Object.values(hourlyRateObj)[0]
    return firstRate || 0
  }

  // Fixed fetchReviews function to use the correct API endpoint
  const fetchReviews = async (technicianId, profession) => {
    try {
      setLoadingReviews(true)

      // Use the same API endpoint we created for the reviews page
      const response = await fetch(
        `http://localhost:5000/api/bookings/${technicianId}/reviews`,
        {
          method: 'GET',
          credentials: 'include',
        }
      )

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch reviews')
      }

      // Filter reviews for the specific service/profession
      const allReviews = data.data.reviews.allReviews || []
      const serviceReviews = allReviews.filter(review =>
        review.service.toLowerCase() === profession.toLowerCase() ||
        profession.toLowerCase().includes(review.service.toLowerCase()) ||
        review.service.toLowerCase().includes(profession.toLowerCase())
      )

      // Get rating for this specific service
      const serviceRating = data.data.reviews.byService[profession] ||
        Object.entries(data.data.reviews.byService).find(([key]) =>
          key.toLowerCase() === profession.toLowerCase() ||
          profession.toLowerCase().includes(key.toLowerCase()) ||
          key.toLowerCase().includes(profession.toLowerCase())
        )?.[1] || { average: 0, totalRatings: 0 }

      return {
        reviews: serviceReviews,
        rating: serviceRating
      }
    } catch (err) {
      console.error('Error fetching reviews:', err)
      return {
        reviews: [],
        rating: { average: 0, totalRatings: 0 }
      }
    } finally {
      setLoadingReviews(false)
    }
  }

  // Get rating for specific profession - now uses fetched data
  const getRatingForProfession = (technicianId, profession) => {
    // First try to get from fetched ratings data
    if (technicianRatings[technicianId]) {
      return technicianRatings[technicianId]
    }

    // Fallback to original method
    const technician = allTechnicians.find(tech => tech._id === technicianId)
    if (technician && typeof technician.rating === 'object' && technician.rating !== null) {
      const professionRating = technician.rating[profession]
      if (professionRating && typeof professionRating.average === 'number') {
        return {
          average: professionRating.average,
          totalRatings: professionRating.totalRatings || 0
        }
      }
    }
    return { average: technician?.overallRating || 0, totalRatings: 0 }
  }

  const handleShowReviews = async (technician) => {

    const reviewsData = await fetchReviews(technician._id, selectedService)

    setSelectedTechnicianReviews({
      technician: technician,
      reviews: reviewsData.reviews,
      rating: reviewsData.rating
    })
    setShowReviewsOverlay(true)
    document.body.style.overflow = 'hidden'
  }

  const handleCloseReviews = () => {
    setShowReviewsOverlay(false)
    setSelectedTechnicianReviews(null)
    document.body.style.overflow = 'unset'
  }

  const handleBookNow = (technician) => {
    const currentHourlyRate = getHourlyRateForService(technician.hourlyRate, selectedService)

    navigate(`/client/dashboard/booking/${selectedService}/${technician._id}/${currentHourlyRate}`, {
      state: {
        service: selectedService,
        technician: technician,
        hourlyRate: currentHourlyRate
      }
    })
  }

  const handleMessage = (technician) => {
    navigate(`/dashboard/chats/${technician.userId}`)
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
    const days = ['monday', 'tuesday', 'Wednesday', 'thursday', 'friday', 'saturday', 'sunday']
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
          // Fixed: Use service-specific ratings for sorting
          const ratingA = getRatingForProfession(a._id, selectedService)
          const ratingB = getRatingForProfession(b._id, selectedService)
          return (ratingB.average || 0) - (ratingA.average || 0)
        case 'price':
          const rateA = getHourlyRateForService(a.hourlyRate, selectedService)
          const rateB = getHourlyRateForService(b.hourlyRate, selectedService)
          return rateA - rateB
        case 'experience':
          // Fixed: Sort by actual experience years, not tasks completed
          const experienceA = parseExperience(a.experience)
          const experienceB = parseExperience(b.experience)
          console.log(`Sorting: ${a.name} (${a.experience} = ${experienceA}) vs ${b.name} (${b.experience} = ${experienceB})`)
          return experienceB - experienceA // Higher experience first
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
              <option value="experience">Sort by Experience</option>
            </select>
          </div>
        </div>

        {/* Technician Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredAndSortedTechnicians.map(technician => {
            const availability = getNextAvailability(technician.availability)
            const currentHourlyRate = getHourlyRateForService(technician.hourlyRate, selectedService)
            const professionRating = getRatingForProfession(technician._id, selectedService)

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
                            Rs.{currentHourlyRate > 0 ? currentHourlyRate : 'N/A'}/hr
                          </div>
                          {currentHourlyRate === 0 && (
                            <div className="text-xs text-gray-500">Rate not set</div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium">
                            {professionRating.average > 0 ? professionRating.average.toFixed(1) : technician.overallRating.toFixed(1)}
                          </span>
                          <button
                            onClick={() => handleShowReviews(technician)}
                            className="text-gray-500 hover:text-blue-600 transition-colors cursor-pointer"
                          >
                            ({professionRating.totalRatings > 0 ? professionRating.totalRatings : 'No'} reviews)
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
                      disabled={currentHourlyRate === 0}
                    >
                      <Calendar className="w-4 h-4" />
                      {currentHourlyRate === 0 ? 'Rate Not Set' : 'Book Now'}
                    </button>
                    <button
                      onClick={async() => {
                        
                        const {data}= await createConversations(technician.userId)
                        if (data){
                          handleMessage(technician)
                        }
                      }
                      }
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
                      <span className="font-medium">
                        {selectedTechnicianReviews.rating.average ? selectedTechnicianReviews.rating.average.toFixed(1) : '0.0'}
                      </span>
                      <span className="text-gray-500">
                        ({selectedTechnicianReviews.rating.totalRatings} reviews for {selectedService})
                      </span>
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
              {loadingReviews ? (
                <div className="text-center py-8">
                  <div className="text-gray-400 text-4xl mb-2">⏳</div>
                  <p className="text-gray-500">Loading reviews...</p>
                </div>
              ) : selectedTechnicianReviews.reviews.length > 0 ? (
                <div className="space-y-6">
                  {selectedTechnicianReviews.reviews.map((review, index) => (
                    <div key={review._id || index} className="border-b border-gray-100 pb-6 last:border-b-0 last:pb-0">
                      <div className="flex items-start gap-4">
                        {review.client?.profilePic ? (
                          <img
                            src={review.client.profilePic}
                            alt={`${review.client.fname} ${review.client.lname}`}
                            className="w-12 h-12 rounded-full object-cover flex-shrink-0 border-2 border-gray-200"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                            {review.client?.initials || 'AN'}
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-gray-900">
                              {review.client ? `${review.client.fname} ${review.client.lname}` : 'Anonymous Customer'}
                            </h4>
                            <span className="text-sm text-gray-500">
                              {new Date(review.reviewDate).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mb-3">
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                                />
                              ))}
                              <span className="ml-1 text-sm text-gray-600">({review.rating}/5)</span>
                            </div>
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                              {review.service}
                            </span>
                          </div>
                          <p className="text-gray-700 leading-relaxed">{review.feedback}</p>
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