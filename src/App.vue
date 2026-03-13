<script setup lang="ts">
import { ref } from 'vue'

interface Task {
  id: string
  text: string
  completed: boolean
  indent: number
}

const initialTasks: Task[] = [
  { id: 't1', text: 'モーニングルーティン', completed: false, indent: 0 },
  { id: 't2', text: 'コップ一杯の水を飲む', completed: false, indent: 1 },
  { id: 't3', text: 'ストレッチ（5分）', completed: false, indent: 1 },
  { id: 't4', text: '仕事の準備', completed: false, indent: 0 },
  { id: 't6', text: '今日のスケジュール確認', completed: false, indent: 1 },
]

const STORAGE_KEY = 'loop-list-tasks'

const loadTasks = (): Task[] => {
  const saved = window.localStorage.getItem(STORAGE_KEY)
  if (saved) {
    try {
      return JSON.parse(saved)
    } catch (e) {
      console.error('Failed to parse saved tasks', e)
    }
  }
  return initialTasks
}

const tasks = ref<Task[]>(loadTasks())
const isAdding = ref(false)
const newTaskText = ref('')

import { watchEffect } from 'vue'

watchEffect(() => {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks.value))
})

const uncheckAll = () => {
  tasks.value = tasks.value.map(t => ({ ...t, completed: false }))
}

const addTask = () => {
  if (!newTaskText.value.trim()) {
    isAdding.value = false
    return
  }
  const newTask: Task = {
    id: Date.now().toString(),
    text: newTaskText.value,
    completed: false,
    indent: 0
  }
  tasks.value.push(newTask)
  newTaskText.value = ''
  isAdding.value = false
}

const toggleTask = (id: string) => {
  const index = tasks.value.findIndex(t => t.id === id)
  if (index === -1) return

  const task = tasks.value[index]
  const newCompleted = !task.completed
  task.completed = newCompleted

  if (task.indent === 0) {
    // 親タスクを切り替えた場合：続く子タスクをすべて連動させる
    for (let i = index + 1; i < tasks.value.length; i++) {
      if (tasks.value[i].indent === 0) break // 次の親が来たら終了
      tasks.value[i].completed = newCompleted
    }
  } else {
    // 子タスクを切り替えた場合：親タスクの状態を更新する
    let parentIndex = -1
    for (let i = index - 1; i >= 0; i--) {
      if (tasks.value[i].indent === 0) {
        parentIndex = i
        break
      }
    }
    if (parentIndex !== -1) {
      let allChildrenCompleted = true
      for (let i = parentIndex + 1; i < tasks.value.length; i++) {
        if (tasks.value[i].indent === 0) break
        if (!tasks.value[i].completed) {
          allChildrenCompleted = false
          break
        }
      }
      tasks.value[parentIndex].completed = allChildrenCompleted
    }
  }
}
</script>

<template>
  <header class="header">
    <div class="header-content">
      <h1 class="title">Routine</h1>
      <p class="subtitle">スワイプで階層化・長押しで並び替え</p>
    </div>
    <button @click="uncheckAll" class="reset-button" aria-label="リセット">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
    </button>
  </header>

  <main class="task-list">
    <div 
      v-for="task in tasks" 
      :key="task.id" 
      class="task-item"
      :class="{ 'is-completed': task.completed, 'is-subtask': task.indent === 1 }"
    >
      <button 
        @click="toggleTask(task.id)"
        class="checkbox"
        :class="{ 'is-checked': task.completed }"
      >
        <svg v-if="task.completed" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
      </button>
      
      <span class="task-text">{{ task.text }}</span>

      <div class="drag-handle">
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="5" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="19" r="1"/></svg>
      </div>
    </div>
  </main>

  <!-- タスク追加UI -->
  <div v-if="isAdding" class="add-task-container animate-in slide-in-from-bottom-5">
    <form @submit.prevent="addTask" class="add-task-form">
      <input
        v-model="newTaskText"
        type="text"
        autoFocus
        placeholder="新しいルーティンを追加..."
        class="add-task-input"
      />
      <div class="add-task-actions">
        <button type="button" @click="isAdding = false" class="cancel-button">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
        <button 
          type="submit"
          :disabled="!newTaskText.trim()"
          class="submit-button"
        >
          追加
        </button>
      </div>
    </form>
  </div>

  <div v-if="!isAdding" class="fab-container">
    <button @click="isAdding = true" class="fab" aria-label="タスク追加">
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
    </button>
  </div>
</template>

<style scoped>
.header {
  padding: 20px 24px;
  background-color: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(8px);
  position: sticky;
  top: 0;
  z-index: 20;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title {
  font-size: 1.5rem;
  font-weight: 800;
  color: #1e293b;
  margin: 0;
  letter-spacing: -0.025em;
}

.subtitle {
  font-size: 0.75rem;
  color: #64748b;
  margin: 4px 0 0;
  font-weight: 500;
}

.reset-button {
  padding: 10px;
  background-color: #f1f5f9;
  color: #475569;
  border-radius: 9999px;
  transition: all 0.2s;
}

.reset-button:active {
  transform: scale(0.95);
  background-color: #e2e8f0;
}

.task-list {
  padding: 20px;
  flex: 1;
}

.task-item {
  display: flex;
  align-items: center;
  gap: 16px;
  background-color: white;
  padding: 16px;
  border-radius: 16px;
  margin-bottom: 12px;
  border: 1px solid #e2e8f0;
  transition: all 0.2s;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.task-item.is-subtask {
  margin-left: 40px;
}

.checkbox {
  width: 28px;
  height: 28px;
  border-radius: 9999px;
  border: 2px solid #cbd5e1;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.checkbox.is-checked {
  background-color: #10b981;
  border-color: #10b981;
  transform: scale(1.1);
}

.task-text {
  flex: 1;
  font-weight: 600;
  color: #1e293b;
  transition: all 0.3s;
}

.task-item.is-completed .task-text {
  color: #94a3b8;
  text-decoration: line-through;
}

.task-item.is-subtask .task-text {
  font-size: 0.9375rem;
  font-weight: 500;
}

.drag-handle {
  color: #cbd5e1;
  padding: 4px;
}

.add-task-container {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: white;
  padding: 20px;
  border-top: 1px solid #e2e8f0;
  box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.1);
  z-index: 30;
}

.add-task-form {
  display: flex;
  gap: 12px;
}

.add-task-input {
  flex: 1;
  background-color: #f1f5f9;
  border: 2px solid transparent;
  border-radius: 12px;
  padding: 12px 16px;
  font-size: 1rem;
  color: #1e293b;
  transition: all 0.2s;
  outline: none;
}

.add-task-input:focus {
  background-color: white;
  border-color: #6366f1;
  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
}

.add-task-actions {
  display: flex;
  gap: 8px;
}

.cancel-button {
  padding: 12px;
  color: #94a3b8;
  background-color: #f8fafc;
  border-radius: 12px;
}

.submit-button {
  padding: 0 20px;
  background-color: #4f46e5;
  color: white;
  border-radius: 12px;
  font-weight: 600;
  transition: all 0.2s;
}

.submit-button:disabled {
  opacity: 0.5;
}

.submit-button:not(:disabled):active {
  transform: scale(0.95);
}

.fab-container {
  position: fixed;
  bottom: 32px;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 500px;
  display: flex;
  justify-content: flex-end;
  padding: 0 32px;
  pointer-events: none;
}

.fab {
  width: 56px;
  height: 56px;
  background-color: #4f46e5;
  color: white;
  border-radius: 9999px;
  box-shadow: 0 10px 15px -3px rgba(79, 70, 229, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: auto;
  transition: all 0.2s;
}

.fab:active {
  transform: scale(0.95);
  background-color: #4338ca;
}
</style>
