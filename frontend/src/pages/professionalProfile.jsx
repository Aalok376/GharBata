import React, { useState, useEffect } from 'react'
import { User, Phone, Mail, Save, Edit3, X, Camera, MapPin, Wrench, Star, Clock, DollarSign, AlertCircle } from 'lucide-react'
import { useParams, useNavigate } from 'react-router-dom'

export default function TechnicianProfile() {
  const [profile, setProfile] = useState({})
  const [isEditing, setIsEditing] = useState(false)
  const [forFirstTime, setForFirstTime] = useState(false)
  const [editedProfile, setEditedProfile] = useState({})
  const [saving, setSaving] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [isOwnProfile, setIsOwnProfile] = useState(false)
  const [validationErrors, setValidationErrors] = useState({})
  const [stats, setStats] = useState({}) // New state for stats

  const { userId } = useParams()
  const navigate = useNavigate()

  const professionOptions = [
    'Plumber', 'Electrician', 'HVAC-Technician', 'Handyman', 'Cleaner', 'Gardener',
    'Carpenter', 'Painter', 'Appliance-Repair', 'Locksmith', 'Pest-Control',
    'Roofing-Specialist', 'Flooring-Specialist', 'Door-Installer'
  ]

  const daysOfWeek = [
    { key: 'sunday', label: 'Sunday', short: 'Sun' },
    { key: 'monday', label: 'Monday', short: 'Mon' },
    { key: 'tuesday', label: 'Tuesday', short: 'Tue' },
    { key: 'wednesday', label: 'Wednesday', short: 'Wed' },
    { key: 'thursday', label: 'Thursday', short: 'Thu' },
    { key: 'friday', label: 'Friday', short: 'Fri' },
    { key: 'saturday', label: 'Saturday', short: 'Sat' }
  ]

  // New function to fetch stats
  const fetchStats = async (technicianId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/bookings/stats/overview?technician_id=${technicianId}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setStats(data.stats || {})
      } else {
        console.error('Failed to fetch stats')
        setStats({})
      }
    } catch (error) {
      console.error('Stats fetch error:', error)
      setStats({})
    }
  }

  // Validation function
  const validateProfile = (profile) => {
    const errors = {}

    // First name is required
    if (!profile.fname?.trim()) {
      errors.fname = 'First name is required'
    }

    // Last name is required
    if (!profile.lname?.trim()) {
      errors.lname = 'Last name is required'
    }

    // At least one profession must be selected
    if (!profile.professions || profile.professions.length === 0) {
      errors.professions = 'At least one profession must be selected'
    }

    // If professions are selected, their rates must be defined
    if (profile.professions && profile.professions.length > 0) {
      const missingRates = []
      profile.professions.forEach(profession => {
        const rate = profile.hourlyRate?.[profession]
        if (!rate || rate === '' || rate === '0' || parseFloat(rate) <= 0) {
          missingRates.push(profession)
        }
      })
      if (missingRates.length > 0) {
        errors.hourlyRate = `Please set hourly rates for: ${missingRates.join(', ')}`
      }
    }

    // Current location is required
    if (!profile.currentLocation?.trim()) {
      errors.currentLocation = 'Current location is required'
    }

    // Service location is required
    if (!profile.serviceLocation?.trim()) {
      errors.serviceLocation = 'Service location is required'
    }

    // Experience is required
    if (!profile.experience?.trim()) {
      errors.experience = 'Experience level is required'
    }

    // Response time is required
    if (!profile.responseTime?.trim()) {
      errors.responseTime = 'Response time is required'
    }

    // At least one day must be available
    const hasAvailability = profile.availability && 
      Object.values(profile.availability).some(day => day.available === true)
    if (!hasAvailability) {
      errors.availability = 'At least one day must be marked as available'
    }

    return errors
  }

  // Helper function to get average hourly rate or first available rate
  const getDisplayRate = (hourlyRate) => {
    if (!hourlyRate || typeof hourlyRate !== 'object') return '0'

    const rates = Object.values(hourlyRate).filter(rate => rate && !isNaN(rate))
    if (rates.length === 0) return '0'

    // Return average rate
    const average = rates.reduce((sum, rate) => sum + parseFloat(rate), 0) / rates.length
    return Math.round(average).toString()
  }

  useEffect(() => {
    const fetchProfile = async () => {
      const formDataStr = sessionStorage.getItem('formData')
      const ownUserId = sessionStorage.getItem('userId')

      const userrname = sessionStorage.getItem('username')

      // Check if the profile being viewed belongs to the current user
      const isOwn = ownUserId === userId
      setIsOwnProfile(isOwn)

      let user = null
      let username = userrname || ''

      if (formDataStr) {
        try {
          user = JSON.parse(formDataStr)
          if (user && user.username) {
            username = user.username
          }
        } catch (error) {
          console.error('Error parsing formData from sessionStorage:', error)
        }
      }

      console.log('Resolved username:', username)
      console.log('Is own profile:', isOwn)

      const fname = user?.fname || ''
      const lname = user?.lname || ''

      try {
        const statusResponse = await fetch('http://localhost:5000/api/clients/getClientprofilestatus', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ userId }),
        })

        if (!statusResponse.ok) throw new Error('Status fetch failed')

        const statusData = await statusResponse.json()
        const isFirstTime = statusData?.msg?.includes('has not been created')
        setForFirstTime(isFirstTime)

        // Only set editing mode if it's the user's own profile AND it's first time
        setIsEditing(isFirstTime && isOwn)

        if (isFirstTime) {
          const prof = {
            username, fname, lname,
            professions: [],
            serviceLocation: '',
            availability: Object.fromEntries(daysOfWeek.map(day => [day.key, { available: false, startTime: '09:00', endTime: '17:00' }])),
            currentLocation: '',
            specialties: [],
            experience: 'Less than 1 year',
            hourlyRate: {},
            responseTime: 'Within 1 hour',
            profilePic: '',
          }
          setProfile(prof)
          setEditedProfile(prof)
        } else {
          const profileResponse = await fetch('http://localhost:5000/api/technicians/getTechnicians', {
            method: 'POST',
            credentials: 'include',
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({ userId })
          })

          if (!profileResponse.ok) throw new Error('Profile fetch failed')

          let profileData = await profileResponse.json()
          profileData = Array.isArray(profileData) ? profileData : [profileData]
          const prof = profileData[0].technician || {}

          console.log(prof)

          const mergedProfile = {
            fname: prof.user?.fname || fname,
            lname: prof.user?.lname || lname,
            username: prof.user?.username || username,
            professions: prof.professions || [prof.profession].filter(Boolean),
            serviceLocation: prof.serviceLocation || '',
            availability: prof.availability || Object.fromEntries(daysOfWeek.map(day => [day.key, { available: false, startTime: '09:00', endTime: '17:00' }])),
            currentLocation: prof.currentLocation || '',
            specialties: prof.specialties || [],
            experience: prof.experience || 'Less than 1 year',
            hourlyRate: prof.hourlyRate || {},
            responseTime: prof.responseTime || 'Within 1 hour',
            profilePic: prof.profilePic || '',
            rating: prof.rating || 0,
            tasksCompleted: prof.tasksCompleted || 0
          }
          setProfile(mergedProfile)
          setEditedProfile(mergedProfile)

          // Only fetch stats for existing profiles (not first time)
          if (!isFirstTime) {
            const technicianId = prof._id || userId
            await fetchStats(technicianId)
          }
        }
      } catch (error) {
        console.error('Fetch error:', error)
      }
    }

    fetchProfile()
  }, [userId]) // Added userId as dependency

  const handleInputChange = (field, value) => {
    setEditedProfile(prev => ({ ...prev, [field]: value }))
    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const handleProfessionRateChange = (profession, rate) => {
    setEditedProfile(prev => ({
      ...prev,
      hourlyRate: {
        ...prev.hourlyRate,
        [profession]: rate
      }
    }))
    // Clear hourly rate validation error when user enters a rate
    if (validationErrors.hourlyRate && rate && parseFloat(rate) > 0) {
      setValidationErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors.hourlyRate
        return newErrors
      })
    }
  }

  const handleProfessionToggle = (profession) => {
    setEditedProfile(prev => {
      const professions = prev.professions || []
      const exists = professions.includes(profession)
      const updated = exists ? professions.filter(p => p !== profession) : [...professions, profession]
      const updatedRates = { ...prev.hourlyRate }
      if (!exists) updatedRates[profession] = prev.hourlyRate?.[profession] || ''
      else delete updatedRates[profession]
      return {
        ...prev,
        professions: updated,
        hourlyRate: updatedRates
      }
    })
    // Clear professions validation error when user selects a profession
    if (validationErrors.professions) {
      setValidationErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors.professions
        return newErrors
      })
    }
  }

  const handleAvailabilityChange = (day, field, value) => {
    setEditedProfile(prev => ({
      ...prev,
      availability: {
        ...prev.availability,
        [day]: {
          ...prev.availability?.[day],
          [field]: value
        }
      }
    }))
    // Clear availability validation error when user marks a day as available
    if (validationErrors.availability && field === 'available' && value === true) {
      setValidationErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors.availability
        return newErrors
      })
    }
  }

  const handleSpecialtyAdd = (specialty) => {
    if (specialty && !(editedProfile.specialties || []).includes(specialty)) {
      setEditedProfile(prev => ({
        ...prev,
        specialties: [...(prev.specialties || []), specialty]
      }))
    }
  }

  const handleSpecialtyRemove = (specialty) => {
    setEditedProfile(prev => ({
      ...prev,
      specialties: (prev.specialties || []).filter(s => s !== specialty)
    }))
  }

  const handleSave = async () => {
    // Only allow saving if it's the user's own profile
    if (!isOwnProfile) return

    // Validate the profile
    const errors = validateProfile(editedProfile)
    setValidationErrors(errors)

    // If there are validation errors, don't proceed with save
    if (Object.keys(errors).length > 0) {
      // Scroll to first error
      const firstErrorElement = document.querySelector('.border-red-300')
      if (firstErrorElement) {
        firstErrorElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
      return
    }

    setSaving(true)
    try {
      const formData = new FormData()
      const fieldsToAppend = ['username', 'fname', 'lname', 'serviceLocation', 'currentLocation', 'experience', 'responseTime']

      fieldsToAppend.forEach(key => {
        formData.append(key, editedProfile[key] || '')
      })

      formData.append('professions', JSON.stringify(editedProfile.professions || []))
      formData.append('availability', JSON.stringify(editedProfile.availability || {}))
      formData.append('specialties', JSON.stringify(editedProfile.specialties || []))
      formData.append('hourlyRate', JSON.stringify(editedProfile.hourlyRate || {}))

      if (selectedFile) formData.append('profilePic', selectedFile)

      const endpoint = forFirstTime
        ? 'http://localhost:5000/api/technicians/createTechnicians'
        : 'http://localhost:5000/api/technicians/updateTechnicians'

      const response = await fetch(endpoint, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        const updatedTechnician = data.technician || editedProfile
        const updatedProfile = {
          ...updatedTechnician,
          fname: updatedTechnician.fname || editedProfile.fname,
          lname: updatedTechnician.lname || editedProfile.lname,
          username: updatedTechnician.username || editedProfile.username,
        }
        setProfile(updatedProfile)
        setEditedProfile(updatedProfile)
        setIsEditing(false)
        setValidationErrors({}) // Clear validation errors on successful save
        sessionStorage.removeItem('formData')

        // Refresh stats after profile update (only for existing profiles)
        if (!forFirstTime) {
          const technicianId = updatedTechnician._id || userId
          await fetchStats(technicianId)
        }

        // Show success message
        setShowSuccess(true)

        // Handle navigation based on whether it's first time or not
        if (forFirstTime) {
          // For first-time users, navigate to /professional after a short delay
          setTimeout(() => {
            setShowSuccess(false)
            navigate('/professional/dashboard')
          }, 2000) // 2 second delay to show success message
        } else {
          // For existing users, just hide success after 3 seconds
          setForFirstTime(false)
          setTimeout(() => setShowSuccess(false), 3000)
        }
      } else {
        console.error('Failed to save profile')
      }
    } catch (error) {
      console.error('Save error:', error)
    }
    setSaving(false)
  }

  const handleCancel = () => {
    setEditedProfile(profile)
    setIsEditing(false)
    setSelectedFile(null)
    setValidationErrors({}) // Clear validation errors on cancel
  }

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      setSelectedFile(file)
      const reader = new FileReader()
      reader.onload = (e) => handleInputChange('profilePic', e.target.result)
      reader.readAsDataURL(file)
    }
  }

  // Only allow editing if it's the user's own profile
  const handleEditClick = () => {
    if (isOwnProfile) {
      setIsEditing(true)
    }
  }

  // Validation error component
  const ValidationError = ({ error }) => {
    if (!error) return null
    return (
      <div className="flex items-center mt-2 text-red-600 text-sm">
        <AlertCircle className="w-4 h-4 mr-1" />
        <span>{error}</span>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-8 px-4">
      {/* Success Notification - Only show for own profile */}
      {isOwnProfile && (
        <div className={`fixed top-4 right-4 z-50 transform transition-all duration-300 ${showSuccess ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}>
          <div className="bg-emerald-500 text-white px-6 py-3 rounded-xl shadow-lg flex items-center space-x-2">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            <span>
              {forFirstTime
                ? 'Profile created successfully! Redirecting to dashboard...'
                : 'Profile updated successfully!'
              }
            </span>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden backdrop-blur-sm border border-white/20">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 px-8 py-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-black/10 to-transparent"></div>
            <div className="absolute -top-4 -right-4 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
            <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-white/10 rounded-full blur-lg"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>

            <div className="relative">
              <div className="relative inline-block group">
                {(isEditing ? editedProfile?.profilePic : profile?.profilePic) ? (
                  <img
                    src={isEditing ? editedProfile.profilePic : profile.profilePic}
                    alt="Profile"
                    className="w-32 h-32 rounded-full border-4 border-white object-cover shadow-lg transition-transform group-hover:scale-105"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full border-4 border-white bg-gray-300 shadow-lg flex items-center justify-center text-gray-500 text-2xl font-semibold">
                    {(isEditing ? editedProfile?.fname : profile?.fname)?.charAt(0) || 'T'}
                    {(isEditing ? editedProfile?.lname : profile?.lname)?.charAt(0) || 'P'}
                  </div>
                )}
                {/* Only show camera upload for own profile when editing */}
                {isEditing && isOwnProfile && (
                  <label className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="w-8 h-8 text-white" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
              <h1 className="text-white text-3xl font-bold mt-6 tracking-wide">
                {isEditing ? editedProfile?.fname : profile?.fname} {isEditing ? editedProfile?.lname : profile?.lname}
              </h1>
              <div className="text-indigo-100 text-lg mt-2 font-medium">
                {(isEditing ? editedProfile?.professions : profile?.professions)?.length > 0
                  ? (isEditing ? editedProfile.professions : profile.professions).join(' • ')
                  : 'Professional Technician'}
              </div>
              {/* Show profile ownership indicator */}
              {!isOwnProfile && (
                <div className="mt-3 inline-block bg-white/20 text-white px-3 py-1 rounded-full text-sm">
                  Viewing Profile
                </div>
              )}
            </div>
          </div>

          {/* Stats Section - Updated to use API data */}
          <div className="p-8 bg-gradient-to-br from-slate-50 to-gray-50 border-b">
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div className="text-center p-6 bg-white rounded-xl shadow-sm">
                <div className="text-3xl font-bold text-indigo-600 flex items-center justify-center">
                  <Star className="w-6 h-6 text-yellow-500 mr-1" />
                  {
                    // Use stats from API, fallback to profile data, then default
                    stats?.avg_rating 
                      ? parseFloat(stats.avg_rating).toFixed(1)
                      : (typeof profile?.rating === 'number'
                        ? profile.rating.toFixed(1)
                        : (typeof profile?.rating?.average === 'number'
                          ? profile.rating.average.toFixed(1)
                          : '0.0'))
                  }
                </div>
                <div className="text-sm text-gray-600 mt-1">Rating</div>
              </div>
              <div className="text-center p-6 bg-white rounded-xl shadow-sm">
                <div className="text-3xl font-bold text-green-600">
                  {
                    // Use completed bookings from API, fallback to profile data, then default
                    stats?.completed || profile?.tasksCompleted || '0'
                  }
                </div>
                <div className="text-sm text-gray-600 mt-1">Jobs Done</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 text-sm">
              <div className="flex items-center text-gray-600 p-4 bg-white rounded-xl shadow-sm">
                <Clock className="w-5 h-5 mr-3 text-indigo-600" />
                <span className="font-medium">{profile?.responseTime || 'Not specified'}</span>
              </div>
              <div className="flex items-center text-gray-600 p-4 bg-white rounded-xl shadow-sm">
                <p className="w-5 h-5 mr-3 text-indigo-600 font-semibold">Rate</p>
                <span className="font-medium">Rs.{getDisplayRate(profile?.hourlyRate)}/hour</span>
              </div>
            </div>
          </div>

          {/* Form Content */}
          <div className="p-8 grid grid-cols-1 xl:grid-cols-2 gap-12">
            {/* Left Column */}
            <div className="space-y-10">
              {/* Personal Information */}
              <InputGroup icon={<User className="w-5 h-5 text-indigo-600" />} label="Full Name" isEditing={isEditing && isOwnProfile} required={true}>
                {isEditing && isOwnProfile ? (
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <input
                          type="text"
                          value={editedProfile?.fname || ''}
                          onChange={(e) => handleInputChange('fname', e.target.value)}
                          className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none ${
                            validationErrors.fname ? 'border-red-300 bg-red-50' : 'border-slate-200'
                          }`}
                          placeholder="First name"
                        />
                        <ValidationError error={validationErrors.fname} />
                      </div>
                      <div>
                        <input
                          type="text"
                          value={editedProfile?.lname || ''}
                          onChange={(e) => handleInputChange('lname', e.target.value)}
                          className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none ${
                            validationErrors.lname ? 'border-red-300 bg-red-50' : 'border-slate-200'
                          }`}
                          placeholder="Last name"
                        />
                        <ValidationError error={validationErrors.lname} />
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-900 font-medium text-lg">{profile?.fname || ''} {profile?.lname || ''}</p>
                )}
              </InputGroup>

              <InputGroup icon={<Mail className="w-5 h-5 text-indigo-600" />} label="Email Address" isEditing={isEditing && isOwnProfile}>
                <input
                  type="email"
                  value={editedProfile?.username || ''}
                  readOnly
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl bg-gray-100 text-gray-600 cursor-not-allowed"
                />
              </InputGroup>

              {/* Professions */}
              <InputGroup icon={<Wrench className="w-5 h-5 text-indigo-600" />} label="Professions" isEditing={isEditing && isOwnProfile} required={true}>
                {isEditing && isOwnProfile ? (
                  <div className="space-y-2">
                    <div className={`grid grid-cols-2 gap-3 max-h-64 overflow-y-auto p-4 border-2 rounded-xl ${
                      validationErrors.professions ? 'border-red-300 bg-red-50' : 'border-slate-200'
                    }`}>
                      {professionOptions.map((profession) => (
                        <label key={profession} className="flex items-center space-x-3 cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={editedProfile?.professions?.includes(profession) || false}
                            onChange={() => handleProfessionToggle(profession)}
                            className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                          />
                          <span className="text-sm font-medium text-gray-700 group-hover:text-indigo-600 transition-colors">
                            {profession}
                          </span>
                        </label>
                      ))}
                    </div>
                    <ValidationError error={validationErrors.professions} />
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {(profile?.professions || []).map((profession, index) => (
                      <div
                        key={index}
                        className="bg-indigo-100 text-indigo-800 px-3 py-2 rounded-full text-sm font-medium"
                      >
                        {profession}
                      </div>
                    ))}
                  </div>
                )}
              </InputGroup>

              <InputGroup icon={<Clock className="w-5 h-5 text-indigo-600" />} label="Experience" isEditing={isEditing && isOwnProfile} required={true}>
                {isEditing && isOwnProfile ? (
                  <div className="space-y-2">
                    <select
                      value={editedProfile?.experience || ''}
                      onChange={(e) => handleInputChange('experience', e.target.value)}
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none ${
                        validationErrors.experience ? 'border-red-300 bg-red-50' : 'border-slate-200'
                      }`}
                    >
                      <option value="">Select experience level</option>
                      <option value="Less than 1 year">Less than 1 year</option>
                      <option value="1-2 years">1-2 years</option>
                      <option value="3-5 years">3-5 years</option>
                      <option value="5-10 years">5-10 years</option>
                      <option value="10+ years">10+ years</option>
                    </select>
                    <ValidationError error={validationErrors.experience} />
                  </div>
                ) : (
                  <p className="text-slate-900 font-medium">{profile?.experience || 'Not specified'}</p>
                )}
              </InputGroup>

              <div className="grid grid-cols-2 gap-8">
                <InputGroup icon={<DollarSign className="w-5 h-5 text-indigo-600" />} label="Hourly Rates" isEditing={isEditing && isOwnProfile} required={true}>
                  {isEditing && isOwnProfile ? (
                    <div className="space-y-2">
                      <div className="space-y-3">
                        {(editedProfile?.professions || []).map((profession) => (
                          <div key={profession} className={`flex items-center justify-between border-2 rounded-xl px-4 py-3 ${
                            validationErrors.hourlyRate ? 'border-red-300 bg-red-50' : 'border-slate-200'
                          }`}>
                            <span className="font-medium text-slate-800 w-1/2">{profession}</span>
                            <input
                              type="number"
                              value={editedProfile?.hourlyRate?.[profession] || ''}
                              onChange={(e) => handleProfessionRateChange(profession, e.target.value)}
                              className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                              placeholder="Rs. Rate"
                              min="1"
                            />
                          </div>
                        ))}
                      </div>
                      <ValidationError error={validationErrors.hourlyRate} />
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-2">
                      {(profile?.professions || []).map((profession) => (
                        <div key={profession} className="flex items-center justify-between border-2 border-slate-200 rounded-xl px-4 py-3">
                          <span className="font-medium text-slate-800">{profession}</span>
                          <span className="text-indigo-600 font-semibold">
                            Rs.
                            {typeof profile?.hourlyRate?.[profession] === 'number' || typeof profile?.hourlyRate?.[profession] === 'string'
                              ? profile.hourlyRate[profession]
                              : 0}
                            /hr
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </InputGroup>

                <InputGroup icon={<Clock className="w-5 h-5 text-indigo-600" />} label="Response Time" isEditing={isEditing && isOwnProfile} required={true}>
                  {isEditing && isOwnProfile ? (
                    <div className="space-y-2">
                      <select
                        value={editedProfile?.responseTime || ''}
                        onChange={(e) => handleInputChange('responseTime', e.target.value)}
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none ${
                          validationErrors.responseTime ? 'border-red-300 bg-red-50' : 'border-slate-200'
                        }`}
                      >
                        <option value="">Select response time</option>
                        <option value="Within 1 hour">Within 1 hour</option>
                        <option value="Within 2 hours">Within 2 hours</option>
                        <option value="Same day">Same day</option>
                        <option value="Within 24 hours">Within 24 hours</option>
                      </select>
                      <ValidationError error={validationErrors.responseTime} />
                    </div>
                  ) : (
                    <p className="text-slate-900 font-medium">{profile?.responseTime || 'Not specified'}</p>
                  )}
                </InputGroup>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-10">
              <InputGroup icon={<MapPin className="w-5 h-5 text-indigo-600" />} label="Service Location" isEditing={isEditing && isOwnProfile} required={true}>
                {isEditing && isOwnProfile ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={editedProfile?.serviceLocation || ''}
                      onChange={(e) => handleInputChange('serviceLocation', e.target.value)}
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none ${
                        validationErrors.serviceLocation ? 'border-red-300 bg-red-50' : 'border-slate-200'
                      }`}
                      placeholder="Enter service areas"
                    />
                    <ValidationError error={validationErrors.serviceLocation} />
                  </div>
                ) : (
                  <p className="text-slate-900 font-medium">{profile?.serviceLocation || 'Not specified'}</p>
                )}
              </InputGroup>

              <InputGroup icon={<MapPin className="w-5 h-5 text-indigo-600" />} label="Current Location" isEditing={isEditing && isOwnProfile} required={true}>
                {isEditing && isOwnProfile ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={editedProfile?.currentLocation || ''}
                      onChange={(e) => handleInputChange('currentLocation', e.target.value)}
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none ${
                        validationErrors.currentLocation ? 'border-red-300 bg-red-50' : 'border-slate-200'
                      }`}
                      placeholder="Enter current location"
                    />
                    <ValidationError error={validationErrors.currentLocation} />
                  </div>
                ) : (
                  <p className="text-slate-900 font-medium">{profile?.currentLocation || 'Not specified'}</p>
                )}
              </InputGroup>

              {/* Weekly Availability */}
              <InputGroup icon={<Clock className="w-5 h-5 text-indigo-600" />} label="Weekly Availability" isEditing={isEditing && isOwnProfile} required={true}>
                {isEditing && isOwnProfile ? (
                  <div className="space-y-2">
                    <div className={`space-y-3 border-2 rounded-xl p-4 max-h-80 overflow-y-auto ${
                      validationErrors.availability ? 'border-red-300 bg-red-50' : 'border-slate-200'
                    }`}>
                      {daysOfWeek.map((day) => (
                        <div key={day.key} className={`p-4 rounded-xl border-2 transition-all ${editedProfile?.availability?.[day.key]?.available
                          ? 'border-green-300 bg-green-50'
                          : 'border-gray-200 bg-gray-50'
                          }`}>
                          <div className="flex items-center justify-between mb-3">
                            <label className="flex items-center space-x-3 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={editedProfile?.availability?.[day.key]?.available || false}
                                onChange={(e) => handleAvailabilityChange(day.key, 'available', e.target.checked)}
                                className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                              />
                              <span className={`font-semibold ${editedProfile?.availability?.[day.key]?.available
                                ? 'text-green-800'
                                : 'text-gray-600'
                                }`}>
                                {day.label}
                              </span>
                            </label>
                            {editedProfile?.availability?.[day.key]?.available && (
                              <div className="flex items-center space-x-2 text-sm">
                                <input
                                  type="time"
                                  value={editedProfile?.availability?.[day.key]?.startTime || '09:00'}
                                  onChange={(e) => handleAvailabilityChange(day.key, 'startTime', e.target.value)}
                                  className="px-2 py-1 border border-green-300 rounded-lg focus:ring-1 focus:ring-green-500 focus:border-green-500"
                                />
                                <span className="text-green-600 font-medium">to</span>
                                <input
                                  type="time"
                                  value={editedProfile?.availability?.[day.key]?.endTime || '17:00'}
                                  onChange={(e) => handleAvailabilityChange(day.key, 'endTime', e.target.value)}
                                  className="px-2 py-1 border border-green-300 rounded-lg focus:ring-1 focus:ring-green-500 focus:border-green-500"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    <ValidationError error={validationErrors.availability} />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-2">
                    {daysOfWeek.map((day) => {
                      const dayAvailability = profile?.availability?.[day.key]
                      return (
                        <div key={day.key} className={`p-3 rounded-lg border-2 ${dayAvailability?.available
                          ? 'border-green-200 bg-green-50'
                          : 'border-gray-200 bg-gray-50'
                          }`}>
                          <div className="flex items-center justify-between">
                            <span className={`font-medium ${dayAvailability?.available
                              ? 'text-green-800'
                              : 'text-gray-500'
                              }`}>
                              {day.short}
                            </span>
                            {dayAvailability?.available ? (
                              <span className="text-green-700 text-sm font-medium">
                                {dayAvailability.startTime} - {dayAvailability.endTime}
                              </span>
                            ) : (
                              <span className="text-gray-400 text-sm">Unavailable</span>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </InputGroup>

              {/* Specialties */}
              <InputGroup icon={<Wrench className="w-5 h-5 text-indigo-600" />} label="Specialties" isEditing={isEditing && isOwnProfile}>
                {isEditing && isOwnProfile ? (
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2 min-h-[50px] p-3 border-2 border-slate-200 rounded-xl">
                      {(editedProfile?.specialties || []).map((specialty, index) => (
                        <div
                          key={index}
                          className="bg-indigo-100 text-indigo-800 px-3 py-2 rounded-full text-sm font-medium flex items-center"
                        >
                          {specialty}
                          <button
                            onClick={() => handleSpecialtyRemove(specialty)}
                            className="ml-2 text-indigo-600 hover:text-red-500"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <input
                      type="text"
                      placeholder="Add a specialty and press Enter"
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleSpecialtyAdd(e.target.value.trim())
                          e.target.value = ''
                        }
                      }}
                    />
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {(profile?.specialties || []).map((specialty, index) => (
                      <div
                        key={index}
                        className="bg-gray-100 text-gray-800 px-3 py-2 rounded-full text-sm font-medium"
                      >
                        {specialty}
                      </div>
                    ))}
                  </div>
                )}
              </InputGroup>
            </div>
          </div>

          {/* Action Buttons - Only show for own profile */}
          {isOwnProfile && (
            <div className="p-10 bg-gradient-to-br from-slate-50 to-gray-50 space-y-4">
              {isEditing ? (
                <div className="flex space-x-4">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex-1 flex items-center justify-center space-x-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white py-4 px-6 rounded-xl hover:from-indigo-600 hover:to-purple-600 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg font-semibold"
                  >
                    {saving ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <Save className="w-5 h-5" />
                    )}
                    <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                  </button>
                  {!forFirstTime && (
                    <button
                      onClick={handleCancel}
                      className="flex-1 flex items-center justify-center space-x-2 bg-slate-200 text-slate-700 py-4 px-6 rounded-xl hover:bg-slate-300 transition-all duration-200 font-semibold"
                    >
                      <X className="w-5 h-5" />
                      <span>Cancel</span>
                    </button>
                  )}
                </div>
              ) : (
                <button
                  onClick={handleEditClick}
                  className="w-full flex items-center justify-center space-x-2 bg-white border-2 border-slate-200 text-slate-700 py-4 px-6 rounded-xl hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50 transition-all duration-200 font-semibold shadow-sm hover:shadow-md"
                >
                  <Edit3 className="w-5 h-5" />
                  <span>Edit Profile</span>
                </button>
              )}
            </div>
          )}

          {/* Message for viewing other's profile */}
         {!isOwnProfile && (
  <div className="relative p-12 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 overflow-hidden">
    {/* Decorative background elements */}
    <div className="absolute top-0 left-0 w-32 h-32 bg-blue-100 rounded-full -translate-x-16 -translate-y-16 opacity-50"></div>
    <div className="absolute bottom-0 right-0 w-24 h-24 bg-purple-100 rounded-full translate-x-12 translate-y-12 opacity-50"></div>
    
    <div className="relative max-w-md mx-auto">
      {/* Profile viewing card */}
      <div className="bg-white/80 backdrop-blur-sm border border-white/50 rounded-2xl p-8 shadow-xl shadow-blue-100/50 mb-8">
        <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mx-auto mb-4">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        
        <div className="text-gray-800 font-semibold text-lg mb-2">
          Viewing {profile?.fname || 'this'} {profile?.lname || 'technician'}'s profile
        </div>
        <div className="text-gray-600 text-sm leading-relaxed">
          Ready to connect? Send a message to discuss your project needs and get professional assistance.
        </div>
      </div>
      
      {/* Message button */}
      <div className="text-center">
        <button
          type="button"
          onClick={() => navigate(`/chats/${userId}`)}
          className="group relative inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-2xl shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-transparent transform hover:scale-105 transition-all duration-300 ease-out"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <svg className="w-5 h-5 mr-3 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <span className="relative z-10">Send Message</span>
          <svg className="w-4 h-4 ml-2 relative z-10 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </button>
      </div>
    </div>
  </div>
)}
        </div>
      </div>
    </div>
  )
}

function InputGroup({ icon, label, isEditing, required, children }) {
  return (
    <div className="group">
      <div className="flex items-start space-x-4">
        <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center group-hover:bg-indigo-200 transition-colors mt-1">
          {icon}
        </div>
        <div className="flex-1">
          <label className="block text-sm font-semibold text-slate-700 mb-3">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
          {children}
        </div>
      </div>
    </div>
  )
}