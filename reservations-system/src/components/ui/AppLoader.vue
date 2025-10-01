<template>
  <div
    v-if="loading"
    class="loader-container"
    :class="[containerClass, { 'fixed inset-0 bg-white/90 backdrop-blur-sm': overlay }]"
  >
    <div class="flex flex-col items-center justify-center h-full">
      <div
        class="loader"
        :class="{
          'w-8 h-8 border-2': props.size === 'small',
          'w-12 h-12 border-3': props.size === 'medium',
          'w-16 h-16 border-4': props.size === 'large',
          [variantClass]: true,
        }"
      ></div>
      <p v-if="text" class="loader-text mt-4" :class="textClass">
        {{ text }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface LoaderProps {
  loading?: boolean
  size?: 'small' | 'medium' | 'large'
  variant?: 'spinner' | 'dots' | 'pulse'
  overlay?: boolean
  text?: string
  containerClass?: string
  textClass?: string
}

const props = withDefaults(defineProps<LoaderProps>(), {
  loading: true,
  size: 'medium',
  variant: 'spinner',
  overlay: false,
  text: '',
  containerClass: '',
  textClass: 'text-gray-600 text-sm',
})

const variantClass = computed(() => {
  return `loader-${props.variant}`
})
</script>

<style scoped>
.loader-container {
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.fixed {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.loader-spinner {
  border-color: #e5e7eb;
  border-top-color: #440099;
  border-radius: 50%;
  border-width: 3px;
  animation: spin 0.8s linear infinite;
}

.loader-dots {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.loader-dots::before,
.loader-dots::after {
  content: '';
  width: 12px;
  height: 12px;
  background-color: #440099;
  border-radius: 50%;
  animation: dotPulse 1.4s infinite ease-in-out;
}

.loader-dots::before {
  animation-delay: -0.32s;
}

.loader-dots::after {
  animation-delay: 0s;
}

/* Middle dot */
.loader-dots {
  width: 12px;
  height: 12px;
  background-color: #440099;
  border-radius: 50%;
  animation: dotPulse 1.4s infinite ease-in-out;
  animation-delay: -0.16s;
}

.loader-pulse {
  background-color: #440099;
  border-radius: 50%;
  animation: pulse 1.5s ease-in-out infinite;
}

/* Animations */
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@keyframes dotPulse {
  0%,
  80%,
  100% {
    transform: scale(0);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(0.85);
    opacity: 0.5;
  }
}

.loader-dots.w-8 {
  width: 8px;
  height: 8px;
}

.loader-dots.w-8::before,
.loader-dots.w-8::after {
  width: 8px;
  height: 8px;
}

.loader-dots.w-12 {
  width: 12px;
  height: 12px;
}

.loader-dots.w-12::before,
.loader-dots.w-12::after {
  width: 12px;
  height: 12px;
}

.loader-dots.w-16 {
  width: 16px;
  height: 16px;
}

.loader-dots.w-16::before,
.loader-dots.w-16::after {
  width: 16px;
  height: 16px;
}
</style>
