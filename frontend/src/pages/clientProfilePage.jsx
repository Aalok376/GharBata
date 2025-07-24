import React, { useState } from 'react';
import { User, MessageCircle, Phone, Mail, Save, Edit3, X, Camera, MapPin, Clock, Star } from 'lucide-react';

export default function ClientProfile() {
  const [profile, setProfile] = useState({
    fname: 'John',
    lname: 'Smith',
    username: 'john.smith@email.com',
    contactNumber: '+1 (555) 123-4567',
    address: '123 Oak Street, Downtown, NY 10001',
    profilePic: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState(profile);
  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

//  useEffect(() => {
//     fetch('http://localhost:5000/api/clients/profile')
//       .then(res => res.json())
//       .then(data => setProfile(data))
//       .catch(err => console.error(err));
//   }, [])

//   const handleInputChange = (field, value) => {
//     setEditedProfile(prev => ({
//       ...prev,
//       [field]: value
//     }));
//   };

  const handleSave = async () => {
    setSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setProfile(editedProfile);
    setIsEditing(false);
    setSaving(false);
    setShowSuccess(true);
    
    // Hide success message after 3 seconds
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleCancel = () => {
    setEditedProfile(profile);
    setIsEditing(false);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        handleInputChange('profilePic', e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-8 px-4">
      {/* Success Toast */}
      <div className={`fixed top-4 right-4 z-50 transform transition-all duration-300 ${
        showSuccess ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}>
        <div className="bg-emerald-500 text-white px-6 py-3 rounded-xl shadow-lg flex items-center space-x-2">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          <span>Profile updated successfully!</span>
        </div>
      </div>

      <div className="max-w-md mx-auto">
        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden backdrop-blur-sm border border-white/20">
          {/* Header with Gradient */}
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 px-6 py-8 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-black/10 to-transparent"></div>
            <div className="absolute -top-4 -right-4 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
            <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-white/10 rounded-full blur-lg"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
            
            <div className="relative">
              <div className="relative inline-block group">
                <img
                  src={isEditing ? editedProfile.profilePic : profile.profilePic}
                  alt="Profile"
                  className="w-28 h-28 rounded-full border-4 border-white object-cover shadow-lg transition-transform group-hover:scale-105"
                />
                
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
                {isEditing ? editedProfile.fname : profile.fname}{isEditing ? editedProfile.lname : profile.lname}
              </h1>
              <p className="text-indigo-100 text-sm mt-1 font-medium">Premium Client</p>
            </div>
          </div>

          {/* Profile Content */}
          <div className="p-6 space-y-6">
            {/* Name */}
            <div className="group">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center group-hover:bg-indigo-200 transition-colors">
                  <User className="w-5 h-5 text-indigo-600" />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name</label>
                  {isEditing ? (
                   <>
                    <input
                      type="text"
                      value={editedProfile.fname}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                      placeholder="Enter your first name"
                    />

                     <input
                      type="text"
                      value={editedProfile.lname}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                      placeholder="Enter your last name"
                    /></>
                  ) : (
                    <p className="text-slate-900 font-medium text-lg">{profile.fname} {profile.lname}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Email */}
            <div className="group">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center group-hover:bg-emerald-200 transition-colors">
                  <Mail className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={editedProfile.username}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                      placeholder="Enter your email"
                    />
                  ) : (
                    <p className="text-slate-900 font-medium">{profile.username}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Phone */}
            <div className="group">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-violet-100 rounded-full flex items-center justify-center group-hover:bg-violet-200 transition-colors">
                  <Phone className="w-5 h-5 text-violet-600" />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Phone Number</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={editedProfile.contactNumber}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                      placeholder="Enter your phone number"
                    />
                  ) : (
                    <p className="text-slate-900 font-medium">{profile.contactNumber}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="group">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-rose-100 rounded-full flex items-center justify-center group-hover:bg-rose-200 transition-colors">
                  <MapPin className="w-5 h-5 text-rose-600" />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Address</label>
                  {isEditing ? (
                    <textarea
                      value={editedProfile.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none resize-none"
                      rows="2"
                      placeholder="Enter your address"
                    />
                  ) : (
                    <p className="text-slate-900 font-medium">{profile.address}</p>
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
                  <span className="font-semibold">{saving ? 'Saving...' : 'Save Changes'}</span>
                </button>
                <button
                  onClick={handleCancel}
                  className="flex-1 flex items-center justify-center space-x-2 bg-slate-200 text-slate-700 py-4 px-6 rounded-xl hover:bg-slate-300 transition-all duration-200 font-semibold"
                >
                  <X className="w-5 h-5" />
                  <span>Cancel</span>
                </button>
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
  );
}