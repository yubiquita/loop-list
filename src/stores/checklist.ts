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

  /**
   * 古いデータ構造（ネストされた subItems または indent: boolean）から
   * 新しいフラットな indent: number 構造へ変換します。
   */
  const migrateToFlatStructure = (items: any[]): ChecklistItem[] => {
    const flatItems: ChecklistItem[] = []

    const flatten = (itemsToFlatten: any[], currentIndent: number) => {
      itemsToFlatten.forEach(item => {
        // 既存の indent プロパティ（boolean または number）を考慮
        let indentValue = 0
        if (typeof item.indent === 'number') {
          indentValue = item.indent
        } else if (item.indent === true) {
          indentValue = currentIndent + 1
        } else {
          indentValue = currentIndent
        }

        const newItem: ChecklistItem = {
          id: item.id || generateId(),
          text: item.text || '',
          checked: !!item.checked,
          indent: indentValue
        }
        flatItems.push(newItem)

        if (item.subItems && Array.isArray(item.subItems) && item.subItems.length > 0) {
          flatten(item.subItems, indentValue + 1)
        }
      })
    }

    flatten(items, 0)
    return flatItems
  }

  // データ初期化
  const initializeData = async () => {
    isLoading.value = true
    error.value = null
    
    try {
      const data = loadData()
      if (data && data.lists) {
        lists.value = data.lists.map(list => ({
          ...list,
          items: migrateToFlatStructure(list.items)
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

    const duplicatedList: ChecklistList = {
      id: generateId(),
      name: `${originalList.name} (コピー)`,
      items: originalList.items.map(item => ({
        ...item,
        id: generateId(),
        checked: false
      })),
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
      indent: 0
    }

    list.items.push(newItem)
    saveDataToStorage()
    return newItem
  }

  const updateItem = (listId: string, itemId: string, updates: Partial<ChecklistItem>) => {
    const list = lists.value.find(l => l.id === listId)
    if (!list) return

    const index = list.items.findIndex(item => item.id === itemId)
    if (index !== -1) {
      Object.assign(list.items[index], updates)
      saveDataToStorage()
    }
  }

  const deleteItem = (listId: string, itemId: string) => {
    const list = lists.value.find(l => l.id === listId)
    if (!list) return

    const index = list.items.findIndex(item => item.id === itemId)
    if (index !== -1) {
      list.items.splice(index, 1)
      saveDataToStorage()
    }
  }

  const toggleItem = (listId: string, itemId: string) => {
    const list = lists.value.find(l => l.id === listId)
    if (!list) return

    const index = list.items.findIndex(item => item.id === itemId)
    if (index === -1) return

    const item = list.items[index]
    const newChecked = !item.checked
    item.checked = newChecked

    // カスケードチェック：子タスクへの連動
    for (let i = index + 1; i < list.items.length; i++) {
      if (list.items[i].indent <= item.indent) break
      list.items[i].checked = newChecked
    }

    // カスケードチェック：親タスクへの連動
    let currentChildIndent = item.indent
    let searchIndex = index
    
    while (currentChildIndent > 0) {
      // 親を探す
      let parentIndex = -1
      for (let i = searchIndex - 1; i >= 0; i--) {
        if (list.items[i].indent < currentChildIndent) {
          parentIndex = i
          break
        }
      }

      if (parentIndex === -1) break

      const parent = list.items[parentIndex]
      const parentIndent = parent.indent

      // 親のすべての子がチェックされているか確認
      let allChildrenChecked = true
      for (let i = parentIndex + 1; i < list.items.length; i++) {
        if (list.items[i].indent <= parentIndent) break
        // 直系の子（親のインデント+1）だけでなく、全子孫を見るのが一般的だが
        // モックの仕様に合わせるなら直系の子の状態を見る場合もある。
        // ここでは「配下の子すべて」の状態を反映させる。
        if (!list.items[i].checked) {
          allChildrenChecked = false
          break
        }
      }

      parent.checked = allChildrenChecked
      
      // さらに上の親へ
      currentChildIndent = parentIndent
      searchIndex = parentIndex
    }

    saveDataToStorage()
  }

  const toggleIndentation = (listId: string, itemId: string) => {
    const list = lists.value.find(l => l.id === listId)
    if (!list) return

    const index = list.items.findIndex(item => item.id === itemId)
    if (index === -1) return

    const item = list.items[index]

    if (item.indent === 0) {
      // インデント（0 -> 1）
      if (index > 0) {
        item.indent = 1
      }
    } else {
      // アウトデント（1 -> 0）
      item.indent = 0
    }
    
    saveDataToStorage()
  }

  const reorderItems = (listId: string, fromIndex: number, toIndex: number) => {
    const list = lists.value.find(l => l.id === listId)
    if (!list) return

    list.items = reorderArray(list.items, fromIndex, toIndex)
    
    // データの整合性維持：先頭の項目は必ず indent 0
    if (list.items.length > 0 && list.items[0].indent !== 0) {
      list.items[0].indent = 0
    }
    
    saveDataToStorage()
  }

  // 一括操作
  const clearCompletedItems = (listId: string) => {
    const list = lists.value.find(l => l.id === listId)
    if (!list) return

    list.items = list.items.filter(item => !item.checked)
    saveDataToStorage()
  }

  const checkAllItems = (listId: string) => {
    const list = lists.value.find(l => l.id === listId)
    if (!list) return

    list.items.forEach(item => item.checked = true)
    saveDataToStorage()
  }

  const uncheckAllItems = (listId: string) => {
    const list = lists.value.find(l => l.id === listId)
    if (!list) return

    list.items.forEach(item => item.checked = false)
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
