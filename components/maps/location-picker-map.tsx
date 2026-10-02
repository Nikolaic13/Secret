"use client"

import React, { useEffect, useRef, useState } from "react"
import { MapPin, Navigation, Crosshair, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface LocationPickerMapProps {
  initialLat?: number
  initialLng?: number
  address?: string
  onChange: (coords: { lat: number; lng: number; address?: string }) => void
}

// Default center: Janiuay Municipal Hall, Iloilo, Philippines
const DEFAULT_JANIUAY_LAT = 10.9575
const DEFAULT_JANIUAY_LNG = 122.5028

export function LocationPickerMap({
  initialLat,
  initialLng,
  address,
  onChange,
}: LocationPickerMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markerRef = useRef<any>(null)

  const [coords, setCoords] = useState<{ lat: number; lng: number }>({
    lat: initialLat || DEFAULT_JANIUAY_LAT,
    lng: initialLng || DEFAULT_JANIUAY_LNG,
  })
  const [detecting, setDetecting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [mapLoaded, setMapLoaded] = useState(false)

  // Initialize Leaflet map dynamically to avoid SSR window errors
  useEffect(() => {
    let isMounted = true

    const initMap = async () => {
      if (typeof window === "undefined" || !mapContainerRef.current) return

      try {
        const L = (await import("leaflet")).default

        // Fix leaflet default icon issues in Next.js
        delete (L.Icon.Default.prototype as any)._getIconUrl
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
          iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
          shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        })

        if (!mapInstanceRef.current && mapContainerRef.current) {
          const map = L.map(mapContainerRef.current, {
            center: [coords.lat, coords.lng],
            zoom: 15,
            zoomControl: true,
          })

          // Use OpenStreetMap standard tiles (100% free, no API keys required)
          L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 19,
          }).addTo(map)

          // Custom pin icon with distinct color
          const markerIcon = L.divIcon({
            className: "custom-leaflet-marker",
            html: `
              <div style="
                display: flex;
                align-items: center;
                justify-content: center;
                background-color: #16a34a;
                color: white;
                width: 38px;
                height: 38px;
                border-radius: 50% 50% 50% 0;
                transform: rotate(-45deg);
                box-shadow: 0 4px 10px rgba(0,0,0,0.3);
                border: 2px solid white;
              ">
                <span style="transform: rotate(45deg); font-size: 16px;">📍</span>
              </div>
            `,
            iconSize: [38, 38],
            iconAnchor: [19, 38],
          })

          const marker = L.marker([coords.lat, coords.lng], {
            draggable: true,
            icon: markerIcon,
          }).addTo(map)

          marker.on("dragend", () => {
            const position = marker.getLatLng()
            const updated = { lat: position.lat, lng: position.lng }
            setCoords(updated)
            onChange(updated)
          })

          map.on("click", (e: any) => {
            marker.setLatLng(e.latlng)
            const updated = { lat: e.latlng.lat, lng: e.latlng.lng }
            setCoords(updated)
            onChange(updated)
          })

          mapInstanceRef.current = map
          markerRef.current = marker
          if (isMounted) setMapLoaded(true)
        }
      } catch (err) {
        console.error("Leaflet load error:", err)
      }
    }

    initMap()

    return () => {
      isMounted = false
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [])

  // Sync coords if props change externally
  useEffect(() => {
    if (initialLat && initialLng && (initialLat !== coords.lat || initialLng !== coords.lng)) {
      setCoords({ lat: initialLat, lng: initialLng })
      if (markerRef.current && mapInstanceRef.current) {
        markerRef.current.setLatLng([initialLat, initialLng])
        mapInstanceRef.current.setView([initialLat, initialLng], 15)
      }
    }
  }, [initialLat, initialLng])

  // Browser Geolocation auto-detection
  const handleAutoLocate = () => {
    if (!navigator.geolocation) {
      setErrorMsg("Geolocation is not supported by your browser.")
      return
    }

    setDetecting(true)
    setErrorMsg(null)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setDetecting(false)
        const userLat = position.coords.latitude
        const userLng = position.coords.longitude
        const newCoords = { lat: userLat, lng: userLng }

        setCoords(newCoords)
        onChange(newCoords)

        if (markerRef.current && mapInstanceRef.current) {
          markerRef.current.setLatLng([userLat, userLng])
          mapInstanceRef.current.setView([userLat, userLng], 16)
        }
      },
      (error) => {
        setDetecting(false)
        if (error.code === error.PERMISSION_DENIED) {
          setErrorMsg("Permission denied. Please allow location access or drag the pin manually.")
        } else {
          setErrorMsg("Unable to retrieve precise location. Please drag the pin on the map.")
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    )
  }

  return (
    <div className="space-y-2">
      {/* Include Leaflet CSS via CDN link if not in global css */}
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
        crossOrigin=""
      />

      <div className="flex flex-wrap items-center justify-between gap-2 bg-emerald-50 border border-emerald-200 rounded-lg p-3">
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-emerald-700 shrink-0" />
          <div>
            <p className="text-xs font-semibold text-emerald-900">Pin Exact Pickup Location</p>
            <p className="text-[11px] text-emerald-700">
              Drag the green pin or click on the map to mark your door/building.
            </p>
          </div>
        </div>

        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={handleAutoLocate}
          disabled={detecting}
          className="bg-white hover:bg-emerald-100 text-emerald-800 border-emerald-300 text-xs flex items-center gap-1.5 shadow-sm"
        >
          <Crosshair className={`h-3.5 w-3.5 ${detecting ? "animate-spin text-emerald-600" : ""}`} />
          {detecting ? "Detecting GPS..." : "Auto-Locate My Device"}
        </Button>
      </div>

      {errorMsg && (
        <div className="flex items-center gap-2 text-xs text-amber-800 bg-amber-50 p-2 rounded border border-amber-200">
          <AlertCircle className="h-4 w-4 shrink-0 text-amber-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Map Display Box */}
      <div className="relative w-full h-[260px] rounded-lg border-2 border-emerald-500/40 shadow-inner overflow-hidden">
        <div ref={mapContainerRef} className="w-full h-full z-0" />
        
        {/* Real-time coordinates badge */}
        <div className="absolute bottom-2 left-2 z-[400] bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded shadow text-[10px] font-mono text-gray-700 border">
          GPS: {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
        </div>
      </div>
    </div>
  )
}

interface LocationViewerMapProps {
  latitude: number
  longitude: number
  title?: string
  address?: string
}

export function LocationViewerMap({
  latitude,
  longitude,
  title,
  address,
}: LocationViewerMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)

  useEffect(() => {
    let isMounted = true

    const loadMap = async () => {
      if (typeof window === "undefined" || !containerRef.current) return

      try {
        const L = (await import("leaflet")).default

        delete (L.Icon.Default.prototype as any)._getIconUrl
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
          iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
          shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        })

        if (!mapRef.current && containerRef.current) {
          const map = L.map(containerRef.current, {
            center: [latitude, longitude],
            zoom: 16,
            zoomControl: true,
          })

          L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: '&copy; OpenStreetMap contributors',
            maxZoom: 19,
          }).addTo(map)

          const markerIcon = L.divIcon({
            className: "custom-leaflet-marker",
            html: `
              <div style="
                display: flex;
                align-items: center;
                justify-content: center;
                background-color: #2563eb;
                color: white;
                width: 38px;
                height: 38px;
                border-radius: 50% 50% 50% 0;
                transform: rotate(-45deg);
                box-shadow: 0 4px 10px rgba(0,0,0,0.3);
                border: 2px solid white;
              ">
                <span style="transform: rotate(45deg); font-size: 16px;">📍</span>
              </div>
            `,
            iconSize: [38, 38],
            iconAnchor: [19, 38],
          })

          const marker = L.marker([latitude, longitude], { icon: markerIcon }).addTo(map)
          if (title || address) {
            marker.bindPopup(`<b>${title || "Pickup Location"}</b><br/>${address || ""}`).openPopup()
          }

          mapRef.current = map
        }
      } catch (err) {
        console.error("Viewer map error:", err)
      }
    }

    loadMap()

    return () => {
      isMounted = false
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [latitude, longitude, title, address])

  // Open in external navigation services
  const openExternalMap = (type: "osm" | "bing" | "geo") => {
    if (type === "osm") {
      window.open(`https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=17/${latitude}/${longitude}`, "_blank")
    } else if (type === "bing") {
      window.open(`https://www.bing.com/maps?cp=${latitude}~${longitude}&lvl=16`, "_blank")
    } else {
      window.open(`geo:${latitude},${longitude}?q=${latitude},${longitude}`, "_blank")
    }
  }

  return (
    <div className="space-y-3">
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
        crossOrigin=""
      />
      <div className="relative w-full h-[280px] rounded-lg border shadow-sm overflow-hidden">
        <div ref={containerRef} className="w-full h-full z-0" />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-gray-50 rounded-lg border text-xs">
        <div className="text-gray-600">
          <span className="font-semibold text-gray-800">Coordinates:</span> {latitude.toFixed(5)}, {longitude.toFixed(5)}
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="text-xs h-7 gap-1"
            onClick={() => openExternalMap("osm")}
          >
            <Navigation className="h-3 w-3 text-blue-600" />
            Open in OpenStreetMap
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="text-xs h-7 gap-1"
            onClick={() => openExternalMap("bing")}
          >
            <Navigation className="h-3 w-3 text-emerald-600" />
            Open Directions
          </Button>
        </div>
      </div>
    </div>
  )
}
