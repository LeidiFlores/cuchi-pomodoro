<template>
  <div class="weather-widget">
    <h2>Weather in {{ city }}</h2>
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
    <div v-else-if="weatherData">
      <img
        class="weather-icon"
        :src="`http://openweathermap.org/img/wn/${weatherData.weather[0].icon}.png`"
        :alt="weatherData.weather[0].description"
      />
      <p>Temperature: {{ weatherData.main.temp }}°C</p>
      <p>Condition: {{ weatherData.weather[0].description }}</p>
      <p>Humidity: {{ weatherData.main.humidity }}%</p>
      <p>Wind Speed: {{ weatherData.wind.speed }} m/s</p>
      <input
  type="text"
  value={city}
  onChange={(e) => {
    setCity(e.target.value);
    localStorage.setItem("weatherCity", e.target.value);
  }}
  placeholder="Enter city"
/>
    </div>
    
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const apiKey = import.meta.env.VITE_WEATHER_API_KEY
const city = ref('Boston')
const weatherData = ref(null)
const loading = ref(true)
const error = ref(null)
const [city, setCity] = useState(
  localStorage.getItem("weatherCity") || "Boston"
);
async function fetchWeather() {
  if (!apiKey) {
    error.value = 'Weather API key is missing. Please check your environment variables.'
    loading.value = false
    return
  }

  const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city.value}&appid=${apiKey}&units=metric`
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
p {
  margin: 5px 0;
}
.weather-icon {
  width: 40px;
  height: 40px;
  display: flex;
  position: absolute;
  right: 5px;
  bottom: 110px;
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

  .weather-icon {
    position: static;
    float: right;
    margin: 0 0 0 0.75rem;
  }
}
</style>
