<script setup lang="ts">
import type { Task } from '../types'

const props = defineProps<{
  task: Task
}>()

const emit = defineEmits<{
  (e: 'toggle', id: string): void
  (e: 'delete', id: string): void
}>()
</script>

<template>
  <div 
    class="task-item"
    :class="{ 'is-completed': task.completed, 'is-subtask': task.indent === 1 }"
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
</template>

<style scoped>
.task-item {
  display: flex;
  align-items: center;
  gap: 16px;
  background-color: white;
  padding: 18px;
  border-radius: 20px;
  margin-bottom: 14px;
  border: 1px solid #e2e8f0;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  position: relative;
}

.task-item:hover {
  border-color: #cbd5e1;
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.task-item.is-subtask {
  margin-left: 2.5rem;
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

.task-item.is-completed .task-text {
  color: #94a3b8;
  text-decoration: line-through;
  font-weight: 500;
}

.task-item.is-subtask .task-text {
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
