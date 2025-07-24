import React, { useEffect, useState } from "react"
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
} from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { MapPin, Navigation, Check } from "lucide-react"

const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
})

const destinationIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
})

function DestinationSelector({ onSelect }) {
  useMapEvents({
    click(e) {
      onSelect(e.latlng)
    },
  })
  return null
}

// Component to update map center when current location is found
function MapUpdater({ currentLoc }) {
  const map = useMap()
  
  useEffect(() => {
    if (currentLoc) {
      map.setView([currentLoc.lat, currentLoc.lng], 14)
    }
  }, [currentLoc, map])
  
  return null
}

function formatDistance(meters) {
  if (meters < 1000) {
    return `${Math.round(meters)} m`
  }  
  return `${(meters / 1000).toFixed(1)} km`
}

function formatDuration(seconds) {
  if (seconds < 60) {
    return `${Math.round(seconds)}s`
  } else if (seconds < 3600) {
    return `${Math.round(seconds / 60)}m`
  } else {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.round((seconds % 3600) / 60)
    return `${hours}h ${minutes}m`
  }
}

export default function SelectLocationPage() {
  const [currentLoc, setCurrentLoc] = useState(null)
  const [tempDestination, setTempDestination] = useState(null)
  const [confirmedDestination, setConfirmedDestination] = useState(null)
  const [locationError, setLocationError] = useState(null)
  const [currentLocationName, setCurrentLocationName] = useState(null)
  const [tempDestinationName, setTempDestinationName] = useState(null)
  const [isLoadingLocationName, setIsLoadingLocationName] = useState(false)
  const [isLoadingDestinationName, setIsLoadingDestinationName] = useState(false)
  const [routeInfo, setRouteInfo] = useState(null)
  const [isLoadingRoute, setIsLoadingRoute] = useState(false)

  // Function to get route information from API
  // Function to get route information using OpenRouteService API
const getRouteInfo = async (startLat, startLng, endLat, endLng) => {
  try {
    const ORS_API_KEY = 'eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjZhYzc3NTgwMzE4YTQyMTViZDYxMmViZmNkMjIzYjAwIiwiaCI6Im11cm11cjY0In0='
    const response = await fetch("https://api.openrouteservice.org/v2/directions/driving-car/geojson", {
      method: "POST",
      headers: {
        Authorization: ORS_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        coordinates: [
          [startLng, startLat],
          [endLng, endLat],
        ],
      }),
    })

    const data = await response.json()

    if (data && data.features && data.features[0]) {
      const segment = data.features[0].properties.segments[0]
      return {
        distance: segment.distance, // meters
        duration: segment.duration  // seconds
      }
    }

    return null
  } catch (error) {
    console.error("Error fetching route info:", error)
    return null
  }
}

  // Function to get place name from coordinates
  const getLocationName = async (lat, lng) => {
    try {
      const url = `http://localhost:5000/reverse-geocode?lat=${lat}&lon=${lng}`
      const response = await fetch(url)
      const data = await response.json()
      return data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`
    } catch (error) {
      console.error('Error fetching location name:', error)
      return `${lat.toFixed(6)}, ${lng.toFixed(6)}`
    }
  }

  // Get current location once (no live tracking)
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser")
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        setCurrentLoc(loc)
        setLocationError(null)
        
        // Get location name
        setIsLoadingLocationName(true)
        const locationName = await getLocationName(loc.lat, loc.lng)
        setCurrentLocationName(locationName)
        setIsLoadingLocationName(false)
      },
      (err) => {
        setLocationError("Error getting location: " + err.message)
      },
      { enableHighAccuracy: true }
    )
  }, [])

  // Handle destination selection and get place name + route info
  useEffect(() => {
    if (tempDestination) {
      const getDestinationInfo = async () => {
        setIsLoadingDestinationName(true)
        setIsLoadingRoute(true)
        
        // Get destination place name
        const destinationName = await getLocationName(tempDestination.lat, tempDestination.lng)
        setTempDestinationName(destinationName)
        setIsLoadingDestinationName(false)
        
        // Get route information if current location is available
        if (currentLoc) {
          const routeData = await getRouteInfo(
            currentLoc.lat, 
            currentLoc.lng, 
            tempDestination.lat, 
            tempDestination.lng
          )
          setRouteInfo(routeData)
        }
        setIsLoadingRoute(false)
      }
      
      getDestinationInfo()
    } else {
      setTempDestinationName(null)
      setRouteInfo(null)
    }
  }, [tempDestination, currentLoc])

  const handleConfirmDestination = () => {
    if (tempDestination) {
      setConfirmedDestination(tempDestination)
      
      // Show simple alert
      alert("Destination confirmed!")
      
      console.log('Destination confirmed:', {
        latitude: tempDestination.lat,
        longitude: tempDestination.lng,
        placeName: tempDestinationName
      })
    }
  }

  const getStatusMessage = () => {
    if (locationError) return "Location access denied"
    if (!currentLoc) return "Getting your location..."
    if (!tempDestination && !confirmedDestination) return "Tap on map to set destination"
    if (tempDestination && !confirmedDestination) return "Review destination and confirm"
    if (confirmedDestination) return "Destination confirmed"
    return "Ready"
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Navigation className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Destination Selector</h1>
              <p className="text-sm text-gray-600">{getStatusMessage()}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-1 gap-6 p-6">
        {/* Control Panel */}
        <div className="w-80 bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6">
            {/* Current Location */}
            <div className="mb-6">
              <div className="flex items-center space-x-2 mb-3">
                <MapPin className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-gray-900">Current Location</h3>
              </div>
              {currentLoc ? (
                <div className="bg-blue-50 rounded-lg p-3">
                  {isLoadingLocationName ? (
                    <p className="text-sm text-blue-600">Loading location name...</p>
                  ) : (
                    <p className="text-sm font-medium text-blue-800">
                      {currentLocationName || "Unknown location"}
                    </p>
                  )}
                  <p className="text-xs font-mono text-blue-600 mt-1">
                    {currentLoc.lat.toFixed(6)}, {currentLoc.lng.toFixed(6)}
                  </p>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-500 italic">
                    {locationError || "Locating..."}
                  </p>
                </div>
              )}
            </div>

            {/* Destination */}
            <div className="mb-6">
              <div className="flex items-center space-x-2 mb-3">
                <MapPin className="w-5 h-5 text-red-600" />
                <h3 className="font-semibold text-gray-900">Destination</h3>
              </div>
              {tempDestination || confirmedDestination ? (
                <div className={`rounded-lg p-3 ${
                  confirmedDestination ? 'bg-green-50' : 'bg-yellow-50'
                }`}>
                  {isLoadingDestinationName ? (
                    <p className="text-sm text-gray-600">Loading location name...</p>
                  ) : (
                    <p className="text-sm font-medium">
                      {tempDestinationName || "Unknown location"}
                    </p>
                  )}
                  <p className="text-xs font-mono mt-1 text-gray-600">
                    {(confirmedDestination || tempDestination).lat.toFixed(6)}, {(confirmedDestination || tempDestination).lng.toFixed(6)}
                  </p>
                  {confirmedDestination && (
                    <div className="flex items-center space-x-1 mt-2">
                      <Check className="w-4 h-4 text-green-600" />
                      <span className="text-xs text-green-600 font-medium">Confirmed</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-3 border-2 border-dashed border-gray-300">
                  <p className="text-sm text-gray-500 italic">Click on map to select</p>
                </div>
              )}
            </div>

            {/* Route Info - Only show for temp destination */}
            {tempDestination && currentLoc && !confirmedDestination && (
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Route Information</h3>
                <div className="bg-gray-50 rounded-lg p-3">
                  {isLoadingRoute ? (
                    <p className="text-sm text-gray-600">Calculating route...</p>
                  ) : routeInfo ? (
                    <>
                      <div className="mb-2">
                        <p className="text-lg font-bold text-gray-900">{formatDistance(routeInfo.distance)}</p>
                        <p className="text-sm text-gray-600">Route distance</p>
                      </div>
                      <div className="mb-2">
                        <p className="text-lg font-bold text-blue-600">{formatDuration(routeInfo.duration)}</p>
                        <p className="text-sm text-gray-600">Estimated time</p>
                      </div>
                      <p className="text-xs text-blue-600 mt-1">🛣️ Calculated using routing API</p>
                    </>
                  ) : (
                    <p className="text-sm text-red-600">Route calculation failed</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="px-6 pb-6 space-y-3">
            {tempDestination && !confirmedDestination && (
              <button
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                onClick={handleConfirmDestination}
              >
                <Check className="w-5 h-5" />
                <span>Confirm Destination</span>
              </button>
            )}
          </div>
        </div>

        {/* Map */}
        <div className="flex-1 rounded-xl shadow-lg overflow-hidden">
          <MapContainer
            center={[27.7, 85.3]}
            zoom={14}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer 
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            
            <MapUpdater currentLoc={currentLoc} />
            
            {!confirmedDestination && (
              <DestinationSelector onSelect={setTempDestination} />
            )}

            {currentLoc && <Marker position={currentLoc} icon={markerIcon} />}
            
            {tempDestination && !confirmedDestination && (
              <Marker position={tempDestination} icon={destinationIcon} opacity={0.7} />
            )}
            
            {confirmedDestination && (
              <Marker position={confirmedDestination} icon={destinationIcon} />
            )}
          </MapContainer>
        </div>
      </div>
    </div>
  )
}