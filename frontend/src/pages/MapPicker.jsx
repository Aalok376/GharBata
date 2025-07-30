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
import { MapPin, Navigation } from "lucide-react"
import { useParams } from "react-router-dom"

const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
})

const destinationIcon = markerIcon

function RecenterMap({ latLng }) {
  const map = useMap()
  useEffect(() => {
    if (latLng) {
      map.flyTo(latLng, 16, { duration: 1.5 })
    }
  }, [latLng, map])
  return null
}

function getDistanceFromLatLonInMeters(loc1, loc2) {
  const R = 6371000
  const dLat = deg2rad(loc2.lat - loc1.lat)
  const dLon = deg2rad(loc2.lng - loc1.lng)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(deg2rad(loc1.lat)) *
      Math.cos(deg2rad(loc2.lat)) *
      Math.sin(dLon / 2) ** 2
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function deg2rad(deg) {
  return (deg * Math.PI) / 180
}

function formatDistance(meters) {
  if (meters < 1000) return `${Math.round(meters)} m`
  return `${(meters / 1000).toFixed(1)} km`
}

export default function MapPickerModal() {
  const { lat, lon } = useParams()
  const [currentLoc, setCurrentLoc] = useState(null)
  const [destination, setDestination] = useState(null)
  const [destinationName, setDestinationName] = useState(null)
  const [routeCoords, setRouteCoords] = useState(null)
  const [routeDistance, setRouteDistance] = useState(null)
  const [locationError, setLocationError] = useState(null)
  const mapRef = useRef(null)
  const prevLocRef = useRef(null)

  const ORS_API_KEY = "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjZhYzc3NTgwMzE4YTQyMTViZDYxMmViZmNkMjIzYjAwIiwiaCI6Im11cm11cjY0In0="

  const getLocationName = async (lat, lng) => {
    try {
      const res = await fetch(`http://localhost:5000/reverse-geocode?lat=${lat}&lon=${lng}`)
      const data = await res.json()
      return data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`
    } catch (e) {
      return `${lat.toFixed(6)}, ${lng.toFixed(6)}`
    }
  }

  // Set destination from params
  useEffect(() => {
    if (lat && lon) {
      const dest = { lat: parseFloat(lat), lng: parseFloat(lon) }
      setDestination(dest)
      getLocationName(dest.lat, dest.lng).then(setDestinationName)
    }
  }, [lat, lon])

  // Track current location
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation not supported")
      return
    }

    const onSuccess = async (pos) => {
      const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude }

      if (!prevLocRef.current || getDistanceFromLatLonInMeters(prevLocRef.current, loc) >= 1) {
        setCurrentLoc(loc)
        prevLocRef.current = loc
      }
    }

    const onError = (err) => {
      setLocationError("Location error: " + err.message)
    }

    navigator.geolocation.getCurrentPosition(onSuccess, onError, {
      enableHighAccuracy: true,
    })

    const watchId = navigator.geolocation.watchPosition(onSuccess, onError, {
      enableHighAccuracy: true,
      maximumAge: 500,
      timeout: 10000,
    })

    return () => navigator.geolocation.clearWatch(watchId)
  }, [])

  // Fetch route
  useEffect(() => {
    if (!currentLoc || !destination) return

    const straightDist = getDistanceFromLatLonInMeters(currentLoc, destination)

    if (straightDist < 50) {
      setRouteCoords([
        [currentLoc.lat, currentLoc.lng],
        [destination.lat, destination.lng],
      ])
      setRouteDistance(straightDist)
      return
    }

    fetch("https://api.openrouteservice.org/v2/directions/driving-car/geojson", {
      method: "POST",
      headers: {
        Authorization: ORS_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        coordinates: [
          [currentLoc.lng, currentLoc.lat],
          [destination.lng, destination.lat],
        ],
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        const coords = data.features[0].geometry.coordinates.map(([lng, lat]) => [lat, lng])
        const distance = data.features[0].properties.segments[0].distance
        setRouteCoords(coords)
        setRouteDistance(distance)
      })
      .catch(() => {
        setRouteCoords([
          [currentLoc.lat, currentLoc.lng],
          [destination.lat, destination.lng],
        ])
        setRouteDistance(straightDist)
      })
  }, [currentLoc, destination])

  return (
    <div className="flex flex-col h-screen">
      <div className="bg-white border-b px-6 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Navigation className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Live Navigation</h1>
            <p className="text-sm text-gray-600">
              {locationError
                ? locationError
                : currentLoc && destination
                ? routeDistance
                  ? `Distance: ${formatDistance(routeDistance)}`
                  : "Calculating route..."
                : "Getting location..."}
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1">
        <MapContainer
          center={currentLoc || destination || [27.7, 85.3]}
          zoom={16}
          style={{ height: "100%", width: "100%" }}
          whenCreated={(mapInstance) => (mapRef.current = mapInstance)}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />
          <RecenterMap latLng={currentLoc} />
          {currentLoc && <Marker position={currentLoc} icon={markerIcon} />}
          {destination && <Marker position={destination} icon={destinationIcon} />}
          {routeCoords && (
            <Polyline
              positions={routeCoords}
              color="#3B82F6"
              weight={5}
              opacity={0.8}
            />
          )}
        </MapContainer>
      </div>
    </div>
  )
}
