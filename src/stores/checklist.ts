// チェックリスト管理用のPinia store

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ChecklistList, ChecklistItem, ChecklistData, ProgressInfo } from '../types'
import { generateId, formatDate, calculateProgress, reorderArray } from '../utils'
import { loadData, saveData } from '../utils/storage'

export const useChecklistStore = defineStore('checklist', () => {
  // 状態
  const lists = ref<ChecklistList[]>([])
  const currentListId = ref<string | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // 算出プロパティ
  const currentList = computed(() => {
    if (!currentListId.value) return null
    return lists.value.find(list => list.id === currentListId.value) || null
  })

  const totalLists = computed(() => lists.value.length)

  const currentListProgress = computed((): ProgressInfo | null => {
    if (!currentList.value) return null
    return calculateProgress(currentList.value.items)
  })

  // データ初期化
  const initializeData = async () => {
    isLoading.value = true
    error.value = null
    
    try {
      const data = loadData()
      if (data && data.lists) {
        lists.value = data.lists
      }
    } catch (err) {
      error.value = 'データの読み込みに失敗しました'
      console.error('データ初期化エラー:', err)
    } finally {
      isLoading.value = false
    }
  }

  // データ保存
  const saveDataToStorage = () => {
    try {
      const data: ChecklistData = {
        lists: lists.value
      }
      saveData(data)
    } catch (err) {
      error.value = 'データ保存に失敗しました'
      console.error('データ保存エラー:', err)
    }
  }

  // リスト操作
  const createList = (name: string): ChecklistList => {
    const newList: ChecklistList = {
      id: generateId(),
      name: name.trim(),
      items: [],
      createdAt: formatDate(new Date()),
      updatedAt: formatDate(new Date())
    }
    
    lists.value.push(newList)
    saveDataToStorage()
    return newList
  }

  const updateList = (listId: string, updates: Partial<ChecklistList>) => {
    const index = lists.value.findIndex(list => list.id === listId)
    if (index !== -1) {
      lists.value[index] = {
        ...lists.value[index],
        ...updates,
        updatedAt: formatDate(new Date())
      }
      saveDataToStorage()
    }
  }

  const deleteList = (listId: string) => {
    const index = lists.value.findIndex(list => list.id === listId)
    if (index !== -1) {
      lists.value.splice(index, 1)
      if (currentListId.value === listId) {
        currentListId.value = null
      }
      saveDataToStorage()
    }
  }

  const duplicateList = (listId: string): ChecklistList | null => {
    const originalList = lists.value.find(list => list.id === listId)
    if (!originalList) return null

    const duplicatedList: ChecklistList = {
      id: generateId(),
      name: `${originalList.name} (コピー)`,
      items: originalList.items.map(item => ({
        ...item,
        id: generateId(),
        checked: false
      })),
      createdAt: formatDate(new Date()),
      updatedAt: formatDate(new Date())
    }

    lists.value.push(duplicatedList)
    saveDataToStorage()
    return duplicatedList
  }

  // 項目操作
  const addItem = (listId: string, text: string): ChecklistItem | null => {
    const list = lists.value.find(l => l.id === listId)
    if (!list) return null

    const newItem: ChecklistItem = {
      id: generateId(),
      text: text.trim(),
      checked: false
    }

    list.items.push(newItem)
    list.updatedAt = formatDate(new Date())
    saveDataToStorage()
    return newItem
  }

  const updateItem = (listId: string, itemId: string, updates: Partial<ChecklistItem>) => {
    const list = lists.value.find(l => l.id === listId)
    if (!list) return

    const itemIndex = list.items.findIndex(item => item.id === itemId)
    if (itemIndex !== -1) {
      list.items[itemIndex] = { ...list.items[itemIndex], ...updates }
      list.updatedAt = formatDate(new Date())
      saveDataToStorage()
    }
  }

  const deleteItem = (listId: string, itemId: string) => {
    const list = lists.value.find(l => l.id === listId)
    if (!list) return

    const itemIndex = list.items.findIndex(item => item.id === itemId)
    if (itemIndex !== -1) {
      list.items.splice(itemIndex, 1)
      list.updatedAt = formatDate(new Date())
      saveDataToStorage()
    }
  }

  const toggleItem = (listId: string, itemId: string) => {
    const list = lists.value.find(l => l.id === listId)
    if (!list) return

    const item = list.items.find(item => item.id === itemId)
    if (item) {
      item.checked = !item.checked
      list.updatedAt = formatDate(new Date())
      saveDataToStorage()
    }
  }

  const reorderItems = (listId: string, fromIndex: number, toIndex: number) => {
    const list = lists.value.find(l => l.id === listId)
    if (!list) return

    list.items = reorderArray(list.items, fromIndex, toIndex)
    list.updatedAt = formatDate(new Date())
    saveDataToStorage()
  }

  // 一括操作
  const clearCompletedItems = (listId: string) => {
    const list = lists.value.find(l => l.id === listId)
    if (!list) return

    list.items = list.items.filter(item => !item.checked)
    list.updatedAt = formatDate(new Date())
    saveDataToStorage()
  }

  const checkAllItems = (listId: string) => {
    const list = lists.value.find(l => l.id === listId)
    if (!list) return

    list.items.forEach(item => {
      item.checked = true
    })
    list.updatedAt = formatDate(new Date())
    saveDataToStorage()
  }

  const uncheckAllItems = (listId: string) => {
    const list = lists.value.find(l => l.id === listId)
    if (!list) return

    list.items.forEach(item => {
      item.checked = false
    })
    list.updatedAt = formatDate(new Date())
    saveDataToStorage()
  }

  // 検索とフィルタリング
  const searchLists = (query: string) => {
    if (!query.trim()) return lists.value
    
    const lowercaseQuery = query.toLowerCase()
    return lists.value.filter(list => 
      list.name.toLowerCase().includes(lowercaseQuery) ||
      list.items.some(item => item.text.toLowerCase().includes(lowercaseQuery))
    )
  }

  const getListsByDate = (ascending: boolean = true) => {
    return [...lists.value].sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime()
      const dateB = new Date(b.createdAt).getTime()
      return ascending ? dateA - dateB : dateB - dateA
    })
  }

  const getListsByProgress = (ascending: boolean = true) => {
    return [...lists.value].sort((a, b) => {
      const progressA = calculateProgress(a.items).percentage
      const progressB = calculateProgress(b.items).percentage
      return ascending ? progressA - progressB : progressB - progressA
    })
  }

  // 現在のリスト設定
  const setCurrentList = (listId: string | null) => {
    currentListId.value = listId
  }

  // データクリア
  const clearAllData = () => {
    lists.value = []
    currentListId.value = null
    saveDataToStorage()
  }

  // エラークリア
  const clearError = () => {
    error.value = null
  }

  return {
    // 状態
    lists,
    currentListId,
    isLoading,
    error,
    
    // 算出プロパティ
    currentList,
    totalLists,
    currentListProgress,
    
    // メソッド
    initializeData,
    saveDataToStorage,
    
    // リスト操作
    createList,
    updateList,
    deleteList,
    duplicateList,
    
    // 項目操作
    addItem,
    updateItem,
    deleteItem,
    toggleItem,
    reorderItems,
    
    // 一括操作
    clearCompletedItems,
    checkAllItems,
    uncheckAllItems,
    
    // 検索とフィルタリング
    searchLists,
    getListsByDate,
    getListsByProgress,
    
    // ユーティリティ
    setCurrentList,
    clearAllData,
    clearError
  }
})