<template>
  <div class="progress-container">
    <div class="progress-bar">
      <div 
        class="progress-fill" 
        :style="{ width: `${progress.percentage}%` }"
      ></div>
    </div>
    <div v-if="showText" class="progress-text">
      {{ progress.completed }}/{{ progress.total }} ({{ progress.percentage }}%)
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ProgressInfo } from '../types'

interface Props {
  progress: ProgressInfo
  showText?: boolean
  className?: string
}

withDefaults(defineProps<Props>(), {
  showText: false,
  className: ''
})
</script>

<style scoped>
.progress-container {
  position: relative;
  margin: 20px;
}

.progress-bar {
  position: relative;
  height: 8px;
  background: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #8BC34A;
  transition: width 0.3s ease;
  width: 0%;
}

.progress-text {
  position: absolute;
  top: 12px;
  right: 0;
  font-size: 12px;
  color: #666;
}

@media (max-width: 480px) {
  .progress-container {
    margin: 16px;
  }
}
</style>