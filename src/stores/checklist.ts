// チェックリスト管理用のPinia store

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ChecklistList, ChecklistItem, ChecklistData, ProgressInfo } from '../types'
import { generateId, formatDate, calculateProgress, reorderArray } from '../utils'
import { loadData, saveData } from '../utils/storage'
import { migrateFlatToNested } from '../utils/migration'

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

  // 内部ユーティリティ：アイテムの場所を検索
  const findItemLocation = (items: ChecklistItem[], targetId: string, parentItem: ChecklistItem | null = null): { array: ChecklistItem[], index: number, parentItem: ChecklistItem | null } | null => {
    for (let i = 0; i < items.length; i++) {
      if (items[i].id === targetId) {
        return { array: items, index: i, parentItem }
      }
      if (items[i].subItems && items[i].subItems!.length > 0) {
        const found = findItemLocation(items[i].subItems!, targetId, items[i])
        if (found) return found
      }
    }
    return null
  }

  // 内部ユーティリティ：チェック状態を再帰的に適用
  const setCheckRecursive = (items: ChecklistItem[], checked: boolean) => {
    items.forEach(item => {
      item.checked = checked
      if (item.subItems && item.subItems.length > 0) {
        setCheckRecursive(item.subItems, checked)
      }
    })
  }

  // データ初期化
  const initializeData = async () => {
    isLoading.value = true
    error.value = null
    
    try {
      const data = loadData()
      if (data && data.lists) {
        // ロード時に過去のフラット構造データをネスト構造に移行する
        lists.value = data.lists.map(list => ({
          ...list,
          items: migrateFlatToNested(list.items)
        }))
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
      createdAt: formatDate(new Date())
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
        ...updates
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

    const cloneItem = (item: ChecklistItem): ChecklistItem => ({
      ...item,
      id: generateId(),
      checked: false,
      subItems: item.subItems ? item.subItems.map(cloneItem) : []
    })

    const duplicatedList: ChecklistList = {
      id: generateId(),
      name: `${originalList.name} (コピー)`,
      items: originalList.items.map(cloneItem),
      createdAt: formatDate(new Date())
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
      checked: false,
      subItems: []
    }

    list.items.push(newItem)
    saveDataToStorage()
    return newItem
  }

  const updateItem = (listId: string, itemId: string, updates: Partial<ChecklistItem>) => {
    const list = lists.value.find(l => l.id === listId)
    if (!list) return

    const location = findItemLocation(list.items, itemId)
    if (location) {
      location.array[location.index] = { ...location.array[location.index], ...updates }
      saveDataToStorage()
    }
  }

  const deleteItem = (listId: string, itemId: string) => {
    const list = lists.value.find(l => l.id === listId)
    if (!list) return

    const location = findItemLocation(list.items, itemId)
    if (location) {
      location.array.splice(location.index, 1)
      saveDataToStorage()
    }
  }

  const toggleItem = (listId: string, itemId: string) => {
    const list = lists.value.find(l => l.id === listId)
    if (!list) return

    const location = findItemLocation(list.items, itemId)
    if (location) {
      const item = location.array[location.index]
      item.checked = !item.checked
      
      // 子要素もすべて同じ状態にする（カスケード）
      if (item.subItems && item.subItems.length > 0) {
        setCheckRecursive(item.subItems, item.checked)
      }
      
      saveDataToStorage()
    }
  }

  const toggleIndentation = (listId: string, itemId: string) => {
    const list = lists.value.find(l => l.id === listId)
    if (!list) return

    const location = findItemLocation(list.items, itemId)
    if (!location) return

    if (location.parentItem === null) {
      // トップレベルの項目をインデントする (直前の項目の subItems に移動)
      if (location.index > 0) {
        const item = location.array.splice(location.index, 1)[0]
        const prevItem = location.array[location.index - 1]
        if (!prevItem.subItems) prevItem.subItems = []
        prevItem.subItems.push(item)
        saveDataToStorage()
      }
    } else {
      // ネストされた項目をアウトデントする (トップレベルに戻す)
      // 現在は1階層のみを想定しているため、トップレベルに移動させる
      const parentLoc = findItemLocation(list.items, location.parentItem.id)
      if (parentLoc) {
        const item = location.array.splice(location.index, 1)[0]
        // 親項目の直後に配置
        parentLoc.array.splice(parentLoc.index + 1, 0, item)
        saveDataToStorage()
      }
    }
  }

  // ドラッグ＆ドロップ用の一時的な並び替え（D&Dは直接配列を変更するため明示的には不要だが後方互換性のため維持）
  const reorderItems = (listId: string, fromIndex: number, toIndex: number) => {
    const list = lists.value.find(l => l.id === listId)
    if (!list) return

    list.items = reorderArray(list.items, fromIndex, toIndex)
    saveDataToStorage()
  }

  // 一括操作
  const clearCompletedItems = (listId: string) => {
    const list = lists.value.find(l => l.id === listId)
    if (!list) return

    const filterCompleted = (items: ChecklistItem[]): ChecklistItem[] => {
      return items
        .filter(item => !item.checked)
        .map(item => ({
          ...item,
          subItems: item.subItems ? filterCompleted(item.subItems) : []
        }))
    }

    list.items = filterCompleted(list.items)
    saveDataToStorage()
  }

  const checkAllItems = (listId: string) => {
    const list = lists.value.find(l => l.id === listId)
    if (!list) return

    setCheckRecursive(list.items, true)
    saveDataToStorage()
  }

  const uncheckAllItems = (listId: string) => {
    const list = lists.value.find(l => l.id === listId)
    if (!list) return

    setCheckRecursive(list.items, false)
    saveDataToStorage()
  }

  // 検索とフィルタリング
  const searchLists = (query: string) => {
    if (!query.trim()) return lists.value
    
    const lowercaseQuery = query.toLowerCase()

    const matchItem = (item: ChecklistItem): boolean => {
      if (item.text.toLowerCase().includes(lowercaseQuery)) return true
      if (item.subItems && item.subItems.some(matchItem)) return true
      return false
    }

    return lists.value.filter(list => 
      list.name.toLowerCase().includes(lowercaseQuery) ||
      list.items.some(matchItem)
    )
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
    lists,
    currentListId,
    isLoading,
    error,
    currentList,
    totalLists,
    currentListProgress,
    initializeData,
    saveDataToStorage,
    createList,
    updateList,
    deleteList,
    duplicateList,
    addItem,
    updateItem,
    deleteItem,
    toggleItem,
    toggleIndentation,
    reorderItems,
    clearCompletedItems,
    checkAllItems,
    uncheckAllItems,
    searchLists,
    setCurrentList,
    clearAllData,
    clearError
  }
})
