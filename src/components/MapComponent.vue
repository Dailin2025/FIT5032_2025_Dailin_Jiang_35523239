<template>
  <div class="map-component">
    <!-- 地图控制面板 -->
    <div class="map-controls mb-3">
      <div class="row">
        <div class="col-md-4">
          <div class="search-box">
            <i class="fas fa-search search-icon"></i>
            <input
              v-model="searchQuery"
              type="text"
              class="form-control search-input"
              placeholder="Search places..."
              @keyup.enter="searchPlaces"
            />

          </div>
        </div>
        <div class="col-md-4">
          <div class="location-controls">
            <button 
              class="btn btn-outline-primary me-2" 
              @click="getCurrentLocation"
              title="Get current location"
            >
              <i class="fas fa-location-arrow me-1"></i>My Location
            </button>
            <button 
              class="btn btn-outline-info me-2" 
              @click="resetLocationPermission"
              title="Reset location permission"
            >
              <i class="fas fa-key me-1"></i>Reset Permission
            </button>
            <button 
              class="btn btn-outline-success" 
              @click="clearMarkers"
              title="Clear markers"
            >
              <i class="fas fa-trash me-1"></i>Clear Markers
            </button>
          </div>
        </div>
        <div class="col-md-4 text-end">
          <div class="map-actions">
            <button 
              class="btn btn-outline-info me-2" 
              @click="showRoutePanel = !showRoutePanel"
              title="Route planning"
            >
              <i class="fas fa-route me-1"></i>Route Planning
            </button>
            <button 
              class="btn btn-outline-warning" 
              @click="exportMapData"
              title="Export map data"
            >
              <i class="fas fa-download me-1"></i>Export
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 路线规划面板 -->
    <div v-if="showRoutePanel" class="route-panel mb-3">
      <div class="card">
        <div class="card-header">
          <h6 class="mb-0">
            <i class="fas fa-route me-2"></i>Route Planning
          </h6>
        </div>
        <div class="card-body">
          <div class="row">
            <div class="col-md-5">
              <label class="form-label">Origin</label>
              <input
                v-model="routeOrigin"
                type="text"
                class="form-control"
                placeholder="Enter origin address or select point on map"
              />
            </div>
            <div class="col-md-5">
              <label class="form-label">Destination</label>
              <input
                v-model="routeDestination"
                type="text"
                class="form-control"
                placeholder="Enter destination address or select point on map"
              />
            </div>
            <div class="col-md-2">
              <label class="form-label">Mode</label>
              <select v-model="routeMode" class="form-select">
                <option value="driving">Driving</option>
                <option value="walking">Walking</option>
                <option value="transit">Transit</option>
                <option value="bicycling">Bicycling</option>
              </select>
            </div>
          </div>
          <div class="text-center mt-3">
            <button 
              class="btn btn-primary" 
              @click="calculateRoute"
              :disabled="!routeOrigin || !routeDestination"
            >
              <i class="fas fa-calculator me-2"></i>Calculate Route
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 地图容器 -->
    <div class="map-container">
      <div id="map" class="map-area">
        <!-- 地图将在这里渲染 -->
        <div class="map-placeholder">
          <i class="fas fa-map-marked-alt map-icon"></i>
          <h4>Map Loading...</h4>
          <p>Initializing map service</p>
        </div>
      </div>
    </div>

    <!-- 搜索结果面板 -->
    <div v-if="searchResults.length > 0" class="search-results mt-3">
      <div class="card">
        <div class="card-header">
          <h6 class="mb-0">
            <i class="fas fa-search me-2"></i>Search Results ({{ searchResults.length }})
          </h6>
        </div>
        <div class="card-body">
          <div class="row">
            <div 
              v-for="place in searchResults" 
              :key="place.id"
              class="col-md-4 mb-3"
            >
              <div class="place-card" @click="selectPlace(place)">
                <div class="place-icon">
                  <i :class="getPlaceIcon(place.type)"></i>
                </div>
                <div class="place-info">
                  <h6 class="place-name">{{ place.name }}</h6>
                  <p class="place-address">{{ place.address }}</p>
                  <small class="place-type">{{ getPlaceTypeName(place.type) }}</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 自定义路线结果弹框 -->
    <div v-if="showRouteResult" class="custom-modal-overlay" @click="closeRouteResult">
      <div class="custom-modal" @click.stop>
        <div class="custom-modal-header">
          <h5 class="mb-0">
            <i class="fas fa-check-circle text-success me-2"></i>Route Calculated Successfully!
          </h5>
          <button type="button" class="btn-close" @click="closeRouteResult"></button>
        </div>
        <div class="custom-modal-body">
          <div class="route-summary">
            <div class="route-points">
              <div class="route-point origin">
                <i class="fas fa-play-circle text-success"></i>
                <span class="point-label">From:</span>
                <span class="point-value">{{ routeOrigin }}</span>
              </div>
              <div class="route-arrow">
                <i class="fas fa-arrow-right text-primary"></i>
              </div>
              <div class="route-point destination">
                <i class="fas fa-flag-checkered text-danger"></i>
                <span class="point-label">To:</span>
                <span class="point-value">{{ routeDestination }}</span>
              </div>
            </div>
            
            <div class="route-details mt-3">
              <div class="detail-item">
                <i class="fas fa-road text-primary me-2"></i>
                <span class="detail-label">Distance:</span>
                <span class="detail-value">{{ currentRouteDistance || 'Calculating...' }}</span>
              </div>
              <div class="detail-item">
                <i class="fas fa-clock text-warning me-2"></i>
                <span class="detail-label">Time:</span>
                <span class="detail-value">{{ currentRouteDuration || 'Calculating...' }}</span>
              </div>
              <div class="detail-item">
                <i class="fas fa-car text-info me-2"></i>
                <span class="detail-label">Mode:</span>
                <span class="detail-value">{{ routeMode }}</span>
              </div>
            </div>
            
            <!-- Geocoding info -->
            <div v-if="geocodingInfo" class="geocoding-info mt-3 p-2 bg-light rounded">
              <small class="text-muted">
                <i class="fas fa-info-circle me-1"></i>
                {{ geocodingInfo }}
              </small>
            </div>
          </div>
        </div>
        <div class="custom-modal-footer">
          <button class="btn btn-primary" @click="closeRouteResult">
            <i class="fas fa-check me-2"></i>OK
          </button>
        </div>
      </div>
    </div>

    <!-- 路线信息面板 -->
    <div v-if="routeInfo" class="route-info mt-3">
      <div class="card">
        <div class="card-header">
          <h6 class="mb-0">
            <i class="fas fa-info-circle me-2"></i>Route Information
          </h6>
        </div>
        <div class="card-body">
          <div class="row text-center">
            <div class="col-md-3">
              <div class="route-stat">
                <i class="fas fa-road text-primary"></i>
                <h5>{{ routeInfo.distance }}</h5>
                <small>Distance</small>
              </div>
            </div>
            <div class="col-md-3">
              <div class="route-stat">
                <i class="fas fa-clock text-warning"></i>
                <h5>{{ routeInfo.duration }}</h5>
                <small>Estimated Time</small>
              </div>
            </div>
            <div class="col-md-3">
              <div class="route-stat">
                <i class="fas fa-route text-success"></i>
                <h5>{{ routeInfo.steps.length }}</h5>
                <small>Steps</small>
              </div>
            </div>
            <div class="col-md-3">
              <div class="route-stat">
                <i class="fas fa-gas-pump text-danger"></i>
                <h5>{{ routeInfo.fuelCost || 'N/A' }}</h5>
                <small>Fuel Cost</small>
              </div>
            </div>
          </div>
          
          <!-- Route steps -->
          <div class="route-steps mt-3">
            <h6>Detailed Route:</h6>
            <div class="steps-list">
              <div 
                v-for="(step, index) in routeInfo.steps" 
                :key="index"
                class="step-item"
              >
                <span class="step-number">{{ index + 1 }}</span>
                <span class="step-text">{{ step }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import mapService from '@/services/mapService'
import exportService from '@/services/exportService'
import L from 'leaflet'
import { showSuccess, showError, showInfo } from '@/services/toastService.js'

// Reactive data
const searchQuery = ref('')
const searchResults = ref([])
const showRoutePanel = ref(false)
const routeOrigin = ref('')
const routeDestination = ref('')
const routeMode = ref('driving')
const routeInfo = ref(null)
const currentLocation = ref(null)
const showRouteResult = ref(false)
const currentRouteDistance = ref('')
const currentRouteDuration = ref('')
const geocodingInfo = ref('')

// Map related
let map = null
let markers = []

// Lifecycle
// 初始化地图
onMounted(async () => {
  try {
    // 初始化地图
    const result = await mapService.initializeMap('map')
    if (result.success) {
      map = result.map
      
      // 立即居中到苏州
      if (map && map.setView) {
        map.setView([31.2990, 120.5853], 12)
        
        // 延迟后再次居中，确保地图完全加载
        setTimeout(() => {
          if (map && map.setView) {
            map.setView([31.2990, 120.5853], 12)
          }
        }, 1000)
      }
    }
  } catch (error) {
    console.error('Failed to initialize map:', error)
  }
})

onBeforeUnmount(() => {
  if (map) {
    // Clean up map resources
    clearMarkers()
  }
})

// Methods
async function initializeMap() {
  try {
    const result = await mapService.initializeMap('map', {
      zoom: 12,
      center: { lat: 39.9042, lng: 116.4074 }
    })
    
    if (result.success) {
      map = result.map
      console.log('Map initialized successfully')
    } else {
      console.error('Map initialization failed:', result.error)
    }
  } catch (error) {
    console.error('Map initialization error:', error)
  }
}

async function searchPlaces() {
  if (!searchQuery.value.trim()) return
  
  try {
    // If no current location, get it first
    if (!currentLocation.value) {
      console.log('Getting current location for search...')
      const locationResult = await mapService.getCurrentLocation()
      if (locationResult.success) {
        currentLocation.value = locationResult.location
        console.log('Current location set for search:', currentLocation.value)
      } else {
        showError('Please allow location access to find places near you, or click "My Location" first.')
        return
      }
    }
    
    const result = await mapService.searchPlaces(searchQuery.value, currentLocation.value)
    
    if (result.success) {
      searchResults.value = result.places
      
      // Clear previous markers
      clearMarkers()
      
      // Add markers on the map with distance information
      result.places.forEach(place => {
        const distance = mapService.calculateDistance(currentLocation.value, place.location)
        const marker = mapService.addMarker(place.location, `${place.name} (${distance.toFixed(1)} km away)`, {
          icon: getPlaceIcon(place.type),
          color: '#007bff'
        })
        if (marker.success) {
          markers.push(marker.marker)
        }
      })
      
      // Fit map to show all markers
      if (result.places.length > 0 && map && map.fitBounds) {
        const bounds = L.latLngBounds(result.places.map(p => [p.location.lat, p.location.lng]))
        map.fitBounds(bounds, { padding: [20, 20] })
      }
      
      console.log(`Found ${result.places.length} places near you`)
    } else {
      console.error('Search failed:', result.error)
    }
  } catch (error) {
    console.error('Search error:', error)
  }
}

async function getCurrentLocation() {
  try {
    // Show loading state
    showInfo('Requesting location permission...')
    
    const result = await mapService.getCurrentLocation()
    
    if (result.success) {
      currentLocation.value = result.location
      
      // Clear previous location markers
      markers.forEach(marker => {
        if (marker.options && marker.options.title === 'My Location') {
          if (map && marker.remove) {
            map.removeLayer(marker)
          }
        }
      })
      
      // Mark current location on the map
      const marker = mapService.addMarker(result.location, 'My Location', {
        icon: 'fas fa-user-circle',
        color: '#007bff'
      })
      
      if (marker.success) {
        markers.push(marker.marker)
      }
      
      // Update map center and zoom to current location
      if (map && map.setView) {
        // First, clear any existing route lines
        if (map.eachLayer) {
          map.eachLayer((layer) => {
            if (layer instanceof L.Polyline) {
              map.removeLayer(layer)
            }
          })
        }
        
        // Center on your location with animation
        map.setView([result.location.lat, result.location.lng], 15, {
          animate: true,
          duration: 1
        })
        
        // Add a temporary "You are here" marker
        const youAreHereMarker = L.marker([result.location.lat, result.location.lng])
          .addTo(map)
          .bindPopup('<b>You are here!</b><br>Your current location')
        
        // Remove the temporary marker after 5 seconds
        setTimeout(() => {
          if (map && youAreHereMarker.remove) {
            map.removeLayer(youAreHereMarker)
          }
        }, 5000)
      }
      
      // Show success message with more details
      const message = `Location found! You are at: ${result.location.lat.toFixed(4)}, ${result.location.lng.toFixed(4)}\n\nThis should be your actual location in Suzhou.`
      showInfo(message)
      
    } else {
      console.error('Failed to get location:', result.error)
      showError('Failed to get location: ' + result.error)
    }
  } catch (error) {
    console.error('Get location error:', error)
    
    // Provide more user-friendly error messages
    let userMessage = 'Error occurred while getting location'
    
    if (error.message.includes('HTTPS')) {
      userMessage = '⚠️ Location feature requires HTTPS connection\n\nYour website is currently using HTTP connection, geolocation cannot work. Please ensure your website uses a secure connection.'
    } else if (error.message.includes('permission denied')) {
      userMessage = '🔒 Location permission denied\n\nPlease follow these steps:\n1. Click the 🔒 icon on the left side of the address bar\n2. Set "Location" permission to "Allow"\n3. Refresh the page and try again'
    } else if (error.message.includes('does not support geolocation')) {
      userMessage = '❌ Browser does not support geolocation\n\nPlease use modern browsers like Chrome, Firefox, Safari, etc.'
    } else if (error.message.includes('timed out')) {
      userMessage = '⏰ Location request timed out\n\nPlease check your network connection and try again, or try later.'
    } else if (error.message.includes('unavailable')) {
      userMessage = '📡 Location information unavailable\n\nPossible causes:\n• Network connection issues\n• Weak GPS signal\n• Browser geolocation service failure'
    } else {
      userMessage = `❌ Location error: ${error.message}\n\nPlease try refreshing the page or contact technical support.`
    }
    
    showError(userMessage)
  }
}

function selectPlace(place) {
  // Select place, can be used for route planning
  if (showRoutePanel.value) {
    if (!routeOrigin.value) {
      routeOrigin.value = place.name
    } else if (!routeDestination.value) {
      routeDestination.value = place.name
    }
  }
  
  // Highlight selected place
  console.log('Selected place:', place)
}

async function calculateRoute() {
  if (!routeOrigin.value || !routeDestination.value) return
  
  try {
    // Show loading state
    currentRouteDistance.value = 'Geocoding...'
    currentRouteDuration.value = 'Please wait...'
    
    // Use real geocoding service to get coordinates
    const originResult = await mapService.geocodeCity(routeOrigin.value)
    const destResult = await mapService.geocodeCity(routeDestination.value)
    
    if (!originResult.success) {
      showError(`Failed to find origin city: ${originResult.error}`)
      currentRouteDistance.value = ''
      currentRouteDuration.value = ''
      return
    }
    
    if (!destResult.success) {
      showError(`Failed to find destination city: ${destResult.error}`)
      currentRouteDistance.value = ''
      currentRouteDuration.value = ''
      return
    }
    
    const originCoords = originResult.location
    const destCoords = destResult.location
    
    // Set geocoding info for display
    geocodingInfo.value = `From: ${originResult.displayName} | To: ${destResult.displayName}`
    
    console.log('Origin coordinates:', originCoords, 'for city:', routeOrigin.value)
    console.log('Destination coordinates:', destCoords, 'for city:', routeDestination.value)
    
    const result = await mapService.calculateRoute(
      originCoords,
      destCoords,
      routeMode.value
    )
    
    if (result.success) {
      routeInfo.value = result.route
      
      // Clear previous markers and add new ones
      clearMarkers()
      
      // Add origin and destination markers
      const originMarker = mapService.addMarker(originCoords, `Origin: ${routeOrigin.value}`, {
        icon: 'fas fa-play-circle',
        color: '#28a745'
      })
      
      const destMarker = mapService.addMarker(destCoords, `Destination: ${routeDestination.value}`, {
        icon: 'fas fa-flag-checkered',
        color: '#dc3545'
      })
      
      if (originMarker.success) markers.push(originMarker.marker)
      if (destMarker.success) markers.push(destMarker.marker)
      
      // Force map to show the route by fitting bounds
      if (map && map.fitBounds) {
        const bounds = L.latLngBounds([
          [originCoords.lat, originCoords.lng],
          [destCoords.lat, destCoords.lng]
        ])
        map.fitBounds(bounds, { padding: [50, 50] })
      }
      
      console.log('Route calculation successful:', result.route)
      console.log('Route info:', routeInfo.value)
      
      // Set current route info for the modal
      currentRouteDistance.value = result.route.distance
      currentRouteDuration.value = result.route.duration
      
      // Show custom modal instead of alert
      showRouteResult.value = true
    } else {
      console.error('Route calculation failed:', result.error)
      currentRouteDistance.value = 'Error'
      currentRouteDuration.value = 'Failed'
      showError('Failed to calculate route: ' + result.error)
    }
    } catch (error) {
    console.error('Route calculation error:', error)
    currentRouteDistance.value = 'Error'
    currentRouteDuration.value = 'Failed'
    showError('Error calculating route: ' + error.message)
  }
}

function clearMarkers() {
  // Clear markers from map service
  mapService.clearMarkers()
  markers = []
  searchResults.value = []
  routeInfo.value = null
  currentRouteDistance.value = ''
  currentRouteDuration.value = ''
  showRouteResult.value = false
  geocodingInfo.value = ''
  
  // Clear any existing route lines and polylines
  if (map && map.eachLayer) {
    map.eachLayer((layer) => {
      if (layer instanceof L.Polyline || layer instanceof L.LayerGroup) {
        map.removeLayer(layer)
      }
    })
  }
  
  console.log('All markers and routes cleared')
}





function closeRouteResult() {
  showRouteResult.value = false
}

function exportMapData() {
  const mapData = {
    searchResults: searchResults.value,
    routeInfo: routeInfo.value,
    currentLocation: currentLocation.value,
    exportTime: new Date().toISOString()
  }
  
  exportService.exportToCSV([mapData], 'map-data.csv')
}

function getPlaceIcon(type) {
  const icons = {
    community: 'fas fa-home',
    police: 'fas fa-shield-alt',
    bank: 'fas fa-university',
    hospital: 'fas fa-hospital',
    school: 'fas fa-graduation-cap',
    restaurant: 'fas fa-utensils',
    shop: 'fas fa-shopping-cart'
  }
  return icons[type] || 'fas fa-map-marker-alt'
}

function getPlaceTypeName(type) {
  const typeNames = {
    community: 'Community Service',
    police: 'Police Station',
    bank: 'Bank',
    hospital: 'Hospital',
    school: 'School',
    restaurant: 'Restaurant',
    shop: 'Shop'
  }
  return typeNames[type] || 'Other'
}

function resetLocationPermission() {
  showInfo('Attempting to reset location permission...')
  mapService.resetLocationPermission()
    .then(() => {
      showSuccess('Location permission reset successfully! Please refresh the page to apply changes.')
      console.log('Location permission reset successfully.')
    })
    .catch(error => {
      showError('Failed to reset location permission: ' + error)
      console.error('Failed to reset location permission:', error)
    })
}
</script>

<style scoped>
.map-component {
  background: white;
  border-radius: 15px;
  padding: 1.5rem;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
}

.map-controls {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 10px;
}

.search-box {
  position: relative;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
  z-index: 10;
}

.search-input {
  padding-left: 35px;
  border-radius: 25px;
  border: 2px solid #e9ecef;
  transition: all 0.3s ease;
}

.search-input:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
}

.map-container {
  position: relative;
  height: 500px;
  border-radius: 15px;
  overflow: hidden;
  border: 2px solid #e9ecef;
}

.map-area {
  width: 100%;
  height: 100%;
  background: #f8f9fa;
}

.map-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #6c757d;
}

.map-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  color: #667eea;
}

.route-panel {
  background: #f8f9fa;
  border-radius: 10px;
}

.place-card {
  display: flex;
  align-items: center;
  padding: 1rem;
  background: white;
  border-radius: 10px;
  border: 1px solid #e9ecef;
  cursor: pointer;
  transition: all 0.3s ease;
}

.place-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  border-color: #667eea;
}

.place-icon {
  font-size: 2rem;
  color: #667eea;
  margin-right: 1rem;
  width: 50px;
  text-align: center;
}

.place-info {
  flex: 1;
}

.place-name {
  margin: 0 0 0.5rem 0;
  font-weight: 600;
  color: #333;
}

.place-address {
  margin: 0 0 0.25rem 0;
  color: #666;
  font-size: 0.9rem;
}

.place-type {
  color: #667eea;
  font-weight: 500;
}

.route-info {
  background: #f8f9fa;
  border-radius: 10px;
}

.route-stat {
  padding: 1rem;
}

.route-stat i {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.route-stat h5 {
  margin: 0.5rem 0;
  font-weight: 600;
  color: #333;
}

.route-stat small {
  color: #666;
  font-size: 0.8rem;
}

.route-steps {
  border-top: 1px solid #dee2e6;
  padding-top: 1rem;
}

.steps-list {
  max-height: 200px;
  overflow-y: auto;
}

.step-item {
  display: flex;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid #f1f1f1;
}

.step-number {
  background: #667eea;
  color: white;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: 600;
  margin-right: 1rem;
}

.step-text {
  color: #555;
  line-height: 1.4;
}

@media (max-width: 768px) {
  .map-controls .row {
    flex-direction: column;
  }
  
  .col-md-4, .col-md-5, .col-md-2 {
    margin-bottom: 1rem;
  }
  
  .map-container {
    height: 300px;
  }
  
  .route-panel .row {
    flex-direction: column;
  }
}

/* Custom marker styles */
:deep(.custom-marker) {
  background: transparent;
  border: none;
}

:deep(.custom-marker i) {
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}

/* Map popup styles */
:deep(.leaflet-popup-content) {
  margin: 8px 12px;
  font-size: 14px;
  font-weight: 500;
}

:deep(.leaflet-popup-content-wrapper) {
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* Custom Modal Styles */
.custom-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: fadeIn 0.3s ease;
}

.custom-modal {
  background: white;
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  width: 90%;
  max-width: 500px;
  animation: slideIn 0.3s ease;
}

.custom-modal-header {
  padding: 1.5rem 1.5rem 1rem;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.custom-modal-header h5 {
  color: #333;
  font-weight: 600;
}

.custom-modal-body {
  padding: 1.5rem;
}

.custom-modal-footer {
  padding: 1rem 1.5rem 1.5rem;
  border-top: 1px solid #e9ecef;
  text-align: right;
}

.route-summary {
  text-align: center;
}

.route-points {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
}

.route-point {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
  border-radius: 10px;
  min-width: 120px;
}

.route-point.origin {
  background: rgba(40, 167, 69, 0.1);
  border: 2px solid #28a745;
}

.route-point.destination {
  background: rgba(220, 53, 69, 0.1);
  border: 2px solid #dc3545;
}

.route-point i {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.point-label {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 0.25rem;
}

.point-value {
  font-weight: 600;
  color: #333;
  font-size: 1.1rem;
}

.route-arrow {
  margin: 0 1.5rem;
  font-size: 1.5rem;
  color: #007bff;
}

.route-details {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.detail-item {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.detail-label {
  font-weight: 500;
  color: #666;
  margin-right: 0.5rem;
}

.detail-value {
  font-weight: 600;
  color: #333;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideIn {
  from { 
    opacity: 0;
    transform: translateY(-20px);
  }
  to { 
    opacity: 1;
    transform: translateY(0);
  }
}
</style> 