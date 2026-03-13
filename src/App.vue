<script setup lang="ts">
import { ref, computed, watchEffect, onUnmounted } from 'vue'
import type { Task } from './types'
import TaskItem from './components/TaskItem.vue'
import { useStorage } from './composables/useStorage'

const { state, activeList, createList, deleteList, renameList, reorderLists } = useStorage()

const tasks = computed({
  get: () => activeList.value.tasks,
  set: (newTasks) => {
    activeList.value.tasks = newTasks
  }
})

const isAdding = ref(false)
const isListSelectorOpen = ref(false)
const isManagingLists = ref(false)
const editingListId = ref<string | null>(null)
const editingListName = ref('')

const newTaskText = ref('')
const draggingId = ref<string | null>(null)
const dropTargetIndex = ref<number | null>(null)

const progress = computed(() => {
  if (tasks.value.length === 0) return 0
  const completed = tasks.value.filter(t => t.completed).length
  return Math.round((completed / tasks.value.length) * 100)
})

const progressText = computed(() => {
  const completed = tasks.value.filter(t => t.completed).length
  return `${completed}/${tasks.value.length}`
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
  tasks.value = [...tasks.value, newTask]
  newTaskText.value = ''
  isAdding.value = false
}

const deleteTaskItem = (id: string) => {
  tasks.value = tasks.value.filter(t => t.id !== id)
}

const handleIndent = (id: string, newIndent: number) => {
  const index = tasks.value.findIndex(t => t.id === id)
  if (index === -1) return
  if (index === 0 && newIndent === 1) return
  
  const newTasks = [...tasks.value]
  newTasks[index] = { ...newTasks[index], indent: newIndent }
  tasks.value = newTasks
}

const toggleTask = (id: string) => {
  const index = tasks.value.findIndex(t => t.id === id)
  if (index === -1) return

  const newTasks = JSON.parse(JSON.stringify(tasks.value))
  const task = newTasks[index]
  const newCompleted = !task.completed
  task.completed = newCompleted

  if (task.indent === 0) {
    for (let i = index + 1; i < newTasks.length; i++) {
      if (newTasks[i].indent === 0) break
      newTasks[i].completed = newCompleted
    }
  } else {
    let parentIndex = -1
    for (let i = index - 1; i >= 0; i--) {
      if (newTasks[i].indent === 0) {
        parentIndex = i
        break
      }
    }
    if (parentIndex !== -1) {
      let allChildrenCompleted = true
      for (let i = parentIndex + 1; i < newTasks.length; i++) {
        if (newTasks[i].indent === 0) break
        if (!newTasks[i].completed) {
          allChildrenCompleted = false
          break
        }
      }
      newTasks[parentIndex].completed = allChildrenCompleted
    }
  }
  tasks.value = newTasks
}

const selectList = (id: string) => {
  if (isManagingLists.value) return
  state.value.activeListId = id
  isListSelectorOpen.value = false
}

const handleCreateList = () => {
  createList()
  isListSelectorOpen.value = false
}

const toggleManageLists = () => {
  isManagingLists.value = !isManagingLists.value
  editingListId.value = null
}

const startEditingList = (id: string, currentName: string) => {
  editingListId.value = id
  editingListName.value = currentName
}

const saveListName = (id: string) => {
  if (editingListName.value.trim()) {
    renameList(id, editingListName.value.trim())
  }
  editingListId.value = null
}

const handleDeleteList = (id: string) => {
  if (confirm('このリストを削除してもよろしいですか？')) {
    deleteList(id)
  }
}

// ---------------------------------------------------------
// ドラッグ＆ドロップの実装（タスク用）
// ---------------------------------------------------------

const getGroupRange = (tasksArray: Task[], idx: number) => {
  let start = idx
  while (start > 0 && tasksArray[start].indent === 1) {
    start--
  }
  let end = start
  for (let i = start + 1; i < tasksArray.length; i++) {
    if (tasksArray[i].indent === 1) end = i
    else break
  }
  return { start, end }
}

const handleDragStart = (id: string) => {
  draggingId.value = id
  document.body.style.overflow = 'hidden'
  document.body.style.overscrollBehaviorY = 'contain'
  window.addEventListener('pointermove', handlePointerMove, { passive: false })
  window.addEventListener('pointerup', handlePointerUp)
  window.addEventListener('pointercancel', handlePointerUp)
}

const handlePointerUp = () => {
  if (draggingId.value !== null && dropTargetIndex.value !== null) {
    performSort(draggingId.value, dropTargetIndex.value)
  }
  
  draggingId.value = null
  dropTargetIndex.value = null
  document.body.style.overflow = ''
  document.body.style.overscrollBehaviorY = ''
  window.removeEventListener('pointermove', handlePointerMove)
  window.removeEventListener('pointerup', handlePointerUp)
  window.removeEventListener('pointercancel', handlePointerUp)
}

const handlePointerMove = (e: PointerEvent) => {
  if (!draggingId.value) return
  e.preventDefault()
  
  const fromIdx = tasks.value.findIndex(t => t.id === draggingId.value)
  if (fromIdx === -1) return
  
  const isParentDragging = tasks.value[fromIdx].indent === 0
  const group = isParentDragging ? getGroupRange(tasks.value, fromIdx) : { start: fromIdx, end: fromIdx }

  const elements = document.elementsFromPoint(e.clientX, e.clientY)
  const row = elements.find(el => el.hasAttribute('data-task-id'))
  
  if (row) {
    const hoverId = row.getAttribute('data-task-id')
    const hoverIdx = tasks.value.findIndex(t => t.id === hoverId)
    if (hoverIdx === -1) return

    const rect = row.getBoundingClientRect()
    const mid = rect.top + rect.height / 2
    let targetIdx = e.clientY < mid ? hoverIdx : hoverIdx + 1
    
    if (targetIdx >= group.start && targetIdx <= group.end + 1) {
      dropTargetIndex.value = null
      return
    }

    if (isParentDragging) {
      if (targetIdx < tasks.value.length && tasks.value[targetIdx].indent === 1) {
        const hoverGroup = getGroupRange(tasks.value, targetIdx)
        targetIdx = fromIdx < hoverIdx ? hoverGroup.end + 1 : hoverGroup.start
      }
    }

    dropTargetIndex.value = targetIdx
  } else {
    const listRect = document.querySelector('.task-list')?.getBoundingClientRect()
    if (listRect) {
      if (e.clientY < listRect.top) dropTargetIndex.value = 0
      else if (e.clientY > listRect.bottom) dropTargetIndex.value = tasks.value.length
    }
  }
}

const performSort = (dragId: string, targetIdx: number) => {
  const fromIdx = tasks.value.findIndex(t => t.id === dragId)
  if (fromIdx === -1) return

  const isParentDragging = tasks.value[fromIdx].indent === 0
  const group = isParentDragging ? getGroupRange(tasks.value, fromIdx) : { start: fromIdx, end: fromIdx }
  const groupItems = tasks.value.slice(group.start, group.end + 1)

  const remainingTasks = [...tasks.value]
  remainingTasks.splice(group.start, groupItems.length)

  let actualInsertIdx = targetIdx
  if (targetIdx > group.start) {
    actualInsertIdx = Math.max(0, targetIdx - groupItems.length)
  }
  actualInsertIdx = Math.min(actualInsertIdx, remainingTasks.length)

  remainingTasks.splice(actualInsertIdx, 0, ...groupItems)
  tasks.value = remainingTasks.map((t, i) => (i === 0 && t.indent === 1) ? { ...t, indent: 0 } : t)
}

onUnmounted(() => {
  window.removeEventListener('pointermove', handlePointerMove)
  window.removeEventListener('pointerup', handlePointerUp)
  window.removeEventListener('pointercancel', handlePointerUp)
})
</script>

<template>
  <header class="header">
    <div class="header-content" @click="isListSelectorOpen = !isListSelectorOpen">
      <div class="title-container">
        <h1 class="title">{{ activeList.name }}</h1>
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="chevron-icon" :class="{ 'is-open': isListSelectorOpen }"><polyline points="6 9 12 15 18 9"></polyline></svg>
      </div>
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

    <!-- リストセレクター ドロップダウン -->
    <Transition name="fade">
      <div v-if="isListSelectorOpen" class="list-selector-overlay" @click.stop="isListSelectorOpen = false">
        <div class="list-selector-menu" @click.stop>
          <div class="list-selector-header">
            <h3>{{ isManagingLists ? 'リストを管理' : 'リストを切り替え' }}</h3>
            <button class="manage-toggle-button" @click="toggleManageLists">
              {{ isManagingLists ? '完了' : '編集' }}
            </button>
          </div>
          <div class="list-items">
            <div 
              v-for="list in state.lists" 
              :key="list.id"
              class="list-item-wrapper"
            >
              <button 
                v-if="editingListId !== list.id"
                class="list-item"
                :class="{ 
                  'is-active': list.id === state.activeListId && !isManagingLists,
                  'is-managing': isManagingLists 
                }"
                @click="selectList(list.id)"
              >
                <span class="list-item-name">{{ list.name }}</span>
                <div class="list-item-actions" v-if="isManagingLists">
                  <button class="edit-list-button" @click.stop="startEditingList(list.id, list.name)">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  </button>
                  <button class="delete-list-button" @click.stop="handleDeleteList(list.id)">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                  </button>
                </div>
                <svg v-else-if="list.id === state.activeListId" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="check-icon"><polyline points="20 6 9 17 4 12"></polyline></svg>
              </button>
              
              <div v-else class="list-item-edit">
                <input 
                  v-model="editingListName" 
                  type="text" 
                  class="edit-list-input" 
                  autoFocus
                  @keyup.enter="saveListName(list.id)"
                  @blur="saveListName(list.id)"
                />
              </div>
            </div>
          </div>
          <div class="list-selector-footer">
            <button class="create-list-button" @click="handleCreateList">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              新しいリストを作成
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </header>

  <main class="task-list">
    <TransitionGroup name="list">
      <template v-for="(task, index) in tasks" :key="task.id">
        <div 
          v-if="dropTargetIndex === index" 
          class="drop-indicator"
        ></div>
        
        <TaskItem 
          :task="task"
          :is-dragging="draggingId === task.id"
          @toggle="toggleTask"
          @delete="deleteTaskItem"
          @indent="handleIndent"
          @dragstart="handleDragStart"
        />
      </template>

      <div 
        v-if="dropTargetIndex === tasks.length" 
        class="drop-indicator"
      ></div>
    </TransitionGroup>
    
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
  cursor: pointer;
}

.title-container {
  display: flex;
  align-items: center;
  gap: 8px;
}

.title {
  font-size: 1.75rem;
  font-weight: 900;
  color: #0f172a;
  margin: 0;
  letter-spacing: -0.04em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 250px;
}

.chevron-icon {
  color: #64748b;
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.chevron-icon.is-open {
  transform: rotate(180deg);
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
  flex-shrink: 0;
}

.reset-button:active {
  transform: rotate(-30deg) scale(0.9);
  background-color: #e2e8f0;
}

.list-selector-overlay {
  position: absolute;
  top: 100%;
  left: 24px;
  right: 24px;
  z-index: 100;
  padding-top: 12px;
}

.list-selector-menu {
  background-color: white;
  border-radius: 24px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  border: 1px solid #e2e8f0;
  overflow: hidden;
  animation: dropdown-fade-in 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes dropdown-fade-in {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

.list-selector-header {
  padding: 16px 20px;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.list-selector-header h3 {
  margin: 0;
  font-size: 0.875rem;
  font-weight: 800;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.manage-toggle-button {
  font-size: 0.8125rem;
  font-weight: 700;
  color: #4f46e5;
  background-color: #f5f3ff;
  padding: 6px 12px;
  border-radius: 8px;
}

.list-items {
  max-height: 300px;
  overflow-y: auto;
  padding: 8px;
}

.list-item-wrapper {
  margin-bottom: 4px;
}

.list-item {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  border-radius: 12px;
  color: #475569;
  font-weight: 600;
  transition: all 0.2s;
  text-align: left;
}

.list-item:active:not(.is-managing) {
  background-color: #f1f5f9;
}

.list-item.is-active {
  background-color: #f5f3ff;
  color: #4f46e5;
}

.list-item.is-managing {
  cursor: default;
}

.list-item-name {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.list-item-actions {
  display: flex;
  gap: 8px;
}

.edit-list-button, .delete-list-button {
  padding: 6px;
  border-radius: 6px;
  color: #64748b;
  transition: all 0.2s;
}

.edit-list-button:active {
  background-color: #e2e8f0;
}

.delete-list-button:active {
  background-color: #fee2e2;
  color: #ef4444;
}

.list-item-edit {
  padding: 4px;
}

.edit-list-input {
  width: 100%;
  padding: 10px 14px;
  border-radius: 10px;
  border: 2px solid #4f46e5;
  font-size: 1rem;
  font-weight: 600;
  color: #1e293b;
  outline: none;
}

.check-icon {
  margin-left: 12px;
  color: #4f46e5;
}

.list-selector-footer {
  padding: 8px;
  border-top: 1px solid #f1f5f9;
  background-color: #f8fafc;
}

.create-list-button {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px;
  border-radius: 12px;
  color: #4f46e5;
  font-weight: 700;
  transition: all 0.2s;
}

.create-list-button:active {
  background-color: #f1f5f9;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.task-list {
  padding: 20px;
  flex: 1;
  padding-bottom: 120px;
}

.list-move,
.list-enter-active,
.list-leave-active {
  transition: all 0.5s cubic-bezier(0.55, 0, 0.1, 1);
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

.list-leave-active {
  position: absolute;
  width: calc(100% - 40px);
}

.drop-indicator {
  height: 4px;
  background-color: #4f46e5;
  margin: 8px 0;
  border-radius: 9999px;
  position: relative;
  box-shadow: 0 0 8px rgba(79, 70, 229, 0.4);
}

.drop-indicator::before {
  content: '';
  position: absolute;
  left: -4px;
  top: -4px;
  width: 12px;
  height: 12px;
  background-color: #4f46e5;
  border-radius: 50%;
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
  z-index: 150;
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
