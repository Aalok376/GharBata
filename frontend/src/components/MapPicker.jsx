import React, { useState, useEffect, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const LocationSelector = ({ onSelect }) => {
  useMapEvents({
    click(e) {
      onSelect(e.latlng);
    },
  });
  return null;
};

export default function MapWithDirections() {
  const [startLocation, setStartLocation] = useState(null);
  const [destinationInput, setDestinationInput] = useState("");
  const [destinationCoords, setDestinationCoords] = useState(null);
  const [route, setRoute] = useState(null);

  const mapRef = useRef(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported");
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        console.log("Current location:", coords);
        setStartLocation(coords);

        if (mapRef.current) {
          mapRef.current.setView(coords, 13);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        alert("Unable to retrieve your location.");
      },
      { enableHighAccuracy: true }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  const getRoute = async (start, dest) => {
    try {
      let destCoords = dest;

      if (typeof dest === "string") {
        const geocodeRes = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(dest)}`
        );
        const geocodeData = await geocodeRes.json();

        if (geocodeData.length === 0) {
          alert("Address not found");
          return;
        }

        destCoords = {
          lat: parseFloat(geocodeData[0].lat),
          lng: parseFloat(geocodeData[0].lon),
        };
        setDestinationCoords(destCoords);
      }

      const apiKey = "YOUR_API_KEY_HERE"; // Replace with your OpenRouteService API key
      const response = await fetch("https://api.openrouteservice.org/v2/directions/driving-car", {
        method: "POST",
        headers: {
          "Authorization": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          coordinates: [
            [start.lng, start.lat],
            [destCoords.lng, destCoords.lat],
          ],
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Directions API error:", errorText);
        alert("Failed to fetch directions");
        return;
      }

      const data = await response.json();
      const coords = data.features[0].geometry.coordinates.map(([lng, lat]) => [lat, lng]);
      setRoute(coords);
    } catch (error) {
      console.error("Error getting directions:", error);
      alert("Error getting directions");
    }
  };

  const handleMapSelect = (latlng) => {
    setDestinationCoords(latlng);
    setDestinationInput("");
    setRoute(null);
  };

  const handleMapConfirm = () => {
    if (!startLocation || !destinationCoords) {
      alert("Set both current and destination locations");
      return;
    }
    getRoute(startLocation, destinationCoords);
  };

  const handleAddressSubmit = (e) => {
    e.preventDefault();
    if (!startLocation || !destinationInput.trim()) {
      alert("Provide valid start and destination");
      return;
    }
    getRoute(startLocation, destinationInput);
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 h-screen p-4">
      <div className="md:w-1/3 space-y-4">
        <h2 className="text-xl font-bold">Destination</h2>

        <form onSubmit={handleAddressSubmit} className="space-y-2">
          <input
            type="text"
            value={destinationInput}
            onChange={(e) => setDestinationInput(e.target.value)}
            placeholder="E.g., Inaruwa, Nepal"
            className="w-full border px-3 py-2 rounded"
          />
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">
            Get Route
          </button>
        </form>

        <hr />

        <div>
          <p className="mb-2 font-medium">Or pick on map:</p>
          <button
            onClick={handleMapConfirm}
            className="px-4 py-2 bg-green-600 text-white rounded"
          >
            Confirm Map Location
          </button>
        </div>
      </div>

      <div className="md:flex-1 h-full rounded overflow-hidden border">
        <MapContainer
          center={[27.7, 85.3]}
          zoom={13}
          scrollWheelZoom={true}
          style={{ height: "100%", width: "100%" }}
          whenCreated={(mapInstance) => (mapRef.current = mapInstance)}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {startLocation && <Marker position={startLocation} icon={markerIcon} />}
          {destinationCoords && <Marker position={destinationCoords} icon={markerIcon} />}
          <LocationSelector onSelect={handleMapSelect} />
          {route && <Polyline positions={route} color="blue" weight={5} />}
        </MapContainer>
      </div>
    </div>
  );
}
