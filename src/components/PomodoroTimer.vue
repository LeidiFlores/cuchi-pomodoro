<script setup>
import { ref, watch, onUnmounted, onMounted, computed } from 'vue'

const originalTitle = document.title;

const props = defineProps({
  initialWorkTime: {
    type: Number,
    default: 25 * 60,
  },
  initialBreakTime: {
    type: Number,
    default: 5 * 60,
  },
  soundEnabled: {
    type: Boolean,
    default: true,
  },
})

const timeLeft = ref(props.initialWorkTime)
const timerRunning = ref(false)
const timerInterval = ref(null)
const isWorkTime = ref(true) // Keep track of work/break state

const tickingBellSound = new Audio('/sound/timer-with-chime.mp3')

const clearTimer = () => {
  if (timerInterval.value !== null) {
    clearInterval(timerInterval.value)
    timerInterval.value = null
  }
}

const startTimer = () => {
  if (timerRunning.value) return

  timerRunning.value = true
  timerInterval.value = setInterval(() => {
    timeLeft.value--

    if (timeLeft.value === 11 && props.soundEnabled) {
      tickingBellSound.play()
    }

    if (timeLeft.value <= 0) {
      clearTimer()
      timerRunning.value = false
      switchTimerMode()
    }
  }, 1000)
}

const stopTimer = () => {
  clearTimer()
  timerRunning.value = false
}

const resumeTimer = () => {
  if (timeLeft.value > 0) {
    startTimer()
  }
}

const switchTimerMode = () => {
  clearTimer()
  timerRunning.value = false
  isWorkTime.value = !isWorkTime.value
  timeLeft.value = isWorkTime.value
    ? props.initialWorkTime
    : props.initialBreakTime
}

const minutes = computed(() => {
  return Math.floor(timeLeft.value / 60)
    .toString()
    .padStart(2, '0')
})

const seconds = computed(() => {
  return (timeLeft.value % 60).toString().padStart(2, '0')
})

const formattedTime = computed(() => {
  return `${minutes.value}:${seconds.value}`
})

watch([formattedTime, timerRunning], ([newTime, running]) => {
  if (running) {
    document.title =
      timeLeft.value > 0
        ? `${newTime} - ${originalTitle}`
        : `Time's up! - ${originalTitle}`
  } else {
    document.title = originalTitle
  }
})

/* 🔥 KEYBOARD SHORTCUT (FIXED) */
const handleKeydown = (e) => {
  const tag = document.activeElement.tagName

  // Don't trigger while typing
  if (tag === 'INPUT' || tag === 'TEXTAREA') return

  // ✅ FIX: prevent hold key spam
  if (e.repeat) return

  if (e.code === 'Space') {
    e.preventDefault()

    if (timerRunning.value) {
      stopTimer()
    } else {
      resumeTimer()
    }
  }
}

/* 🔥 LIFECYCLE */
onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  clearTimer()
  // Restore the original title when the component is unmounted
  document.title = originalTitle
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <div class="counter">
    <div>{{ isWorkTime ? 'Work Time' : 'Break Time' }}</div>

    <div v-if="timeLeft > 0">
      {{ minutes }}:{{ seconds }}
    </div>

    <div v-else>¡Time for a break!</div>

    <button class="button" @click="startTimer" :disabled="timerRunning">
      Start
    </button>

    <button class="button" @click="switchTimerMode">
      {{ isWorkTime ? 'Skip to Break' : 'Skip to Work' }}
    </button>

    <button class="button" @click="timerRunning ? stopTimer() : resumeTimer()">
      {{ timerRunning ? 'Stop' : 'Resume' }}
    </button>
  </div>
</template>

<style scoped>
.counter {
  font-size: 2rem;
  text-align: center;
  color: rgb(66, 66, 66);
  background-color: rgb(252, 238, 238);
  border-radius: 0.5rem;
}

.dark-mode .counter {
  color: rgb(204, 190, 190);
  background-color: rgba(0, 0, 0, 0.5);
}

.dark-mode .button {
  background-color: rgb(126, 142, 97);
}

.button:hover {
  background-color: rgb(78, 102, 58);
}
</style>