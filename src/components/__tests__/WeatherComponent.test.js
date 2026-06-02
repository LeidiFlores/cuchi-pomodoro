import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, cleanup, fireEvent, waitFor } from '@testing-library/vue'
import WeatherComponent from '../WeatherComponent.vue'

const weatherResponse = {
  weather: [{ icon: '01d', description: 'clear sky' }],
  main: { temp: 22, humidity: 45 },
  wind: { speed: 3 },
}

describe('WeatherComponent', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.stubEnv('VITE_WEATHER_API_KEY', 'test-api-key')
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(weatherResponse),
      }),
    )
  })

  afterEach(() => {
    cleanup()
    vi.unstubAllEnvs()
    vi.restoreAllMocks()
    localStorage.clear()
  })

  it('fetches Boston weather by default', async () => {
    render(WeatherComponent)

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        'https://api.openweathermap.org/data/2.5/weather?q=Boston&appid=test-api-key&units=metric',
      )
    })

    expect(screen.getByText('Weather in Boston')).toBeDefined()
  })

  it('initializes the city from localStorage', async () => {
    localStorage.setItem('weatherCity', 'Monterrey')

    render(WeatherComponent)

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        'https://api.openweathermap.org/data/2.5/weather?q=Monterrey&appid=test-api-key&units=metric',
      )
    })

    expect(screen.getByLabelText('Weather city').value).toBe('Monterrey')
  })

  it('saves and fetches weather for the selected city', async () => {
    render(WeatherComponent)

    await fireEvent.update(screen.getByLabelText('Weather city'), 'Mexico City')

    await waitFor(() => {
      expect(fetch).toHaveBeenLastCalledWith(
        'https://api.openweathermap.org/data/2.5/weather?q=Mexico%20City&appid=test-api-key&units=metric',
      )
    })

    expect(localStorage.getItem('weatherCity')).toBe('Mexico City')
    expect(screen.getByText('Weather in Mexico City')).toBeDefined()
    expect(screen.getByText('GMT: GMT-06:00')).toBeDefined()
  })

  it('shows GMT in the city selector options', () => {
    render(WeatherComponent)

    expect(screen.getByRole('option', { name: 'Boston (GMT-05:00)' })).toBeDefined()
    expect(screen.getByRole('option', { name: 'Mexico City (GMT-06:00)' })).toBeDefined()
  })
})
