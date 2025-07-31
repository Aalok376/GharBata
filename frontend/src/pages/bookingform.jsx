import React, { useState, useEffect } from 'react'
import { Calendar, Clock, MapPin, User, Phone, Mail, CreditCard, Home } from 'lucide-react'
import { SelectLocationOverlay } from '../components/selectLocation'
import { useNavigate, useParams } from 'react-router-dom'

export default function BookingForm() {

    const navigate = useNavigate()
    const { service, technicianId, finalPrice } = useParams()
    const [formData, setFormData] = useState({
        fname: '',
        lname: '',
        email: '',
        phone: '',
        address: '',
        apartment: '',
        city: '',
        date: '',
        specialInstructions: '',
        contactPreference: 'phone',
        emergencyContact: '',
        emergencyPhone: '',
        latitude: '',
        longitude: '',
        service: service,
        technician_id: technicianId,
        final_price: finalPrice
    })

    const [showMapOverlay, setShowMapOverlay] = useState(false)
    const [startTime, setStartTime] = useState('')
    const [endTime, setEndTime] = useState('')
    const [currentStep, setCurrentStep] = useState(1)
    const [agreed, setAgreed] = useState(false)
    const [errors, setErrors] = useState({})
    const totalSteps = 4

    const handleInputChange = (e) => {
        const { name, value } = e.target
        if (name === 'startTime') {
            setStartTime(value)
        } else if (name === 'endTime') {
            setEndTime(value)
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }))
        }
    }

    const validateStep = (step) => {
        const newErrors = {}

        if (step === 1) {
            if (!formData.fname.trim()) newErrors.fname = 'First name is required'
            else if (!/^[A-Za-z]+$/.test(formData.fname)) newErrors.fname = 'First name should contain alphabets only'

            if (!formData.lname.trim()) newErrors.lname = 'Last name is required'
            else if (!/^[A-Za-z]+$/.test(formData.lname)) newErrors.lname = 'Last name should contain alphabets only'

            if (!formData.email.trim()) newErrors.email = 'Email is required'
            else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid'

            if (!formData.phone.trim()) newErrors.phone = 'Phone number is required'
            else if (!/^\d{10}$/.test(formData.phone.trim())) newErrors.phone = 'Phone number must be of 10 digits'

        }

        if (step === 2) {
            if (!formData.address.trim()) newErrors.address = 'Street address is required'
            if (!formData.city.trim()) newErrors.city = 'City is required'
        }

        if (step === 3) {
            if (!formData.date) newErrors.date = 'Date is required'
            if (!startTime) newErrors.startTime = 'Start time is required'
            if (!endTime) newErrors.endTime = 'End time is required'
            if (startTime && endTime && startTime >= endTime) {
                newErrors.endTime = 'End time must be after start time'
            }
        }
        if (step === 4) {
            if (!agreed) newErrors.checkbox = 'Please accept terms and conditions'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const nextStep = () => {
        if (validateStep(currentStep) && currentStep < totalSteps) {
            setCurrentStep(currentStep + 1)
        }
    }

    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1)
            setErrors({}) // Clear errors when going back
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (validateStep(4)) {

            if (!formData.latitude || !formData.longitude) {
                const location = formData.address;

                console.log(location)

                try {
                    const geoResponse = await fetch(`http://localhost:5000/geocode?q=${encodeURIComponent(location)}`, {
                        method: 'GET',
                        credentials: 'include',
                    })
                    const geoData = await geoResponse.json()
                    console.log(geoData)

                    if (geoData.error) {
                        console.error(geoData.error);
                        alert('Error getting location coordinates: ' + geoData.error)
                        return
                    } else {
                       formData.latitude=geoData.lat
                       formData.longitude=geoData.lon
                    }
                } catch (error) {
                    console.error('Geocoding error:', error)
                    alert('Error getting location coordinates')
                    return
                }
            }

            console.log('Booking submitted:', formData)
            try {
                const response = await fetch('http://localhost:5000/api/bookings/create', {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        technician_id: formData.technician_id,
                        fname: formData.fname,
                        lname: formData.lname,
                        email: formData.email,
                        phoneNumber: formData.phone,
                        streetAddress: formData.address,
                        apartMent: formData.apartment,
                        cityAddress: formData.city,
                        service: formData.service,
                        emergencyContactName: formData.emergencyContact,
                        emergencyContactPhone: formData.emergencyPhone,
                        scheduled_date: formData.date,
                        scheduled_StartTime: startTime,
                        scheduled_EndTime: endTime,
                        specialInstructions: formData.specialInstructions,
                        contactPreference: formData.contactPreference,
                        latitude: formData.latitude || '0',
                        longitude: formData.longitude || '0',
                        final_price: formData.final_price || '0'
                    })
                })

                const data = await response.json()

                if (response.ok) {
                    console.log('Booking created successfully:', data.booking)
                    setTimeout(() => {
                        navigate('/client/dashboard', { replace: true })
                    }, 5000)
                    // You can redirect or reset form here
                } else {
                    console.error('Error creating booking:', data.error)
                    alert('Error creating booking: ' + data.error)
                }
            } catch (error) {
                console.error('Network error:', error)
                alert('Network error occurred while creating booking')
            }
        }
    }

    const renderProgressBar = () => (
        <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
                {[1, 2, 3, 4].map((step) => (
                    <div
                        key={step}
                        className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold ${step <= currentStep
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-600'
                            }`}
                    >
                        {step}
                    </div>
                ))}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                ></div>
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-600">
                <span>Personal Info</span>
                <span>Address</span>
                <span>Schedule</span>
                <span>Review</span>
            </div>
        </div>
    )

    const renderStep1 = () => (
        <div className="space-y-6">
            <div className="flex items-center mb-6">
                <User className="w-6 h-6 text-blue-600 mr-3" />
                <h2 className="text-2xl font-bold text-gray-800">Personal Information</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        First Name *
                    </label>
                    <input
                        type="text"
                        name="fname"
                        value={formData.fname}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.fname ? 'border-red-500' : 'border-gray-300'
                            }`}
                        required
                    />
                    {errors.fname && <p className="text-red-500 text-xs mt-1">{errors.fname}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name *
                    </label>
                    <input
                        type="text"
                        name="lname"
                        value={formData.lname}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.lname ? 'border-red-500' : 'border-gray-300'
                            }`}
                        required
                    />
                    {errors.lname && <p className="text-red-500 text-xs mt-1">{errors.lname}</p>}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Mail className="w-4 h-4 inline mr-1" />
                        Email Address *
                    </label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.email ? 'border-red-500' : 'border-gray-300'
                            }`}
                        required
                    />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Phone className="w-4 h-4 inline mr-1" />
                        Phone Number *
                    </label>
                    <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="(555) 123-4567"
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.phone ? 'border-red-500' : 'border-gray-300'
                            }`}
                        required
                    />
                    {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preferred Contact Method
                </label>
                <div className="flex space-x-4">
                    <label className="flex items-center">
                        <input
                            type="radio"
                            name="contactPreference"
                            value="phone"
                            checked={formData.contactPreference === 'phone'}
                            onChange={handleInputChange}
                            className="mr-2"
                        />
                        Phone
                    </label>
                    <label className="flex items-center">
                        <input
                            type="radio"
                            name="contactPreference"
                            value="email"
                            checked={formData.contactPreference === 'email'}
                            onChange={handleInputChange}
                            className="mr-2"
                        />
                        Email
                    </label>
                    <label className="flex items-center">
                        <input
                            type="radio"
                            name="contactPreference"
                            value="text"
                            checked={formData.contactPreference === 'text'}
                            onChange={handleInputChange}
                            className="mr-2"
                        />
                        Text Message
                    </label>
                </div>
            </div>
        </div>
    )

    const renderStep2 = () => (
        <>
            <div className="space-y-6">
                <div className="flex items-center mb-6">
                    <MapPin className="w-6 h-6 text-blue-600 mr-3" />
                    <h2 className="text-2xl font-bold text-gray-800">Service Address</h2>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Street Address *
                    </label>
                    <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        placeholder="123 Main Street"
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.address ? 'border-red-500' : 'border-gray-300'
                            }`}
                        required
                    />
                    {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Apartment/Unit (Optional)
                    </label>
                    <input
                        type="text"
                        name="apartment"
                        value={formData.apartment}
                        onChange={handleInputChange}
                        placeholder="Apt 4B, Unit 205, etc."
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>


                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        City *
                    </label>
                    <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.city ? 'border-red-500' : 'border-gray-300'
                            }`}
                        required
                    />
                    {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                </div>

                <button
                    type="button"
                    onClick={() => {
                        setFormData(prev => ({ ...prev, address: prev.address || " ", city: prev.city || ' ' }))
                        setShowMapOverlay(true)
                    }}
                    className="px-4 py-3 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-lg text-sm font-medium"
                >
                    Select from Map
                </button>

                <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-blue-900 mb-2">Emergency Contact (Optional)</h3>
                    <p className="text-sm text-blue-700 mb-3">
                        In case we need to reach someone if you're not available during the service.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                            type="text"
                            name="emergencyContact"
                            value={formData.emergencyContact}
                            onChange={handleInputChange}
                            placeholder="Emergency contact name"
                            className="px-3 py-2 border border-blue-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <input
                            type="tel"
                            name="emergencyPhone"
                            value={formData.emergencyPhone}
                            onChange={handleInputChange}
                            placeholder="Emergency contact phone"
                            className="px-3 py-2 border border-blue-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                </div>
            </div>

            {showMapOverlay && (
                <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="relative w-[100vw] h-[100vh] bg-white rounded shadow-xl">

                        <SelectLocationOverlay
                            onClose={() => setShowMapOverlay(false)}
                            onLocationConfirm={({ lat, lon, name, cityName }) => {
                                setFormData(prev => ({ ...prev, address: name, latitude: lat, longitude: lon, city: cityName }))
                            }}
                        />
                    </div>
                </div>
            )}
        </>
    )

    const renderStep3 = () => (
        <div className="space-y-6">
            <div className="flex items-center mb-6">
                <Calendar className="w-6 h-6 text-blue-600 mr-3" />
                <h2 className="text-2xl font-bold text-gray-800">Schedule Service</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Preferred Date *
                    </label>
                    <input
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={handleInputChange}
                        min={new Date().toISOString().split('T')[0]}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.date ? 'border-red-500' : 'border-gray-300'
                            }`}
                        required
                    />
                    {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Clock className="w-4 h-4 inline mr-1" />
                        Time Slot *
                    </label>
                    <div className="flex gap-2">
                        <input
                            type="time"
                            name="startTime"
                            value={startTime}
                            onChange={handleInputChange}
                            className={`flex-1 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.startTime ? 'border-red-500' : 'border-gray-300'
                                }`}
                            required
                        />
                        <input
                            type="time"
                            name="endTime"
                            value={endTime}
                            onChange={handleInputChange}
                            className={`flex-1 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.endTime ? 'border-red-500' : 'border-gray-300'
                                }`}
                            required
                        />
                    </div>
                    {(errors.startTime || errors.endTime) && (
                        <p className="text-red-500 text-xs mt-1">
                            {errors.startTime || errors.endTime}
                        </p>
                    )}
                </div>

            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Special Instructions (Optional)
                </label>
                <textarea
                    name="specialInstructions"
                    value={formData.specialInstructions}
                    onChange={handleInputChange}
                    rows="4"
                    placeholder="Any specific instructions for our service provider? (e.g., parking instructions, gate codes, pet information, etc.)"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                ></textarea>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="font-semibold text-yellow-800 mb-2">Important Notes:</h3>
                <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• Please ensure someone 18+ is present during the service</li>
                    <li>• Our service provider will call 15-30 minutes before arrival</li>
                    <li>• Cancellations must be made at least 24 hours in advance</li>
                </ul>
            </div>
        </div>
    )

    const renderStep4 = () => (
        <div className="space-y-6">
            <div className="flex items-center mb-6">
                <CreditCard className="w-6 h-6 text-blue-600 mr-3" />
                <h2 className="text-2xl font-bold text-gray-800">Review & Confirm</h2>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h3 className="font-semibold text-gray-800 mb-3">Contact Information</h3>
                        <div className="space-y-2 text-sm">
                            <p><span className="font-medium">Name:</span> {formData.fname} {formData.lname}</p>
                            <p><span className="font-medium">Email:</span> {formData.email}</p>
                            <p><span className="font-medium">Phone:</span> {formData.phone}</p>
                            <p><span className="font-medium">Contact via:</span> {formData.contactPreference}</p>
                        </div>
                    </div>

                    <div>
                        <h3 className="font-semibold text-gray-800 mb-3">Service Address</h3>
                        <div className="space-y-2 text-sm">
                            <p>{formData.address}</p>
                            {formData.apartment && <p>{formData.apartment}</p>}
                            <p>{formData.city}</p>
                        </div>
                    </div>
                </div>

                <div>
                    <h3 className="font-semibold text-gray-800 mb-3">Service Schedule</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <p><span className="font-medium">Date:</span> {formData.date}</p>
                        <p><span className="font-medium">Time:</span> {startTime}-{endTime}</p>
                    </div>
                    {formData.specialInstructions && (
                        <div className="mt-3">
                            <p className="font-medium text-sm">Special Instructions:</p>
                            <p className="text-sm text-gray-600 mt-1">{formData.specialInstructions}</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center mb-2">
                    <input
                        type="checkbox"
                        id="terms"
                        className="mr-3 h-4 w-4 text-blue-600"
                        checked={agreed}
                        onChange={(e) => setAgreed(e.target.checked)}
                    />
                    <label htmlFor="terms" className="text-sm font-medium text-blue-900">
                        I agree to the Terms of Service and Privacy Policy *
                    </label>
                </div>
                {errors.checkbox && <p className="text-red-500 text-xs mt-1">{errors.checkbox}</p>}
            </div>
        </div>


    )
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-white mb-2">Book Your Service</h1>
                                <p className="text-blue-100">Schedule your in-home service in just a few steps</p>
                            </div>
                            <Home className="w-12 h-12 text-white opacity-80" />
                        </div>
                    </div>

                    <div className="px-8 py-8">
                        {renderProgressBar()}

                        <div>
                            {currentStep === 1 && renderStep1()}
                            {currentStep === 2 && renderStep2()}
                            {currentStep === 3 && renderStep3()}
                            {currentStep === 4 && renderStep4()}

                            <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
                                <button
                                    type="button"
                                    onClick={prevStep}
                                    disabled={currentStep === 1}
                                    className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${currentStep === 1
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                        }`}
                                >
                                    Previous
                                </button>

                                <div className="text-sm text-gray-500">
                                    Step {currentStep} of {totalSteps}
                                </div>

                                {currentStep < totalSteps ? (
                                    <button
                                        type="button"
                                        onClick={nextStep}
                                        className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all duration-200 transform hover:scale-105"
                                    >
                                        Next Step
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={handleSubmit}
                                        className="px-8 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-all duration-200 transform hover:scale-105"
                                    >
                                        Confirm Booking
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}