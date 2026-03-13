<script setup lang="ts">
import { ref, computed, watchEffect } from 'vue'
import type { Task } from './types'
import TaskItem from './components/TaskItem.vue'

const initialTasks: Task[] = [
  { id: 't1', text: 'モーニングルーティン', completed: false, indent: 0 },
  { id: 't2', text: 'コップ一杯の水を飲む', completed: false, indent: 1 },
  { id: 't3', text: 'ストレッチ（5分）', completed: false, indent: 1 },
  { id: 't4', text: '仕事の準備', completed: false, indent: 0 },
  { id: 't5', text: 'PCを起動する', completed: false, indent: 1 },
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

const progress = computed(() => {
  if (tasks.value.length === 0) return 0
  const completed = tasks.value.filter(t => t.completed).length
  return Math.round((completed / tasks.value.length) * 100)
})

const progressText = computed(() => {
  const completed = tasks.value.filter(t => t.completed).length
  return `${completed}/${tasks.value.length}`
})

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

const deleteTask = (id: string) => {
  tasks.value = tasks.value.filter(t => t.id !== id)
}

const handleIndent = (id: string, newIndent: number) => {
  const index = tasks.value.findIndex(t => t.id === id)
  if (index === -1) return
  
  // 最初の項目はサブタスクにできない（バリデーションは別タスクだが、ロジックとして含めておく）
  if (index === 0 && newIndent === 1) return
  
  tasks.value[index].indent = newIndent
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
      <div class="progress-container">
        <div class="progress-bar-bg">
          <div class="progress-bar-fill" :style="{ width: `${progress}%` }"></div>
        </div>
        <span class="progress-text">{{ progressText }}</span>
      </div>
    </div>
    <button @click="uncheckAll" class="reset-button" aria-label="全てのチェックを解除して最初からやり直す">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
    </button>
  </header>

  <main class="task-list">
    <TaskItem 
      v-for="task in tasks" 
      :key="task.id" 
      :task="task"
      @toggle="toggleTask"
      @delete="deleteTask"
      @indent="handleIndent"
    />
    
    <div v-if="tasks.length === 0" class="empty-state">
      <p>タスクがありません。右下の + ボタンから追加してください。</p>
    </div>
  </main>

  <div v-if="isAdding" class="add-task-container">
    <div class="add-task-overlay" @click="isAdding = false"></div>
    <form @submit.prevent="addTask" class="add-task-form">
      <input
        v-model="newTaskText"
        type="text"
        autoFocus
        placeholder="新しいルーティンを追加..."
        class="add-task-input"
        aria-label="新しいタスク名"
      />
      <div class="add-task-actions">
        <button type="button" @click="isAdding = false" class="cancel-button">キャンセル</button>
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
    <button @click="isAdding = true" class="fab" aria-label="新しいタスクを追加">
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
    </button>
  </div>
</template>

<style scoped>
.header {
  padding: 24px;
  background-color: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(12px);
  position: sticky;
  top: 0;
  z-index: 20;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-content {
  flex: 1;
}

.title {
  font-size: 1.75rem;
  font-weight: 900;
  color: #0f172a;
  margin: 0;
  letter-spacing: -0.04em;
}

.progress-container {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 8px;
}

.progress-bar-bg {
  flex: 1;
  height: 8px;
  background-color: #e2e8f0;
  border-radius: 9999px;
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  background-color: #4f46e5;
  border-radius: 9999px;
  transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.progress-text {
  font-size: 0.8125rem;
  font-weight: 700;
  color: #64748b;
  min-width: 40px;
  text-align: right;
}

.reset-button {
  padding: 12px;
  background-color: #f1f5f9;
  color: #475569;
  border-radius: 16px;
  transition: all 0.2s;
  margin-left: 16px;
}

.reset-button:active {
  transform: rotate(-30deg) scale(0.9);
  background-color: #e2e8f0;
}

.task-list {
  padding: 20px;
  flex: 1;
  padding-bottom: 120px;
}

.empty-state {
  text-align: center;
  color: #94a3b8;
  margin-top: 60px;
  padding: 0 40px;
  font-weight: 500;
}

.add-task-container {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}

.add-task-overlay {
  position: absolute;
  inset: 0;
  background-color: rgba(15, 23, 42, 0.4);
  backdrop-filter: blur(4px);
}

.add-task-form {
  position: relative;
  background-color: white;
  padding: 24px;
  border-top-left-radius: 32px;
  border-top-right-radius: 32px;
  box-shadow: 0 -20px 25px -5px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  gap: 20px;
  animation: slide-up 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes slide-up {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}

.add-task-input {
  width: 100%;
  background-color: #f1f5f9;
  border: 2px solid transparent;
  border-radius: 16px;
  padding: 16px 20px;
  font-size: 1.125rem;
  font-weight: 600;
  color: #1e293b;
  transition: all 0.2s;
  outline: none;
}

.add-task-input:focus {
  background-color: white;
  border-color: #4f46e5;
  box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.1);
}

.add-task-actions {
  display: flex;
  gap: 12px;
}

.cancel-button {
  flex: 1;
  padding: 16px;
  color: #64748b;
  background-color: #f8fafc;
  border-radius: 16px;
  font-weight: 700;
}

.submit-button {
  flex: 2;
  padding: 16px;
  background-color: #4f46e5;
  color: white;
  border-radius: 16px;
  font-weight: 700;
  transition: all 0.2s;
  box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.3);
}

.submit-button:disabled {
  opacity: 0.5;
  box-shadow: none;
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
  width: 64px;
  height: 64px;
  background-color: #4f46e5;
  color: white;
  border-radius: 20px;
  box-shadow: 0 20px 25px -5px rgba(79, 70, 229, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: auto;
  transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.fab:active {
  transform: scale(0.9) rotate(90deg);
}
</style>
