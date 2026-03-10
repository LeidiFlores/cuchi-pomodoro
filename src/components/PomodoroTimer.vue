<script setup>
import { ref, watch, onUnmounted, computed } from 'vue'

const originalTitle = document.title;
const props = defineProps({
  initialWorkTime: {
    type: Number,
    default: 25 * 60, // 25 minutes in seconds
  },
  initialBreakTime: {
    type: Number,
    default: 5 * 60, // 5 minutes in seconds
  },
  soundEnabled: {
    type: Boolean,
    default: true,
  },
})

const timeLeft = ref(props.initialWorkTime) // Start with work time
const timerRunning = ref(false)
let timerInterval
const isWorkTime = ref(true) // Keep track of work/break state

const tickingBellSound = new Audio('/sound/timer-with-chime.mp3')

const startTimer = () => {
  if (timerRunning.value) return

  timerRunning.value = true
  timerInterval = setInterval(() => {
    timeLeft.value--

    if (timeLeft.value === 11 && props.soundEnabled) {
      tickingBellSound.play()
    }

    if (timeLeft.value <= 0) {
      clearInterval(timerInterval)
      timerRunning.value = false
      switchTimerMode() // Switch between work and break time
    }
  }, 1000)
}

const stopTimer = () => {
  clearInterval(timerInterval)
  timerRunning.value = false
}

const resumeTimer = () => {
  if (timeLeft.value > 0) {
    startTimer()
  }
}

const switchTimerMode = () => {
  clearInterval(timerInterval)
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
    document.title = timeLeft.value > 0 ? `${newTime} - ${originalTitle}` : `Time's up! - ${originalTitle}`
  } else {
    document.title = originalTitle
  }
})

onUnmounted(() => {
  clearInterval(timerInterval)
  // Restore the original title when the component is unmounted
  document.title = originalTitle
})
</script>

<template>
  <div class="counter">
    <div>{{ isWorkTime ? 'Work Time' : 'Break Time' }}</div>
    <div v-if="timeLeft > 0">{{ minutes }}:{{ seconds }}</div>
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

/* dark mode */
.dark-mode .counter {
  color: rgb(204, 190, 190);
  background-color: rgba(0, 0, 0, 0.5);
  border-radius: 0.5rem;
}

/* dark mode */
.dark-mode .button {
  background-color: rgb(126, 142, 97);
}

/* hover effect */
.button:hover {
  background-color: rgb(78, 102, 58);
}

</style>
