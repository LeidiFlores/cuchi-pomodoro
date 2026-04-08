import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/vue'
import { nextTick } from 'vue'
import PomodoroTimer from '../PomodoroTimer.vue'

describe('PomodoroTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    cleanup()
    vi.useRealTimers()
  })

  it('should render the component correctly', () => {
    render(PomodoroTimer, {
      props: { initialWorkTime: 1500, initialBreakTime: 300 },
    })

    expect(screen.getByText('Work Time')).toBeDefined()
    expect(screen.getByText('25:00')).toBeDefined()
    expect(screen.getByRole('button', { name: /Start/i })).toBeDefined()
  })

  it('should count down when started', async () => {
    render(PomodoroTimer, {
      props: { initialWorkTime: 10, initialBreakTime: 5 },
    })

    fireEvent.click(screen.getByRole('button', { name: /Start/i }))
    await vi.advanceTimersByTimeAsync(3000)

    expect(screen.getByText('00:07')).toBeDefined()
  })

  it('should stop counting when Stop is clicked', async () => {
    render(PomodoroTimer, {
      props: { initialWorkTime: 10, initialBreakTime: 5 },
    })

    fireEvent.click(screen.getByRole('button', { name: /Start/i }))
    await vi.advanceTimersByTimeAsync(3000)
    fireEvent.click(screen.getByRole('button', { name: /Stop/i }))
    await vi.advanceTimersByTimeAsync(3000)

    // Time should still be at 7 — not continuing to count down
    expect(screen.getByText('00:07')).toBeDefined()
  })

  it('should only decrement by 1 per second after multiple Skip clicks (no memory leak)', async () => {
    render(PomodoroTimer, {
      props: { initialWorkTime: 60, initialBreakTime: 30 },
    })

    // Start → Skip → Start → Skip → Start (simulate rapid mode switching)
    fireEvent.click(screen.getByRole('button', { name: /Start/i }))
    fireEvent.click(screen.getByRole('button', { name: /Skip/i }))
    await nextTick()
    fireEvent.click(screen.getByRole('button', { name: /Start/i }))
    fireEvent.click(screen.getByRole('button', { name: /Skip/i }))
    await nextTick()
    fireEvent.click(screen.getByRole('button', { name: /Start/i }))

    // Advance exactly 3 seconds — timer should be at 00:57, not faster
    await vi.advanceTimersByTimeAsync(3000)

    // If there were 2 stacked intervals, it would show 00:54 or less
    expect(screen.getByText('00:57')).toBeDefined()
  })

  it('should switch to Break Time when timer reaches zero', async () => {
    render(PomodoroTimer, {
      props: { initialWorkTime: 2, initialBreakTime: 5 },
    })

    fireEvent.click(screen.getByRole('button', { name: /Start/i }))
    await vi.advanceTimersByTimeAsync(3000)

    expect(screen.getByText('Break Time')).toBeDefined()
  })

  it('should reset timer correctly when Skip is clicked', async () => {
    render(PomodoroTimer, {
      props: { initialWorkTime: 60, initialBreakTime: 30 },
    })

    fireEvent.click(screen.getByRole('button', { name: /Start/i }))
    await vi.advanceTimersByTimeAsync(5000)
    fireEvent.click(screen.getByRole('button', { name: /Skip/i }))
    await nextTick()

    // Should now show break time (00:30), not the work time mid-countdown
    expect(screen.getByText('00:30')).toBeDefined()
    expect(screen.getByText('Break Time')).toBeDefined()
  })
})
