import React, { useEffect, useState, useRef } from "react"
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  useMap,
} from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { MapPin, Navigation, AlertCircle, Check } from "lucide-react"

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

function RecenterMap({ latLng }) {
  const map = useMap()
  React.useEffect(() => {
    if (latLng) {
      map.flyTo(latLng, 16, { duration: 1.5 })
    }
  }, [latLng, map])
  return null
}

// Enhanced Haversine formula for distance in meters
function getDistanceFromLatLonInMeters(loc1, loc2) {
  const R = 6371000 // Earth's radius in meters
  const dLat = deg2rad(loc2.lat - loc1.lat)
  const dLon = deg2rad(loc2.lng - loc1.lng)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(deg2rad(loc1.lat)) * Math.cos(deg2rad(loc2.lat)) * Math.sin(dLon / 2) ** 2
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function deg2rad(deg) {
  return (deg * Math.PI) / 180
}

function formatDistance(meters) {
  if (meters < 1000) {
    return `${Math.round(meters)} m`
  }
  return `${(meters / 1000).toFixed(1)} km`
}

export default function LiveRouteMap() {
  const [currentLoc, setCurrentLoc] = useState(null)
  const [destination, setDestination] = useState(null)
  const [routeCoords, setRouteCoords] = useState(null)
  const [routeDistance, setRouteDistance] = useState(null)
  const [isLoadingRoute, setIsLoadingRoute] = useState(false)
  const [locationError, setLocationError] = useState(null)
  const [lastLocationUpdate, setLastLocationUpdate] = useState(null)
  const [currentLocationName, setCurrentLocationName] = useState(null)
  const [destinationName, setDestinationName] = useState(null)
  const [isLoadingLocationName, setIsLoadingLocationName] = useState(false)
  const [isLoadingDestination, setIsLoadingDestination] = useState(false)
  const [destinationError, setDestinationError] = useState(null)
  const mapRef = useRef(null)
  const prevLocRef = useRef(null)

  const ORS_API_KEY = "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjZhYzc3NTgwMzE4YTQyMTViZDYxMmViZmNkMjIzYjAwIiwiaCI6Im11cm11cjY0In0="

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

  // Function to fetch destination from database
  const fetchDestinationFromDB = async () => {
    setIsLoadingDestination(true)
    try {
      // Replace this URL with your actual database endpoint
      // const response = await fetch('http://localhost:5000/api/destination')
      // if (!response.ok) throw new Error('Failed to fetch destination')
      
      const data = {
        latitude:27.6250270,
        longitude:85.5408145
      }
      
      // Assuming your DB returns { latitude, longitude, placeName } or similar
      const destinationData = {
        lat: data.latitude,
        lng: data.longitude
      }
      
      setDestination(destinationData)
      
      // If place name is not in DB, fetch it
      if (data.placeName) {
        setDestinationName(data.placeName)
      } else {
        const placeName = await getLocationName(data.latitude, data.longitude)
        setDestinationName(placeName)
      }
      
      setDestinationError(null)
    } catch (error) {
      console.error('Error fetching destination:', error)
      setDestinationError('Failed to load destination from database')
    } finally {
      setIsLoadingDestination(false)
    }
  }

  // Fetch destination on component mount
  useEffect(() => {
    fetchDestinationFromDB()
  }, [])

  // Watch current location with enhanced live tracking
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser")
      return
    }

    // Get initial position
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        setCurrentLoc(loc)
        prevLocRef.current = loc
        setLastLocationUpdate(new Date())
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

    // Watch position changes with very sensitive tracking
    const watchId = navigator.geolocation.watchPosition(
      async (pos) => {
        const newLoc = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        console.log(newLoc)
        // Always update if this is the first location
        if (!prevLocRef.current) {
          setCurrentLoc(newLoc)
          prevLocRef.current = newLoc
          return
        }

        // Check if user has moved (very sensitive - even 1 meter)
        const dist = getDistanceFromLatLonInMeters(prevLocRef.current, newLoc)
        if (dist >= 1) { // Update if moved more than 1 meter (very sensitive)
          setCurrentLoc(newLoc)
          prevLocRef.current = newLoc
          setLastLocationUpdate(new Date())
          console.log(`Location updated: moved ${dist.toFixed(1)}m`)
          
          // Update location name periodically (every 50 meters to avoid too many API calls)
          if (dist >= 50) {
            setIsLoadingLocationName(true)
            const locationName = await getLocationName(newLoc.lat, newLoc.lng)
            setCurrentLocationName(locationName)
            setIsLoadingLocationName(false)
          }
        }
      },
      (err) => {
        console.error("Error watching position", err)
        setLocationError("Location tracking error: " + err.message)
      },
      { 
        enableHighAccuracy: true, 
        maximumAge: 500, // Accept cached position if less than 0.5 seconds old
        timeout: 10000 // Wait up to 10 seconds for location
      }
    )

    return () => navigator.geolocation.clearWatch(watchId)
  }, [])

  // Fetch route when current location or destination changes
  useEffect(() => {
    if (!currentLoc || !destination) {
      setRouteCoords(null)
      setRouteDistance(null)
      return
    }

    // Calculate straight-line distance using Haversine formula
    const haversineDistance = getDistanceFromLatLonInMeters(currentLoc, destination)
    
    // For very short distances (less than 50m), just show straight line
    if (haversineDistance < 50) {
      setRouteCoords([[currentLoc.lat, currentLoc.lng], [destination.lat, destination.lng]])
      setRouteDistance(haversineDistance)
      return
    }

    setIsLoadingRoute(true)
    const body = {
      coordinates: [
        [currentLoc.lng, currentLoc.lat],
        [destination.lng, destination.lat],
      ],
    }

    fetch("https://api.openrouteservice.org/v2/directions/driving-car/geojson", {
      method: "POST",
      headers: {
        Authorization: ORS_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to get route")
        return res.json()
      })
      .then((data) => {
        const coords = data.features[0].geometry.coordinates.map(([lng, lat]) => [lat, lng])
        const distance = data.features[0].properties.segments[0].distance
        setRouteCoords(coords)
        setRouteDistance(distance)
        setIsLoadingRoute(false)
      })
      .catch((err) => {
        console.error(err)
        // Fallback to Haversine distance and straight line
        setRouteCoords([[currentLoc.lat, currentLoc.lng], [destination.lat, destination.lng]])
        setRouteDistance(haversineDistance)
        setIsLoadingRoute(false)
      })
  }, [currentLoc, destination])

  const getStatusMessage = () => {
    if (locationError) return "Location access denied"
    if (!currentLoc) return "Getting your location..."
    if (isLoadingDestination) return "Loading destination from database..."
    if (destinationError) return "Failed to load destination"
    if (!destination) return "No destination found in database"
    if (isLoadingRoute) return "Calculating route..."
    if (destination && routeCoords) {
      const distance = getDistanceFromLatLonInMeters(currentLoc, destination)
      if (distance < 10) return "You've arrived at your destination!"
      if (distance < 50) return "Very close to destination"
      return "Navigation active - Live tracking"
    }
    return "Ready"
  }

  const currentDistance = currentLoc && destination ? 
    getDistanceFromLatLonInMeters(currentLoc, destination) : null

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
              <h1 className="text-2xl font-bold text-gray-900">Live Navigation</h1>
              <p className="text-sm text-gray-600">{getStatusMessage()}</p>
            </div>
          </div>
          
          {/* Status indicator */}
          <div className="flex items-center space-x-4">
            {lastLocationUpdate && (
              <div className="text-xs text-gray-500">
                Last updated: {lastLocationUpdate.toLocaleTimeString()}
              </div>
            )}
            {currentLoc && !locationError && (
              <div className="flex items-center space-x-2 px-3 py-1 bg-green-100 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-green-700">Live Tracking</span>
              </div>
            )}
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
              {isLoadingDestination ? (
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-500 italic">Loading from database...</p>
                </div>
              ) : destinationError ? (
                <div className="bg-red-50 rounded-lg p-3">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 text-red-600" />
                    <p className="text-sm text-red-700">{destinationError}</p>
                  </div>
                </div>
              ) : destination ? (
                <div className="bg-green-50 rounded-lg p-3">
                  <p className="text-sm font-medium text-green-800">
                    {destinationName || "Unknown location"}
                  </p>
                  <p className="text-xs font-mono text-green-600 mt-1">
                    {destination.lat.toFixed(6)}, {destination.lng.toFixed(6)}
                  </p>
                  <div className="flex items-center space-x-1 mt-2">
                    <Check className="w-4 h-4 text-green-600" />
                    <span className="text-xs text-green-600 font-medium">From Database</span>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-500 italic">No destination found</p>
                </div>
              )}
            </div>

            {/* Distance & Route Info */}
            {currentLoc && destination && (
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Distance & Route</h3>
                <div className="space-y-3">
                  
                  {/* Route distance */}
                  {isLoadingRoute ? (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-sm text-gray-600">Calculating route...</p>
                    </div>
                  ) : routeDistance && routeDistance !== currentDistance ? (
                    <div className="bg-green-50 rounded-lg p-3">
                      <p className="text-xs text-green-600 font-medium">Route distance</p>
                      <p className="text-lg font-bold text-green-800">
                        {formatDistance(routeDistance)}
                      </p>
                    </div>
                  ) : null}
                  
                  {/* Arrival status */}
                  {currentDistance < 10 && (
                    <div className="bg-yellow-50 rounded-lg p-3 text-center">
                      <p className="text-sm text-yellow-700 font-bold">🎉 You've arrived!</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Live Tracking Info */}
            {currentLoc && destination && (
              <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Live Tracking Active</h4>
                <div className="text-xs text-gray-600 space-y-1">
                  <p>• Updates every 1 meter movement</p>
                  <p>• Route recalculates automatically</p>
                  <p>• Works for very short distances</p>
                  {currentDistance < 50 && (
                    <p className="text-blue-600 font-medium">• Using direct path (very close)</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Map */}
        <div className="flex-1 rounded-xl shadow-lg overflow-hidden">
          <MapContainer
            center={currentLoc || destination || [27.7, 85.3]}
            zoom={16}
            style={{ height: "100%", width: "100%" }}
            whenCreated={(mapInstance) => (mapRef.current = mapInstance)}
          >
            <TileLayer 
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <RecenterMap latLng={currentLoc} />

            {currentLoc && <Marker position={currentLoc} icon={markerIcon} />}
            {destination && (
              <Marker position={destination} icon={destinationIcon} />
            )}

            {routeCoords && (
              <Polyline 
                positions={routeCoords} 
                color={currentDistance < 50 ? "#10B981" : "#3B82F6"}
                weight={currentDistance < 50 ? 4 : 6}
                opacity={0.8}
                dashArray={currentDistance < 50 ? "10, 10" : null}
              />
            )}
          </MapContainer>
        </div>
      </div>
    </div>
  )
}