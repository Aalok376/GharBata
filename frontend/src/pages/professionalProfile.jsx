import React, { useState, useEffect } from 'react'
import { User, Phone, Mail, Save, Edit3, X, Camera, MapPin, Wrench, Star, Clock, DollarSign } from 'lucide-react'

export default function TechnicianProfile() {
  const [profile, setProfile] = useState({})
  const [isEditing, setIsEditing] = useState(false)
  const [forFirstTime, setForFirstTime] = useState(false)
  const [editedProfile, setEditedProfile] = useState({})
  const [saving, setSaving] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)

  useEffect(() => {
    const fetchProfile = async () => {
      const formDataStr = sessionStorage.getItem('formData')
      const uusername = sessionStorage.getItem('username')

      let username = uusername || '' 
      let user = null

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
      const fname = user?.fname || ''
      const lname = user?.lname || ''

      // Check if technician profile exists
      const statusResponse = await fetch('http://localhost:5000/api/technicians/getTechnicianprofilestatus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username }),
      })

      const statusData = await statusResponse.json()
      const isFirstTime = statusResponse.status === 200 && statusData?.msg?.includes('has not been created')

      setForFirstTime(isFirstTime)
      setIsEditing(isFirstTime)

      if (isFirstTime) {
        const prof = {
          username,
          fname,
          lname,
        }
        setProfile(prof)
        setEditedProfile({
          username: prof.username || '',
          fname: prof.fname || '',
          lname: prof.lname || '',
          profession: '',
          serviceLocation: '',
          availability: '',
          currentLocation: '',
          specialties: [],
          experience: '0 years',
          hourlyRate: 0,
          responseTime: 'Not specified',
          profilePic: '',
        })
      } else {
        // Fetch existing technician profile
        const profileResponse = await fetch('http://localhost:5000/api/technicians/getTechnicianProfile', {
          method: 'GET',
          credentials: 'include',
        })

        let profileData = await profileResponse.json()
        profileData = Array.isArray(profileData) ? profileData : [profileData]
        const prof = profileData[0].user || {}

        const techData = prof.technician_id

        const mergedProfile = {
          fname: techData.fname,
          lname: techData.lname,
          username: techData.username,
          profession: prof.profession,
          serviceLocation: prof.serviceLocation,
          availability: prof.availability,
          currentLocation: prof.currentLocation,
          specialties: prof.specialties || [],
          experience: prof.experience,
          hourlyRate: prof.hourlyRate,
          responseTime: prof.responseTime,
          profilePic: prof.profilePic,
          rating: prof.rating,
          tasksCompleted: prof.tasksCompleted,
          reviews: prof.reviews,
          _id: prof._id
        }
        setProfile(mergedProfile)
        setEditedProfile(mergedProfile)
      }
    }

    fetchProfile()
  }, [])

  const handleInputChange = (field, value) => {
    setEditedProfile(prev => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSpecialtyAdd = (specialty) => {
    if (specialty && !editedProfile.specialties.includes(specialty)) {
      setEditedProfile(prev => ({
        ...prev,
        specialties: [...prev.specialties, specialty]
      }))
    }
  }

  const handleSpecialtyRemove = (specialty) => {
    setEditedProfile(prev => ({
      ...prev,
      specialties: prev.specialties.filter(s => s !== specialty)
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const formData = new FormData()
      formData.append('username', editedProfile.username)
      formData.append('fname', editedProfile.fname)
      formData.append('lname', editedProfile.lname)
      formData.append('profession', editedProfile.profession)
      formData.append('serviceLocation', editedProfile.serviceLocation)
      formData.append('availability', editedProfile.availability)
      formData.append('currentLocation', editedProfile.currentLocation)
      formData.append('specialties', JSON.stringify(editedProfile.specialties))
      formData.append('experience', editedProfile.experience)
      formData.append('hourlyRate', editedProfile.hourlyRate)
      formData.append('responseTime', editedProfile.responseTime)
      
      if (selectedFile) {
        formData.append('profilePic', selectedFile)
      }

      const endpoint = forFirstTime
        ? 'http://localhost:5000/api/technicians/createTechnician'
        : 'http://localhost:5000/api/technicians/updateTechnician'

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
        setForFirstTime(false)
        setShowSuccess(true)

        sessionStorage.removeItem('formData')
      } else {
        console.error('Failed to save profile')
      }
    } catch (error) {
      console.error('Save error:', error)
    }

    setSaving(false)
    setTimeout(() => setShowSuccess(false), 3000)
  }

  const handleCancel = () => {
    setEditedProfile(profile)
    setIsEditing(false)
    setSelectedFile(null)
  }

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      setSelectedFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        handleInputChange('profilePic', e.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-8 px-4">
      {/* Success Notification */}
      <div className={`fixed top-4 right-4 z-50 transform transition-all duration-300 ${showSuccess ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}>
        <div className="bg-emerald-500 text-white px-6 py-3 rounded-xl shadow-lg flex items-center space-x-2">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          <span>Profile updated successfully!</span>
        </div>
      </div>

      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden backdrop-blur-sm border border-white/20">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 px-6 py-8 text-center relative overflow-hidden">
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
                    className="w-28 h-28 rounded-full border-4 border-white object-cover shadow-lg transition-transform group-hover:scale-105"
                  />
                ) : (
                  <div className="w-28 h-28 rounded-full border-4 border-white bg-gray-300 shadow-lg flex items-center justify-center text-gray-500 text-xl font-semibold">
                    {(isEditing ? editedProfile?.fname : profile?.fname)?.charAt(0) || 'T'}
                    {(isEditing ? editedProfile?.lname : profile?.lname)?.charAt(0) || 'P'}
                  </div>
                )}
                {isEditing && (
                  <label className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="w-6 h-6 text-white" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
              <h1 className="text-white text-2xl font-bold mt-4 tracking-wide">
                {isEditing ? editedProfile?.fname : profile?.fname} {isEditing ? editedProfile?.lname : profile?.lname}
              </h1>
              <p className="text-indigo-100 text-sm mt-1 font-medium">
                {(isEditing ? editedProfile?.profession : profile?.profession) || 'Professional Technician'}
              </p>
            </div>
          </div>

          {/* Stats Section */}
          <div className="p-6 bg-gradient-to-br from-slate-50 to-gray-50 border-b">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center p-4 bg-white rounded-xl shadow-sm">
                <div className="text-2xl font-bold text-indigo-600 flex items-center justify-center">
                  <Star className="w-5 h-5 text-yellow-500 mr-1" />
                  {profile?.rating || '0.0'}
                </div>
                <div className="text-sm text-gray-600">Rating</div>
              </div>
              <div className="text-center p-4 bg-white rounded-xl shadow-sm">
                <div className="text-2xl font-bold text-green-600">{profile?.tasksCompleted || '0'}</div>
                <div className="text-sm text-gray-600">Jobs Done</div>
              </div>
            </div>
            
            <div className="space-y-3 text-sm">
              <div className="flex items-center text-gray-600">
                <Clock className="w-4 h-4 mr-2 text-indigo-600" />
                <span>{profile?.responseTime || 'Not specified'}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <DollarSign className="w-4 h-4 mr-2 text-indigo-600" />
                <span>${profile?.hourlyRate || '0'}/hour</span>
              </div>
            </div>
          </div>

          {/* Form Content */}
          <div className="p-6 space-y-6">
            {/* Personal Information */}
            <InputGroup icon={<User />} label="Full Name" isEditing={isEditing}>
              {isEditing ? (
                <>
                  <input
                    type="text"
                    value={editedProfile?.fname || ''}
                    onChange={(e) => handleInputChange('fname', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                    placeholder="Enter your first name"
                  />
                  <input
                    type="text"
                    value={editedProfile?.lname || ''}
                    onChange={(e) => handleInputChange('lname', e.target.value)}
                    className="w-full mt-2 px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                    placeholder="Enter your last name"
                  />
                </>
              ) : (
                <p className="text-slate-900 font-medium text-lg">{profile?.fname} {profile?.lname}</p>
              )}
            </InputGroup>

            <InputGroup icon={<Mail />} label="Email Address" isEditing={isEditing}>
              <input
                type="email"
                value={editedProfile?.username || ''}
                readOnly
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl bg-gray-100 text-gray-600 cursor-not-allowed"
              />
            </InputGroup>

            <InputGroup icon={<Wrench />} label="Profession" isEditing={isEditing}>
              {isEditing ? (
                <select
                  value={editedProfile?.profession || ''}
                  onChange={(e) => handleInputChange('profession', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                >
                  <option value="">Select Profession</option>
                  <option value="Plumber">Plumber</option>
                  <option value="Electrician">Electrician</option>
                  <option value="HVAC">HVAC Technician</option>
                  <option value="Handyman">Handyman</option>
                  <option value="Cleaner">Cleaner</option>
                  <option value="Gardener">Gardener</option>
                </select>
              ) : (
                <p className="text-slate-900 font-medium">{profile?.profession}</p>
              )}
            </InputGroup>

            <InputGroup icon={<Clock />} label="Experience" isEditing={isEditing}>
              {isEditing ? (
                <select
                  value={editedProfile?.experience || ''}
                  onChange={(e) => handleInputChange('experience', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                >
                  <option value="0 years">Less than 1 year</option>
                  <option value="1-2 years">1-2 years</option>
                  <option value="3-5 years">3-5 years</option>
                  <option value="5-10 years">5-10 years</option>
                  <option value="10+ years">10+ years</option>
                </select>
              ) : (
                <p className="text-slate-900 font-medium">{profile?.experience}</p>
              )}
            </InputGroup>

            <InputGroup icon={<DollarSign />} label="Hourly Rate ($)" isEditing={isEditing}>
              {isEditing ? (
                <input
                  type="number"
                  value={editedProfile?.hourlyRate || ''}
                  onChange={(e) => handleInputChange('hourlyRate', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                  placeholder="Enter your hourly rate"
                />
              ) : (
                <p className="text-slate-900 font-medium">${profile?.hourlyRate}</p>
              )}
            </InputGroup>

            <InputGroup icon={<Clock />} label="Response Time" isEditing={isEditing}>
              {isEditing ? (
                <select
                  value={editedProfile?.responseTime || ''}
                  onChange={(e) => handleInputChange('responseTime', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                >
                  <option value="Within 1 hour">Within 1 hour</option>
                  <option value="Within 2 hours">Within 2 hours</option>
                  <option value="Same day">Same day</option>
                  <option value="Within 24 hours">Within 24 hours</option>
                </select>
              ) : (
                <p className="text-slate-900 font-medium">{profile?.responseTime}</p>
              )}
            </InputGroup>

            <InputGroup icon={<MapPin />} label="Service Location" isEditing={isEditing}>
              {isEditing ? (
                <input
                  type="text"
                  value={editedProfile?.serviceLocation || ''}
                  onChange={(e) => handleInputChange('serviceLocation', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                  placeholder="Enter service areas"
                />
              ) : (
                <p className="text-slate-900 font-medium">{profile?.serviceLocation}</p>
              )}
            </InputGroup>

            <InputGroup icon={<MapPin />} label="Current Location" isEditing={isEditing}>
              {isEditing ? (
                <input
                  type="text"
                  value={editedProfile?.currentLocation || ''}
                  onChange={(e) => handleInputChange('currentLocation', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                  placeholder="Enter current location"
                />
              ) : (
                <p className="text-slate-900 font-medium">{profile?.currentLocation}</p>
              )}
            </InputGroup>

            <InputGroup icon={<Clock />} label="Availability" isEditing={isEditing}>
              {isEditing ? (
                <textarea
                  value={editedProfile?.availability || ''}
                  onChange={(e) => handleInputChange('availability', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none resize-none"
                  rows="2"
                  placeholder="Describe your availability (e.g., Mon-Fri 9AM-6PM)"
                />
              ) : (
                <p className="text-slate-900 font-medium">{profile?.availability}</p>
              )}
            </InputGroup>

            {/* Specialties */}
            <div className="group">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center group-hover:bg-indigo-200 transition-colors">
                  <Wrench className="w-5 h-5 text-indigo-600" />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Specialties</label>
                  {isEditing ? (
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-2">
                        {editedProfile?.specialties?.map((specialty, index) => (
                          <div
                            key={index}
                            className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium flex items-center"
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
                      {profile?.specialties?.map((specialty, index) => (
                        <div
                          key={index}
                          className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium"
                        >
                          {specialty}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="p-6 bg-gradient-to-br from-slate-50 to-gray-50 space-y-3">
            {isEditing ? (
              <div className="flex space-x-3">
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
                onClick={() => setIsEditing(true)}
                className="w-full flex items-center justify-center space-x-2 bg-white border-2 border-slate-200 text-slate-700 py-4 px-6 rounded-xl hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50 transition-all duration-200 font-semibold shadow-sm hover:shadow-md"
              >
                <Edit3 className="w-5 h-5" />
                <span>Edit Profile</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function InputGroup({ icon, label, isEditing, children }) {
  return (
    <div className="group">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center group-hover:bg-indigo-200 transition-colors">
          {icon}
        </div>
        <div className="flex-1">
          <label className="block text-sm font-semibold text-slate-700 mb-2">{label}</label>
          {children}
        </div>
      </div>
    </div>
  )
}