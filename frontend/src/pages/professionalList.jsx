import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Star, MapPin, Clock, MessageCircle, Calendar, Filter, Search } from 'lucide-react'

const TechnicianDisplayPage = () => {
  const { serviceName } = useParams()
  const navigate = useNavigate()
  const [selectedService, setSelectedService] = useState(serviceName || 'Plumber')
  const [sortBy, setSortBy] = useState('rating')
  const [searchTerm, setSearchTerm] = useState('')
  const [initialLoad, setInitialLoad] = useState(true)

  // Only update URL when service changes after initial load
  useEffect(() => {
    if (!initialLoad && serviceName !== selectedService) {
      navigate(`/dashboard/bookservice/${selectedService}`, { replace: true })
    }
  }, [selectedService, serviceName, navigate, initialLoad])

  // Set initial load to false after component mounts
  useEffect(() => {
    setInitialLoad(false)
  }, [])

  const handleBookNow = (technician) => {
    // Navigate to booking page with service and technician info
    navigate(`/dashboard/booking/${selectedService}/${technician._id}`, {
      state: {
        service: selectedService,
        technician: technician
      }
    })
  }

  const handleMessage = (technician) => {
    // Navigate to chat/message page with technician info
    navigate(`/dashboard/chat/${technician._id}`, {
      state: {
        technician: technician,
        service: selectedService
      }
    })
  }

  // Helper function to format availability display
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

  // Get next available slot
  const getNextAvailability = (availability) => {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    const todayIndex = days.indexOf(today)
    
    // Check today first
    if (availability[today] && availability[today].available) {
      return formatAvailability(availability, today)
    }
    
    // Check remaining days of the week
    for (let i = 1; i < 7; i++) {
      const nextDayIndex = (todayIndex + i) % 7
      const nextDay = days[nextDayIndex]
      if (availability[nextDay] && availability[nextDay].available) {
        return formatAvailability(availability, nextDay)
      }
    }
    
    return { text: 'Not Available This Week', status: 'unavailable' }
  }

  const allTechnicians = [
    {
      _id: "507f1f77bcf86cd799439011",
      user: "507f1f77bcf86cd799439012",
      name: "Mike Rodriguez",
      profilePic: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      rating: 4.9,
      reviews: ["review1", "review2", "review3"],
      professions: ["Plumbing", "Emergency Repairs"],
      serviceLocation: "Downtown Area, Midtown",
      currentLocation: "Downtown Area",
      specialties: ["Emergency Repairs", "Water Heaters", "Pipe Installation"],
      experience: "8+ years",
      hourlyRate: 85,
      availability: {
        monday: { available: true, startTime: '08:00', endTime: '18:00' },
        tuesday: { available: true, startTime: '08:00', endTime: '18:00' },
        wednesday: { available: true, startTime: '08:00', endTime: '18:00' },
        thursday: { available: true, startTime: '08:00', endTime: '18:00' },
        friday: { available: true, startTime: '08:00', endTime: '18:00' },
        saturday: { available: true, startTime: '09:00', endTime: '15:00' },
        sunday: { available: false, startTime: '', endTime: '' }
      },
      responseTime: "15 min",
      tasksCompleted: 350
    },
    {
      _id: "507f1f77bcf86cd799439013",
      user: "507f1f77bcf86cd799439014",
      name: "Sarah Chen",
      profilePic: "https://images.unsplash.com/photo-1494790108755-2616b612b647?w=150&h=150&fit=crop&crop=face",
      rating: 4.8,
      reviews: ["review4", "review5"],
      professions: ["Plumbing", "Drain Cleaning"],
      serviceLocation: "Midtown, North Side",
      currentLocation: "Midtown",
      specialties: ["Drain Cleaning", "Fixture Installation", "Leak Repairs"],
      experience: "6+ years",
      hourlyRate: 75,
      availability: {
        monday: { available: true, startTime: '09:00', endTime: '17:00' },
        tuesday: { available: true, startTime: '09:00', endTime: '17:00' },
        wednesday: { available: false, startTime: '', endTime: '' },
        thursday: { available: true, startTime: '09:00', endTime: '17:00' },
        friday: { available: true, startTime: '09:00', endTime: '17:00' },
        saturday: { available: true, startTime: '10:00', endTime: '14:00' },
        sunday: { available: false, startTime: '', endTime: '' }
      },
      responseTime: "20 min",
      tasksCompleted: 280
    },
    {
      _id: "507f1f77bcf86cd799439015",
      user: "507f1f77bcf86cd799439016",
      name: "David Thompson",
      profilePic: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      rating: 4.7,
      reviews: ["review6", "review7", "review8", "review9"],
      professions: ["Plumbing", "Bathroom Remodeling"],
      serviceLocation: "North Side, West End",
      currentLocation: "North Side",
      specialties: ["Bathroom Remodeling", "Kitchen Plumbing", "Sewer Lines"],
      experience: "12+ years",
      hourlyRate: 95,
      availability: {
        monday: { available: true, startTime: '07:00', endTime: '19:00' },
        tuesday: { available: true, startTime: '07:00', endTime: '19:00' },
        wednesday: { available: true, startTime: '07:00', endTime: '19:00' },
        thursday: { available: true, startTime: '07:00', endTime: '19:00' },
        friday: { available: true, startTime: '07:00', endTime: '19:00' },
        saturday: { available: true, startTime: '08:00', endTime: '16:00' },
        sunday: { available: true, startTime: '10:00', endTime: '14:00' }
      },
      responseTime: "10 min",
      tasksCompleted: 520
    },
    {
      _id: "507f1f77bcf86cd799439017",
      user: "507f1f77bcf86cd799439018",
      name: "Lisa Park",
      profilePic: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
      rating: 4.9,
      reviews: ["review10", "review11", "review12"],
      professions: ["Plumbing", "Smart Home Integration"],
      serviceLocation: "West End, Downtown Area",
      currentLocation: "West End",
      specialties: ["Smart Home Integration", "Water Filtration", "Green Solutions"],
      experience: "5+ years",
      hourlyRate: 80,
      availability: {
        monday: { available: true, startTime: '08:30', endTime: '17:30' },
        tuesday: { available: true, startTime: '08:30', endTime: '17:30' },
        wednesday: { available: true, startTime: '08:30', endTime: '17:30' },
        thursday: { available: false, startTime: '', endTime: '' },
        friday: { available: true, startTime: '08:30', endTime: '17:30' },
        saturday: { available: false, startTime: '', endTime: '' },
        sunday: { available: false, startTime: '', endTime: '' }
      },
      responseTime: "12 min",
      tasksCompleted: 195
    },
    {
      _id: "507f1f77bcf86cd799439019",
      user: "507f1f77bcf86cd799439020",
      name: "James Wilson",
      profilePic: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
      rating: 4.8,
      reviews: ["review13", "review14", "review15", "review16", "review17"],
      professions: ["Electrical", "Smart Home"],
      serviceLocation: "Downtown Area, Midtown",
      currentLocation: "Downtown Area",
      specialties: ["Panel Upgrades", "Smart Home Wiring", "Emergency Electrical"],
      experience: "10+ years",
      hourlyRate: 90,
      availability: {
        monday: { available: true, startTime: '07:30', endTime: '18:30' },
        tuesday: { available: true, startTime: '07:30', endTime: '18:30' },
        wednesday: { available: true, startTime: '07:30', endTime: '18:30' },
        thursday: { available: true, startTime: '07:30', endTime: '18:30' },
        friday: { available: true, startTime: '07:30', endTime: '18:30' },
        saturday: { available: true, startTime: '09:00', endTime: '15:00' },
        sunday: { available: false, startTime: '', endTime: '' }
      },
      responseTime: "18 min",
      tasksCompleted: 425
    },
    {
      _id: "507f1f77bcf86cd799439021",
      user: "507f1f77bcf86cd799439022",
      name: "Amanda Foster",
      profilePic: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face",
      rating: 4.9,
      reviews: ["review18", "review19"],
      professions: ["Electrical", "LED Installation"],
      serviceLocation: "Midtown, North Side",
      currentLocation: "Midtown",
      specialties: ["LED Installation", "Outlet Repair", "Circuit Installation"],
      experience: "7+ years",
      hourlyRate: 82,
      availability: {
        monday: { available: true, startTime: '08:00', endTime: '16:00' },
        tuesday: { available: true, startTime: '08:00', endTime: '16:00' },
        wednesday: { available: true, startTime: '08:00', endTime: '16:00' },
        thursday: { available: true, startTime: '08:00', endTime: '16:00' },
        friday: { available: true, startTime: '08:00', endTime: '16:00' },
        saturday: { available: false, startTime: '', endTime: '' },
        sunday: { available: false, startTime: '', endTime: '' }
      },
      responseTime: "12 min",
      tasksCompleted: 310
    },
    {
      _id: "507f1f77bcf86cd799439023",
      user: "507f1f77bcf86cd799439024",
      name: "Robert Kim",
      profilePic: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop&crop=face",
      rating: 4.7,
      reviews: ["review20", "review21", "review22", "review23", "review24", "review25"],
      professions: ["Electrical", "Industrial"],
      serviceLocation: "North Side, Industrial District",
      currentLocation: "North Side",
      specialties: ["Industrial Electrical", "Generator Installation", "Code Updates"],
      experience: "15+ years",
      hourlyRate: 105,
      availability: {
        monday: { available: true, startTime: '06:00', endTime: '18:00' },
        tuesday: { available: true, startTime: '06:00', endTime: '18:00' },
        wednesday: { available: true, startTime: '06:00', endTime: '18:00' },
        thursday: { available: true, startTime: '06:00', endTime: '18:00' },
        friday: { available: true, startTime: '06:00', endTime: '18:00' },
        saturday: { available: true, startTime: '08:00', endTime: '12:00' },
        sunday: { available: false, startTime: '', endTime: '' }
      },
      responseTime: "25 min",
      tasksCompleted: 680
    },
    {
      _id: "507f1f77bcf86cd799439025",
      user: "507f1f77bcf86cd799439026",
      name: "Carlos Martinez",
      profilePic: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face",
      rating: 4.8,
      reviews: ["review26", "review27", "review28"],
      professions: ["HVAC", "AC Repair"],
      serviceLocation: "South Side, West End",
      currentLocation: "South Side",
      specialties: ["AC Repair", "Heating Systems", "Duct Cleaning"],
      experience: "9+ years",
      hourlyRate: 88,
      availability: {
        monday: { available: true, startTime: '08:00', endTime: '18:00' },
        tuesday: { available: true, startTime: '08:00', endTime: '18:00' },
        wednesday: { available: true, startTime: '08:00', endTime: '18:00' },
        thursday: { available: true, startTime: '08:00', endTime: '18:00' },
        friday: { available: true, startTime: '08:00', endTime: '18:00' },
        saturday: { available: true, startTime: '09:00', endTime: '15:00' },
        sunday: { available: true, startTime: '10:00', endTime: '14:00' }
      },
      responseTime: "16 min",
      tasksCompleted: 390
    },
    {
      _id: "507f1f77bcf86cd799439027",
      user: "507f1f77bcf86cd799439028",
      name: "Jennifer Adams",
      profilePic: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
      rating: 4.9,
      reviews: ["review29", "review30"],
      professions: ["HVAC", "Energy Efficiency"],
      serviceLocation: "West End, Downtown Area",
      currentLocation: "West End",
      specialties: ["Energy Efficiency", "Smart Thermostats", "System Maintenance"],
      experience: "6+ years",
      hourlyRate: 85,
      availability: {
        monday: { available: true, startTime: '09:00', endTime: '17:00' },
        tuesday: { available: true, startTime: '09:00', endTime: '17:00' },
        wednesday: { available: false, startTime: '', endTime: '' },
        thursday: { available: true, startTime: '09:00', endTime: '17:00' },
        friday: { available: true, startTime: '09:00', endTime: '17:00' },
        saturday: { available: true, startTime: '10:00', endTime: '14:00' },
        sunday: { available: false, startTime: '', endTime: '' }
      },
      responseTime: "14 min",
      tasksCompleted: 245
    },
    {
      _id: "507f1f77bcf86cd799439029",
      user: "507f1f77bcf86cd799439030",
      name: "Maria Gonzalez",
      profilePic: "https://images.unsplash.com/photo-1559941861-fd316294e32c?w=150&h=150&fit=crop&crop=face",
      rating: 4.9,
      reviews: ["review31", "review32", "review33", "review34", "review35", "review36", "review37"],
      professions: ["Cleaning", "Deep Cleaning"],
      serviceLocation: "Downtown Area, Midtown, South Side",
      currentLocation: "Downtown Area",
      specialties: ["Deep Cleaning", "Move-in/out", "Post-Construction"],
      experience: "8+ years",
      hourlyRate: 65,
      availability: {
        monday: { available: true, startTime: '08:00', endTime: '18:00' },
        tuesday: { available: true, startTime: '08:00', endTime: '18:00' },
        wednesday: { available: true, startTime: '08:00', endTime: '18:00' },
        thursday: { available: true, startTime: '08:00', endTime: '18:00' },
        friday: { available: true, startTime: '08:00', endTime: '18:00' },
        saturday: { available: true, startTime: '09:00', endTime: '17:00' },
        sunday: { available: true, startTime: '10:00', endTime: '16:00' }
      },
      responseTime: "10 min",
      tasksCompleted: 890
    }
  ]

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
          return a.hourlyRate - b.hourlyRate
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
                    className={`flex flex-col items-center gap-1 p-3 rounded-lg text-sm font-medium transition-all hover:scale-105 ${
                      selectedService === service.id
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
                        <h3 className="text-xl font-semibold text-gray-900">{technician.name}</h3>
                        <div className="text-right">
                          <div className="text-lg font-bold text-blue-600">${technician.hourlyRate}/hr</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium">{technician.rating}</span>
                          <span className="text-gray-500">({technician.reviews.length} reviews)</span>
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
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                      availability.status === 'today'
                        ? 'bg-green-100 text-green-700'
                        : availability.status === 'available'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      <div className={`w-2 h-2 rounded-full ${
                        availability.status === 'today'
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
    </div>
  )
}

export default TechnicianDisplayPage