import React, { useState, useEffect } from 'react'
import { Star, MapPin, Clock, Shield, Phone, Calendar, Filter, Search } from 'lucide-react'
import api from '../utils/api'

const TechnicianDisplayPage = () => {
  const [selectedService, setSelectedService] = useState('Electrician')
  const [sortBy, setSortBy] = useState('rating')
  const [searchTerm, setSearchTerm] = useState('')

  const [allTechnicians, setAllTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTechnicians = async () => {
      try {
        const response = await api.get("/api/technicians");
        const mappedTechnicians = response.data.map(tech => ({
          id: tech._id,
          name: tech.name || "No Name",
          avatar: tech.avatar || "fallback-url.jpg",
          rating: tech.rating || 0,
          reviews: tech.reviews || 0,
          specialties: tech.specialties || [],
          experience: tech.experience || "N/A",
          hourlyRate: tech.hourlyRate || 0,
          location: tech.serviceLocation || "Unknown",
          distance: tech.distance || "0", // In miles, string expected for parsing later
          availableAt: tech.availability || new Date().toISOString(),
          isVerified: tech.isVerified || false,
          completedJobs: tech.tasksCompleted || 0,
          responseTime: tech.responseTime || "N/A",
          service: tech.profession || "general"
        }));

        setAllTechnicians(mappedTechnicians);
      } catch (err) {
        console.error("Failed to fetch technicians", err);
        setError("Unable to load technicians. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchTechnicians();
  }, []);

console.log("All Technicians:", allTechnicians);

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
      {loading && (
        <div className="text-center py-12 text-gray-600">Loading technicians...</div>
      )}

      {error && (
        <div className="text-center py-12 text-red-500">{error}</div>
      )}

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