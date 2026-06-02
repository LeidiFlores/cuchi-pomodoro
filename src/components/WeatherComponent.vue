<template>
  <div class="weather-widget">
    <h2>Weather in {{ city }}</h2>
    <div class="weather-controls">
      <select
        v-model="selectedCity"
        class="weather-select"
        aria-label="Weather city"
        @change="updateCity"
      >
        <option v-for="option in cityOptions" :key="option.city" :value="option.city">
          {{ option.city }} ({{ option.gmt }})
        </option>
      </select>
    </div>
    <!-- Loading spinner -->
    <div v-if="loading" class="loading-spinner">
      <div class="spinner"></div>
      <p>Loading weather...</p>
    </div>
    <!-- Error message -->
    <div v-else-if="error" class="error-message">
      <p>{{ error }}</p>
    </div>
    <!-- Weather data -->
    <div v-else-if="weatherData" class="weather-content">
      <div class="weather-details">
        <p>Temperature: {{ weatherData.main.temp }}°C</p>
        <p>Condition: {{ weatherData.weather[0].description }}</p>
        <p>Humidity: {{ weatherData.main.humidity }}%</p>
        <p>Wind Speed: {{ weatherData.wind.speed }} m/s</p>
        <p>GMT: {{ selectedGmt }}</p>
      </div>
      <div class="weather-icon-frame">
        <img
          class="weather-icon"
          :src="`https://openweathermap.org/img/wn/${weatherData.weather[0].icon}.png`"
          :alt="weatherData.weather[0].description"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const cityOptions = [
  { city: 'Boston', gmt: 'GMT-05:00' },
  { city: 'Mexico City', gmt: 'GMT-06:00' },
  { city: 'Monterrey', gmt: 'GMT-06:00' },
  { city: 'Guadalajara', gmt: 'GMT-06:00' },
  { city: 'Caracas', gmt: 'GMT-04:00' },
  { city: 'Lima', gmt: 'GMT-05:00' },
  { city: 'Santiago', gmt: 'GMT-03:00' },
  { city: 'Buenos Aires', gmt: 'GMT-03:00' },
  { city: 'Sao Paulo', gmt: 'GMT-03:00' },
  { city: 'Cape Town', gmt: 'GMT+02:00' },
  { city: 'Miami', gmt: 'GMT-05:00' },
  { city: 'New York', gmt: 'GMT-05:00' },
  { city: 'Los Angeles', gmt: 'GMT-08:00' },
  { city: 'London', gmt: 'GMT+00:00' },
  { city: 'Madrid', gmt: 'GMT+01:00' },
  { city: 'Tokyo', gmt: 'GMT+09:00' },
]

const savedCity = localStorage.getItem('weatherCity')
const defaultCity = cityOptions.some((option) => option.city === savedCity) ? savedCity : 'Boston'
const defaultGmt = cityOptions.find((option) => option.city === defaultCity)?.gmt || 'GMT-05:00'

const apiKey = import.meta.env.VITE_WEATHER_API_KEY
const city = ref(defaultCity)
const selectedCity = ref(defaultCity)
const selectedGmt = ref(defaultGmt)
const weatherData = ref(null)
const loading = ref(true)
const error = ref(null)

async function fetchWeather() {
  loading.value = true
  error.value = null
  weatherData.value = null

  if (!apiKey) {
    error.value = 'Weather API key is missing. Please check your environment variables.'
    loading.value = false
    return
  }

  const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city.value)}&appid=${apiKey}&units=metric`
  try {
    const response = await fetch(apiUrl)
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Invalid API key.')
      } else if (response.status === 404) {
        throw new Error('City not found. Please check the city name.')
      } else {
        throw new Error(`Weather service unavailable (${response.status}). Please try again later.`)
      }
    }
    weatherData.value = await response.json()
  } catch (err) {
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      error.value = 'Network error. Please check your internet connection and try again.'
    } else {
      error.value = err.message
    }
  } finally {
    loading.value = false
  }
}

function updateCity() {
  const nextCity = selectedCity.value
  const nextGmt = cityOptions.find((option) => option.city === nextCity)?.gmt || selectedGmt.value

  city.value = nextCity
  selectedGmt.value = nextGmt
  localStorage.setItem('weatherCity', city.value)
  fetchWeather()
}

onMounted(fetchWeather)
</script>

<style scoped>
.weather-widget {
  font-family: 'Arial', sans-serif;
  background-color: rgba(30, 30, 30, 1);
  position: absolute;
  bottom: 90px;
  left: 20px;
  width: min(90vw, 240px);
  max-width: 240px;
  border-radius: 15px;
  padding: 10px;
  font-size: 12px;
  color: #dfdfdf;
  text-align: left;
}
h2 {
  margin-bottom: 10px;
  color: #4e663a;
}
.weather-controls {
  display: flex;
  gap: 6px;
  margin-bottom: 10px;
}
.weather-select {
  min-width: 0;
  flex: 1;
  border: 1px solid #4e663a;
  border-radius: 6px;
  padding: 6px 8px;
  font-family: inherit;
  font-size: 12px;
  color: #dfdfdf;
  background-color: rgba(255, 255, 255, 0.08);
}
.weather-select:focus {
  outline: 2px solid #789679;
  outline-offset: 1px;
}
p {
  margin: 5px 0;
}
.weather-content {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
}
.weather-details {
  min-width: 0;
  flex: 1;
}
.weather-icon-frame {
  display: flex;
  flex: 0 0 48px;
  align-items: center;
  justify-content: center;
}
.weather-icon {
  width: 40px;
  height: 40px;
  display: block;
}

.loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.spinner {
  width: 30px;
  height: 30px;
  border: 3px solid #4e663a;
  border-top: 3px solid transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-message {
  color: #ff6b6b;
  text-align: center;
  padding: 10px;
  background-color: rgba(255, 107, 107, 0.1);
  border-radius: 5px;
  border: 1px solid #ff6b6b;
}

@media (max-width: 768px) {
  .weather-widget {
    position: static;
    width: 100%;
    max-width: 100%;
    margin: 1rem 0 0;
    bottom: auto;
    left: auto;
  }
  .weather-controls {
    flex-wrap: wrap;
  }
}
</style>
