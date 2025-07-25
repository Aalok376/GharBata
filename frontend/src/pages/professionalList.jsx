import React, { useState } from 'react'
import { Star, MapPin, Clock, Shield, Phone, Calendar, Filter, Search } from 'lucide-react'

const TechnicianDisplayPage = () => {
  const [selectedService, setSelectedService] = useState('plumbing')
  const [sortBy, setSortBy] = useState('rating')
  const [searchTerm, setSearchTerm] = useState('')

  // Helper function to format availability display
  const formatAvailability = (availableAt) => {
    const now = new Date()
    const availableDate = new Date(availableAt)
    const timeDiff = availableDate.getTime() - now.getTime()
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24))
    const hoursDiff = Math.ceil(timeDiff / (1000 * 3600))
    
    // If available now or in the past
    if (timeDiff <= 0) {
      return { text: 'Available Now', status: 'available' }
    }
    
    // If available today
    if (availableDate.toDateString() === now.toDateString()) {
      return { 
        text: `Available Today ${availableDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`, 
        status: 'today' 
      }
    }
    
    // If available tomorrow
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)
    if (availableDate.toDateString() === tomorrow.toDateString()) {
      return { 
        text: `Tomorrow ${availableDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`, 
        status: 'tomorrow' 
      }
    }
    
    // If available within a week
    if (daysDiff <= 7) {
      return { 
        text: `${availableDate.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })} at ${availableDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`, 
        status: 'week' 
      }
    }
    
    // If available later
    return { 
      text: availableDate.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ` at ${availableDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`, 
      status: 'later' 
    }
  }

  const allTechnicians = [
    {
      id: 1,
      name: "Mike Rodriguez",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      rating: 4.9,
      reviews: 127,
      specialties: ["Emergency Repairs", "Water Heaters", "Pipe Installation"],
      experience: "8 years",
      hourlyRate: 85,
      location: "Downtown Area",
      distance: "2.3 miles",
      availableAt: new Date().toISOString(), // Available now
      isVerified: true,
      completedJobs: 350,
      responseTime: "15 min",
      service: "plumbing"
    },
    {
      id: 2,
      name: "Sarah Chen",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b647?w=150&h=150&fit=crop&crop=face",
      rating: 4.8,
      reviews: 98,
      specialties: ["Drain Cleaning", "Fixture Installation", "Leak Repairs"],
      experience: "6 years",
      hourlyRate: 75,
      location: "Midtown",
      distance: "3.1 miles",
      availableAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // Available in 2 hours (today)
      isVerified: true,
      completedJobs: 280,
      responseTime: "20 min",
      service: "plumbing"
    },
    {
      id: 3,
      name: "David Thompson",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      rating: 4.7,
      reviews: 156,
      specialties: ["Bathroom Remodeling", "Kitchen Plumbing", "Sewer Lines"],
      experience: "12 years",
      hourlyRate: 95,
      location: "North Side",
      distance: "4.2 miles",
      availableAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow same time
      isVerified: true,
      completedJobs: 520,
      responseTime: "10 min",
      service: "plumbing"
    },
    {
      id: 4,
      name: "Lisa Park",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
      rating: 4.9,
      reviews: 89,
      specialties: ["Smart Home Integration", "Water Filtration", "Green Solutions"],
      experience: "5 years",
      hourlyRate: 80,
      location: "West End",
      distance: "1.8 miles",
      availableAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // Available now (30 min ago)
      isVerified: true,
      completedJobs: 195,
      responseTime: "12 min",
      service: "plumbing"
    },
    {
      id: 5,
      name: "James Wilson",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
      rating: 4.8,
      reviews: 143,
      specialties: ["Panel Upgrades", "Smart Home Wiring", "Emergency Electrical"],
      experience: "10 years",
      hourlyRate: 90,
      location: "Downtown Area",
      distance: "1.9 miles",
      availableAt: new Date().toISOString(), // Available now
      isVerified: true,
      completedJobs: 425,
      responseTime: "18 min",
      service: "electrical"
    },
    {
      id: 6,
      name: "Amanda Foster",
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face",
      rating: 4.9,
      reviews: 87,
      specialties: ["LED Installation", "Outlet Repair", "Circuit Installation"],
      experience: "7 years",
      hourlyRate: 82,
      location: "Midtown",
      distance: "2.7 miles",
      availableAt: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(), // Available in 4 hours (today)
      isVerified: true,
      completedJobs: 310,
      responseTime: "12 min",
      service: "electrical"
    },
    {
      id: 7,
      name: "Robert Kim",
      avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop&crop=face",
      rating: 4.7,
      reviews: 201,
      specialties: ["Industrial Electrical", "Generator Installation", "Code Updates"],
      experience: "15 years",
      hourlyRate: 105,
      location: "North Side",
      distance: "3.8 miles",
      availableAt: new Date(Date.now() + 25 * 60 * 60 * 1000).toISOString(), // Tomorrow 8 AM (approximately)
      isVerified: true,
      completedJobs: 680,
      responseTime: "25 min",
      service: "electrical"
    },
    {
      id: 8,
      name: "Carlos Martinez",
      avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face",
      rating: 4.8,
      reviews: 112,
      specialties: ["AC Repair", "Heating Systems", "Duct Cleaning"],
      experience: "9 years",
      hourlyRate: 88,
      location: "South Side",
      distance: "2.1 miles",
      availableAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // Available in 30 minutes
      isVerified: true,
      completedJobs: 390,
      responseTime: "16 min",
      service: "hvac"
    },
    {
      id: 9,
      name: "Jennifer Adams",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
      rating: 4.9,
      reviews: 76,
      specialties: ["Energy Efficiency", "Smart Thermostats", "System Maintenance"],
      experience: "6 years",
      hourlyRate: 85,
      location: "West End",
      distance: "1.5 miles",
      availableAt: new Date().toISOString(), // Available now
      isVerified: true,
      completedJobs: 245,
      responseTime: "14 min",
      service: "hvac"
    },
    {
      id: 10,
      name: "Maria Gonzalez",
      avatar: "https://images.unsplash.com/photo-1559941861-fd316294e32c?w=150&h=150&fit=crop&crop=face",
      rating: 4.9,
      reviews: 234,
      specialties: ["Deep Cleaning", "Move-in/out", "Post-Construction"],
      experience: "8 years",
      hourlyRate: 65,
      location: "Downtown Area",
      distance: "1.2 miles",
      availableAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // Available in 15 minutes
      isVerified: true,
      completedJobs: 890,
      responseTime: "10 min",
      service: "cleaning"
    },
    {
      id: 11,
      name: "Kevin Johnson",
      avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=face",
      rating: 4.7,
      reviews: 156,
      specialties: ["Carpet Cleaning", "Window Cleaning", "Office Cleaning"],
      experience: "5 years",
      hourlyRate: 55,
      location: "Midtown",
      distance: "2.8 miles",
      availableAt: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(), // Available in 6 hours (today)
      isVerified: true,
      completedJobs: 420,
      responseTime: "22 min",
      service: "cleaning"
    },
    {
      id: 12,
      name: "Rachel Thompson",
      avatar: "https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=150&h=150&fit=crop&crop=face",
      rating: 4.8,
      reviews: 98,
      specialties: ["Green Cleaning", "Sanitization", "Regular Maintenance"],
      experience: "4 years",
      hourlyRate: 60,
      location: "North Side",
      distance: "3.4 miles",
      availableAt: new Date().toISOString(), // Available now
      isVerified: true,
      completedJobs: 285,
      responseTime: "15 min",
      service: "cleaning"
    },
    {
      id: 13,
      name: "Steve Anderson",
      avatar: "https://images.unsplash.com/photo-1552058544-f2b08422138a?w=150&h=150&fit=crop&crop=face",
      rating: 4.8,
      reviews: 167,
      specialties: ["Furniture Assembly", "Wall Mounting", "Small Repairs"],
      experience: "7 years",
      hourlyRate: 70,
      location: "West End",
      distance: "2.0 miles",
      availableAt: new Date(Date.now() + 45 * 60 * 1000).toISOString(), // Available in 45 minutes
      isVerified: true,
      completedJobs: 520,
      responseTime: "13 min",
      service: "handyman"
    },
    {
      id: 14,
      name: "Diana Lee",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=face",
      rating: 4.9,
      reviews: 89,
      specialties: ["Home Organization", "Shelving Installation", "Door Repair"],
      experience: "6 years",
      hourlyRate: 68,
      location: "South Side",
      distance: "1.7 miles",
      availableAt: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(), // Available in 3 hours (today)
      isVerified: true,
      completedJobs: 340,
      responseTime: "11 min",
      service: "handyman"
    }
  ]

  const services = [
    { id: 'plumbing', name: 'Plumbing', icon: '🔧' },
    { id: 'electrical', name: 'Electrical', icon: '⚡' },
    { id: 'hvac', name: 'HVAC', icon: '🌡️' },
    { id: 'cleaning', name: 'Cleaning', icon: '🧽' },
    { id: 'handyman', name: 'Handyman', icon: '🔨' }
  ]

  const filteredAndSortedTechnicians = allTechnicians
    .filter(tech => tech.service === selectedService)
    .filter(tech =>
      tech.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tech.specialties.some(specialty => 
        specialty.toLowerCase().includes(searchTerm.toLowerCase())
      )
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating
        case 'price':
          return a.hourlyRate - b.hourlyRate
        case 'distance':
          return parseFloat(a.distance) - parseFloat(b.distance)
        case 'availability':
          // Sort by actual availability time
          return new Date(a.availableAt).getTime() - new Date(b.availableAt).getTime()
        default:
          return 0
      }
    })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Find a Technician</h1>
              <p className="text-gray-600 mt-1">Professional service providers in your area</p>
            </div>
            
            {/* Service Selection */}
            <div className="flex flex-wrap gap-2">
              {services.map(service => (
                <button
                  key={service.id}
                  onClick={() => setSelectedService(service.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedService === service.id
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span className="mr-2">{service.icon}</span>
                  {service.name}
                </button>
              ))}
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
              placeholder="Search technicians or specialties..."
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
              <option value="distance">Sort by Distance</option>
              <option value="availability">Sort by Availability</option>
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
            const availability = formatAvailability(technician.availableAt)
            
            return (
              <div key={technician.id} className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className="relative">
                      <img
                        src={technician.avatar}
                        alt={technician.name}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                      {technician.isVerified && (
                        <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1">
                          <Shield className="w-3 h-3 text-white" />
                        </div>
                      )}
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
                          <span className="text-gray-500">({technician.reviews} reviews)</span>
                        </div>
                        <span className="text-gray-300">•</span>
                        <span className="text-gray-600">{technician.experience} experience</span>
                      </div>
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

                  {/* Stats and Info */}
                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">{technician.location} • {technician.distance}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">Responds in {technician.responseTime}</span>
                    </div>
                  </div>

                  {/* Availability */}
                  <div className="mb-4">
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                      availability.status === 'available'
                        ? 'bg-green-100 text-green-700'
                        : availability.status === 'today'
                        ? 'bg-blue-100 text-blue-700'
                        : availability.status === 'tomorrow'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      <div className={`w-2 h-2 rounded-full ${
                        availability.status === 'available'
                          ? 'bg-green-500'
                          : availability.status === 'today'
                          ? 'bg-blue-500'
                          : availability.status === 'tomorrow'
                          ? 'bg-yellow-500'
                          : 'bg-gray-500'
                      }`} />
                      {availability.text}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <button className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Book Now
                    </button>
                    <button className="px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <Phone className="w-4 h-4 text-gray-600" />
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
            <h3 className="text-xl font-medium text-gray-900 mb-2">No technicians found</h3>
            <p className="text-gray-600">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default TechnicianDisplayPage