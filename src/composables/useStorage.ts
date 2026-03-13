import { ref, computed, watchEffect } from 'vue'
import type { AppState, RoutineList, Task } from '../types'

const STORAGE_KEY = 'loop-list-state'
const OLD_STORAGE_KEY = 'loop-list-tasks'

const initialTasks: Task[] = [
  { id: 't1', text: 'モーニングルーティン', completed: false, indent: 0 },
  { id: 't2', text: 'コップ一杯の水を飲む', completed: false, indent: 1 },
  { id: 't3', text: 'ストレッチ（5分）', completed: false, indent: 1 },
  { id: 't4', text: '仕事の準備', completed: false, indent: 0 },
  { id: 't5', text: 'PCを起動する', completed: false, indent: 1 },
  { id: 't6', text: '今日のスケジュール確認', completed: false, indent: 1 },
]

const createDefaultList = (): RoutineList => ({
  id: Date.now().toString(),
  name: 'Routine',
  tasks: [...initialTasks]
})

export function useStorage() {
  const loadState = (): AppState => {
    // Migration check: if old key exists, reset as per spec
    if (window.localStorage.getItem(OLD_STORAGE_KEY)) {
      window.localStorage.removeItem(OLD_STORAGE_KEY)
      const defaultList = createDefaultList()
      return {
        lists: [defaultList],
        activeListId: defaultList.id
      }
    }

    const saved = window.localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch (e) {
        console.error('Failed to parse saved state', e)
      }
    }

    const defaultList = createDefaultList()
    return {
      lists: [defaultList],
      activeListId: defaultList.id
    }
  }

  const state = ref<AppState>(loadState())

  const activeList = computed(() => {
    return state.value.lists.find(l => l.id === state.value.activeListId) || state.value.lists[0]
  })

  watchEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state.value))
  })

  return {
    state,
    activeList
  }
}
