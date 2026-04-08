<template>
  <div class="weather-widget">
    <h2>Weather in {{ city }}</h2>
    <img
      v-if="weatherData && !loading"
      class="weather-icon"
      :src="`http://openweathermap.org/img/wn/${weatherData.weather[0].icon}.png`"
      :alt="weatherData.weather[0].description"
    />
    <p v-if="loading">Fetching weather...</p>
    <div v-if="weatherData && !loading">
      <p>Temperature: {{ weatherData.main.temp }}°C</p>
      <p>Condition: {{ weatherData.weather[0].description }}</p>
      <p>Humidity: {{ weatherData.main.humidity }}%</p>
      <p>Wind Speed: {{ weatherData.wind.speed }} m/s</p>
    </div>
    <p v-if="error">{{ error }}</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const apiKey = import.meta.env.VITE_WEATHER_API_KEY
const city = ref('Boston')
const weatherData = ref(null)
const loading = ref(true)
const error = ref(null)

async function fetchWeather() {
  const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city.value}&appid=${apiKey}&units=metric`
  try {
    const response = await fetch(apiUrl)
    if (!response.ok) throw new Error('Failed to fetch weather data.')
    weatherData.value = await response.json()
  } catch (err) {
    error.value = err.message
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
  width: 200px;
  height: 150px;
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
</style>
