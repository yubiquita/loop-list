<script setup lang="ts">
import { ref } from 'vue'
import type { Task } from '../types'

const props = defineProps<{
  task: Task
}>()

const emit = defineEmits<{
  (e: 'toggle', id: string): void
  (e: 'delete', id: string): void
  (e: 'indent', id: string, newIndent: number): void
}>()

const swipeOffset = ref(0)
const startX = ref(0)
const startY = ref(0)
const isSwiping = ref(false)

const handleTouchStart = (e: TouchEvent) => {
  startX.value = e.touches[0].clientX
  startY.value = e.touches[0].clientY
  isSwiping.value = true
}

const handleTouchMove = (e: TouchEvent) => {
  if (!isSwiping.value) return
  
  const currentX = e.touches[0].clientX
  const currentY = e.touches[0].clientY
  const diffX = currentX - startX.value
  const diffY = currentY - startY.value

  if (Math.abs(diffY) > Math.abs(diffX) && Math.abs(diffY) > 10) {
    isSwiping.value = false
    swipeOffset.value = 0
    return
  }

  if (props.task.indent === 0 && diffX > 0) {
    swipeOffset.value = Math.min(diffX, 100)
  } else if (props.task.indent === 1 && diffX < 0) {
    swipeOffset.value = Math.max(diffX, -100)
  } else {
    swipeOffset.value = 0
  }
}

const handleTouchEnd = () => {
  if (!isSwiping.value) return
  isSwiping.value = false
  
  if (swipeOffset.value > 60 && props.task.indent === 0) {
    emit('indent', props.task.id, 1)
  } else if (swipeOffset.value < -60 && props.task.indent === 1) {
    emit('indent', props.task.id, 0)
  }
  
  swipeOffset.value = 0
}
</script>

<template>
  <div class="task-item-wrapper" :style="{ marginLeft: task.indent === 1 ? '2.5rem' : '0' }">
    <!-- スワイプ時の背景フィードバック (右スワイプ: インデント) -->
    <div 
      class="swipe-background indent-bg"
      :class="{ 'is-visible': swipeOffset > 0 }"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 6 15 12 9 18"></polyline><line x1="21" y1="12" x2="15" y2="12"></line><line x1="3" y1="6" x2="3" y2="18"></line></svg>
      <span class="swipe-text">サブタスク</span>
    </div>

    <!-- スワイプ時の背景フィードバック (左スワイプ: インデント解除) -->
    <div 
      class="swipe-background outdent-bg"
      :class="{ 'is-visible': swipeOffset < 0 }"
    >
      <span class="swipe-text">メイン</span>
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 6 9 12 15 18"></polyline><line x1="3" y1="12" x2="9" y2="12"></line><line x1="21" y1="6" x2="21" y2="18"></line></svg>
    </div>

    <div 
      class="task-item"
      :class="{ 'is-completed': task.completed, 'is-subtask': task.indent === 1 }"
      :style="{ transform: `translateX(${swipeOffset}px)` }"
      @touchstart="handleTouchStart"
      @touchmove="handleTouchMove"
      @touchend="handleTouchEnd"
      @touchcancel="handleTouchEnd"
    >
      <button 
        @click="emit('toggle', task.id)"
        class="checkbox"
        :class="{ 'is-checked': task.completed }"
        :aria-label="task.completed ? '未完了にする' : '完了にする'"
      >
        <svg v-if="task.completed" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
      </button>
      
      <span class="task-text">{{ task.text }}</span>

      <button @click="emit('delete', task.id)" class="delete-button" aria-label="削除">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
      </button>

      <div class="drag-handle" aria-hidden="true">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="5" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="19" r="1"/></svg>
      </div>
    </div>
  </div>
</template>

<style scoped>
.task-item-wrapper {
  margin-bottom: 14px;
  position: relative;
  transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.swipe-background {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  padding: 0 16px;
  border-radius: 20px;
  opacity: 0;
  transition: opacity 0.2s;
  z-index: 0;
}

.swipe-background.is-visible {
  opacity: 1;
}

.indent-bg {
  background-color: #eef2ff;
  color: #4f46e5;
  border: 1px solid #e0e7ff;
}

.outdent-bg {
  background-color: #fff7ed;
  color: #ea580c;
  justify-content: flex-end;
  border: 1px solid #ffedd5;
}

.swipe-text {
  font-size: 0.75rem;
  font-weight: 800;
  margin: 0 8px;
  letter-spacing: -0.02em;
}

.task-item {
  display: flex;
  align-items: center;
  gap: 16px;
  background-color: white;
  padding: 18px;
  border-radius: 20px;
  border: 1px solid #e2e8f0;
  transition: border-color 0.3s, transform 0.1s;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  position: relative;
  z-index: 10;
  touch-action: pan-y;
}

.task-item:hover {
  border-color: #cbd5e1;
}

.task-item.is-subtask {
  background-color: #fcfdfe;
}

.checkbox {
  width: 32px;
  height: 32px;
  border-radius: 12px;
  border: 2.5px solid #cbd5e1;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  flex-shrink: 0;
}

.checkbox.is-checked {
  background-color: #10b981;
  border-color: #10b981;
  transform: scale(1.05);
}

.task-text {
  flex: 1;
  font-weight: 700;
  color: #1e293b;
  font-size: 1.05rem;
  transition: all 0.3s;
  user-select: none;
}

.is-completed .task-text {
  color: #94a3b8;
  text-decoration: line-through;
  font-weight: 500;
}

.is-subtask .task-text {
  font-size: 0.95rem;
  font-weight: 600;
}

.delete-button {
  padding: 8px;
  color: #cbd5e1;
  transition: all 0.2s;
  opacity: 0;
  flex-shrink: 0;
}

.task-item:hover .delete-button {
  opacity: 1;
}

.delete-button:hover {
  color: #ef4444;
}

.drag-handle {
  color: #cbd5e1;
  padding: 4px;
  flex-shrink: 0;
}
</style>
