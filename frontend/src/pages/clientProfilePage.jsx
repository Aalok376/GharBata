import React, { useState, useEffect } from 'react'
import { User, Phone, Mail, Save, Edit3, X, Camera, MapPin } from 'lucide-react'

export default function ClientProfile() {
  const [profile, setProfile] = useState({})
  const [isEditing, setIsEditing] = useState(false)
  const [forFirstTime, setForFirstTime] = useState(false)
  const [editedProfile, setEditedProfile] = useState({})
  const [saving, setSaving] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)

  useEffect(() => {
    const fetchProfile = async () => {
      const user = JSON.parse(sessionStorage.getItem('formData'))

      const username=user.username
      const fname = user.fname
      const lname = user.lname

      console.log(username)

      const statusResponse = await fetch('http://localhost:5000/api/clients/getClientprofilestatus', {
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
          contactNumber: '',
          address: '',
          profilePic: '',
        })
      } else {
        const profileResponse = await fetch('http://localhost:5000/api/clients/getClientProfile', {
          method: 'GET',
          credentials: 'include',
        })

        let profileData = await profileResponse.json()
        profileData = Array.isArray(profileData) ? profileData : [profileData]
        const prof = profileData[0].user || {}

        setProfile(prof)
        setEditedProfile(prof)
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

  const handleSave = async () => {
    setSaving(true)
    try {
      const formData = new FormData()
      formData.append('username', editedProfile.username)
      formData.append('fname', editedProfile.fname)
      formData.append('lname', editedProfile.lname)
      formData.append('contactNumber', editedProfile.contactNumber)
      formData.append('address', editedProfile.address)
      if (selectedFile) {
        formData.append('profilePic', selectedFile)
      }

      const response = await fetch('http://localhost:5000/api/clients/createClient', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        setProfile(data.client || editedProfile)
        setIsEditing(false)
        setForFirstTime(false)
        setShowSuccess(true)
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
      <div className={`fixed top-4 right-4 z-50 transform transition-all duration-300 ${showSuccess ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}>
        <div className="bg-emerald-500 text-white px-6 py-3 rounded-xl shadow-lg flex items-center space-x-2">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          <span>Profile updated successfully!</span>
        </div>
      </div>

      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden backdrop-blur-sm border border-white/20">
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
                    No Image
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
              <p className="text-indigo-100 text-sm mt-1 font-medium">Premium Client</p>
            </div>
          </div>

          <div className="p-6 space-y-6">
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
              {isEditing ? (
                <input
                  type="email"
                  value={editedProfile?.username || ''}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                  placeholder="Enter your email"
                />
              ) : (
                <p className="text-slate-900 font-medium">{profile?.username}</p>
              )}
            </InputGroup>

            <InputGroup icon={<Phone />} label="Phone Number" isEditing={isEditing}>
              {isEditing ? (
                <input
                  type="tel"
                  value={editedProfile?.contactNumber || ''}
                  onChange={(e) => handleInputChange('contactNumber', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                  placeholder="Enter your phone number"
                />
              ) : (
                <p className="text-slate-900 font-medium">{profile?.contactNumber}</p>
              )}
            </InputGroup>

            <InputGroup icon={<MapPin />} label="Address" isEditing={isEditing}>
              {isEditing ? (
                <textarea
                  value={editedProfile?.address || ''}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none resize-none"
                  rows="2"
                  placeholder="Enter your address"
                />
              ) : (
                <p className="text-slate-900 font-medium">{profile?.address}</p>
              )}
            </InputGroup>
          </div>

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
