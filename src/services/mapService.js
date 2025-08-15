import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

export class MapService {
  constructor() {
    this.map = null
    this.markers = []
    this.routingControl = null
  }

  // Initialize map
  async initializeMap(containerId, options = {}) {
    try {
      const defaultOptions = {
        zoom: 12,
        center: { lat: 31.2990, lng: 120.5853 }, // Suzhou coordinates
        ...options
      }

      // Create Leaflet map
      this.map = L.map(containerId).setView(
        [defaultOptions.center.lat, defaultOptions.center.lng], 
        defaultOptions.zoom
      )

      // Add OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(this.map)

      // Add map click event
      this.map.on('click', (e) => {
        this.handleMapClick(e)
      })

      return { success: true, map: this.map }
    } catch (error) {
      console.error('Failed to initialize map:', error)
      return { success: false, error: error.message }
    }
  }

  // Handle map click
  handleMapClick(e) {
    const { lat, lng } = e.latlng
    console.log('Map clicked at:', { lat, lng })
    
    // Add a temporary marker
    const marker = L.marker([lat, lng])
      .addTo(this.map)
      .bindPopup('Clicked location')
    
    // Remove marker after 3 seconds
    setTimeout(() => {
      this.map.removeLayer(marker)
    }, 3000)
  }

  // Search places of interest
  async searchPlaces(query, location = null) {
    try {
      // Mock search results with Suzhou locations
      const mockPlaces = [
        {
          id: 1,
          name: 'Suzhou Community Service Center',
          location: { lat: 31.2990, lng: 120.5853 },
          address: 'Gusu District Community Service Center, Suzhou',
          type: 'community'
        },
        {
          id: 2,
          name: 'Suzhou Police Station',
          location: { lat: 31.3090, lng: 120.5953 },
          address: 'Gusu District Police Station, Suzhou',
          type: 'police'
        },
        {
          id: 3,
          name: 'Bank of China Suzhou',
          location: { lat: 31.2890, lng: 120.5753 },
          address: 'Gusu District Bank, Suzhou',
          type: 'bank'
        },
        {
          id: 4,
          name: 'Suzhou University Hospital',
          location: { lat: 31.3190, lng: 120.6053 },
          address: 'Gusu District Hospital, Suzhou',
          type: 'hospital'
        },
        {
          id: 5,
          name: 'Suzhou University',
          location: { lat: 31.2790, lng: 120.5653 },
          address: 'Gusu District University, Suzhou',
          type: 'school'
        },
        {
          id: 6,
          name: 'Suzhou Traditional Restaurant',
          location: { lat: 31.3090, lng: 120.5753 },
          address: 'Gusu District Restaurant, Suzhou',
          type: 'restaurant'
        },
        {
          id: 7,
          name: 'Suzhou Shopping Center',
          location: { lat: 31.2890, lng: 120.5953 },
          address: 'Gusu District Shopping Center, Suzhou',
          type: 'shop'
        },
        {
          id: 8,
          name: 'Humble Garden',
          location: { lat: 31.2990, lng: 120.5953 },
          address: 'Famous Suzhou Garden, Suzhou',
          type: 'community'
        },
        {
          id: 9,
          name: 'Tiger Hill',
          location: { lat: 31.2890, lng: 120.6053 },
          address: 'Famous Suzhou Scenic Spot, Suzhou',
          type: 'community'
        }
      ]

      // Filter based on query conditions (case insensitive)
      const queryLower = query.toLowerCase()
      let filteredPlaces = mockPlaces.filter(place => 
        place.name.toLowerCase().includes(queryLower) || 
        place.address.toLowerCase().includes(queryLower) ||
        place.type.toLowerCase().includes(queryLower)
      )

      // If location is provided, sort by distance and add distance info
      if (location) {
        filteredPlaces = filteredPlaces.map(place => ({
          ...place,
          distance: this.calculateDistance(location, place.location)
        })).sort((a, b) => a.distance - b.distance) // Sort by distance (nearest first)
      }

      return { success: true, places: filteredPlaces }
    } catch (error) {
      console.error('Failed to search places:', error)
      return { success: false, error: error.message }
    }
  }

  // Geocode city name to coordinates
  async geocodeCity(cityName) {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cityName)}&limit=1`
      )
      
      if (!response.ok) {
        throw new Error('Geocoding request failed')
      }
      
      const data = await response.json()
      
      if (data && data.length > 0) {
        const result = data[0]
        return {
          success: true,
          location: {
            lat: parseFloat(result.lat),
            lng: parseFloat(result.lon)
          },
          displayName: result.display_name,
          cityName: cityName
        }
      } else {
        return {
          success: false,
          error: `City "${cityName}" not found`
        }
      }
    } catch (error) {
      console.error('Geocoding error:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  // Calculate route
  async calculateRoute(origin, destination, mode = 'driving') {
    try {
      // Clear previous route
      if (this.routingControl) {
        this.map.removeControl(this.routingControl)
      }

      // Create route line
      const routeLine = L.polyline([
        [origin.lat, origin.lng],
        [destination.lat, destination.lng]
      ], {
        color: '#007bff',
        weight: 4,
        opacity: 0.7
      }).addTo(this.map)

      // Fit map to show entire route
      this.map.fitBounds(routeLine.getBounds(), { padding: [20, 20] })

      // Calculate distance and estimated time
      const distance = this.calculateDistance(origin, destination)
      const estimatedTime = this.estimateTravelTime(distance, mode)

      const route = {
        distance: `${distance.toFixed(1)} km`,
        duration: `${estimatedTime} minutes`,
        steps: [
          `Start from origin (${origin.lat.toFixed(4)}, ${origin.lng.toFixed(4)})`,
          `Travel ${distance.toFixed(1)} km`,
          `Arrive at destination (${destination.lat.toFixed(4)}, ${destination.lng.toFixed(4)})`
        ],
        polyline: routeLine
      }

      return { success: true, route }
    } catch (error) {
      console.error('Failed to calculate route:', error)
      return { success: false, error: error.message }
    }
  }

  // Estimate travel time based on distance and mode
  estimateTravelTime(distance, mode) {
    const speeds = {
      driving: 30, // km/h in city
      walking: 5,  // km/h
      bicycling: 15, // km/h
      transit: 20   // km/h
    }
    
    const speed = speeds[mode] || speeds.driving
    return Math.round((distance / speed) * 60)
  }

  // Add marker
  addMarker(position, title = '', options = {}) {
    try {
      const marker = L.marker([position.lat, position.lng])
        .addTo(this.map)
        .bindPopup(title || 'Location')

      // Add custom icon if specified
      if (options.icon) {
        const customIcon = L.divIcon({
          html: `<i class="${options.icon}" style="color: ${options.color || '#007bff'}; font-size: 24px;"></i>`,
          className: 'custom-marker',
          iconSize: [24, 24]
        })
        marker.setIcon(customIcon)
      }

      this.markers.push(marker)
      return { success: true, marker }
    } catch (error) {
      console.error('Failed to add marker:', error)
      return { success: false, error: error.message }
    }
  }

  // Clear all markers
  clearMarkers() {
    try {
      this.markers.forEach(marker => {
        if (this.map && marker.remove) {
          this.map.removeLayer(marker)
        }
      })
      this.markers = []
      return { success: true }
    } catch (error) {
      console.error('Failed to clear markers:', error)
      return { success: false, error: error.message }
    }
  }

  // Get user's current location
  async getCurrentLocation() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Your browser does not support geolocation. Please use a modern browser.'))
        return
      }

      // Check if we're on HTTPS (required for geolocation in production)
      if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
        reject(new Error('Geolocation requires HTTPS connection. Please ensure your website uses a secure connection.'))
        return
      }

      // Check if geolocation permission is granted
      if (navigator.permissions) {
        navigator.permissions.query({ name: 'geolocation' }).then((permissionStatus) => {
          if (permissionStatus.state === 'denied') {
            reject(new Error('Location permission denied. Please follow these steps:\n1. Click the 🔒 icon on the left side of the address bar\n2. Set "Location" permission to "Allow"\n3. Refresh the page and try again'))
            return
          }
          
          // For 'granted' and 'prompt' states, proceed with getting location
          // 'prompt' will trigger the browser's permission request popup
          if (permissionStatus.state === 'prompt') {
            console.log('Permission not yet requested, will show browser permission popup...')
          } else if (permissionStatus.state === 'granted') {
            console.log('Permission already granted, getting location...')
          }
          
          // Proceed with getting location (this will trigger permission popup if needed)
          this.requestLocation(resolve, reject)
        }).catch(() => {
          // Fallback if permissions API is not supported
          console.log('Permissions API not supported, proceeding with location request...')
          this.requestLocation(resolve, reject)
        })
      } else {
        // Fallback for browsers that don't support permissions API
        console.log('Permissions API not available, proceeding with location request...')
        this.requestLocation(resolve, reject)
      }
    })
  }

  // Helper method to request location
  requestLocation(resolve, reject) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy
        }
        resolve({ success: true, location })
      },
      (error) => {
        let errorMessage = 'Failed to get location'
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied. Please follow these steps:\n\n1. Click the 🔒 icon on the left side of the address bar\n2. Find the "Location" option\n3. Select "Allow"\n4. Refresh the page and try again\n\nIf the problem persists, check location permissions in your browser settings.'
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable. Possible causes:\n• Network connection issues\n• Weak GPS signal\n• Browser geolocation service failure\n\nPlease check your network connection and try again.'
            break
          case error.TIMEOUT:
            errorMessage = 'Location request timed out. Possible causes:\n• Network latency\n• Slow GPS response\n• Browser settings issues\n\nPlease try again later or check your network connection.'
            break
          default:
            errorMessage = `Location error: ${error.message}\n\nPlease try refreshing the page or contact technical support.`
        }
        
        reject(new Error(errorMessage))
      },
      {
        enableHighAccuracy: true,
        timeout: 15000, // Increased timeout to 15 seconds
        maximumAge: 60000
      }
    )
  }

  // Calculate distance between two points
  calculateDistance(point1, point2) {
    const R = 6371 // Earth radius (kilometers)
    const dLat = this.deg2rad(point2.lat - point1.lat)
    const dLng = this.deg2rad(point2.lng - point1.lng)
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.deg2rad(point1.lat)) * Math.cos(this.deg2rad(point2.lat)) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2)
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    const distance = R * c
    
    return distance
  }

  // Convert degrees to radians
  deg2rad(deg) {
    return deg * (Math.PI / 180)
  }
}

export default new MapService() 