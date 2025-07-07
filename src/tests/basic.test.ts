// 基本動作テスト

import { describe, it, expect, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useChecklistStore, useUIStore } from '../stores'

describe('基本動作テスト', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('ChecklistStore', () => {
    it('リストを作成できる', () => {
      const store = useChecklistStore()
      
      const list = store.createList('テストリスト')
      
      expect(list.name).toBe('テストリスト')
      expect(list.items).toEqual([])
      expect(store.lists.length).toBe(1)
    })

    it('項目を追加できる', () => {
      const store = useChecklistStore()
      
      const list = store.createList('テストリスト')
      const item = store.addItem(list.id, 'テスト項目')
      
      expect(item).toBeTruthy()
      expect(item?.text).toBe('テスト項目')
      expect(item?.checked).toBe(false)
      expect(store.lists[0].items.length).toBe(1)
    })

    it('項目のチェック状態を切り替えできる', () => {
      const store = useChecklistStore()
      
      const list = store.createList('テストリスト')
      const item = store.addItem(list.id, 'テスト項目')
      
      if (item) {
        store.toggleItem(list.id, item.id)
        expect(store.lists[0].items[0].checked).toBe(true)
        
        store.toggleItem(list.id, item.id)
        expect(store.lists[0].items[0].checked).toBe(false)
      }
    })

    it('リストを削除できる', () => {
      const store = useChecklistStore()
      
      const list = store.createList('テストリスト')
      expect(store.lists.length).toBe(1)
      
      store.deleteList(list.id)
      expect(store.lists.length).toBe(0)
    })
  })

  describe('UIStore', () => {
    it('画面遷移ができる', () => {
      const store = useUIStore()
      
      expect(store.currentScreen).toBe('list')
      
      store.showDetailScreen()
      expect(store.currentScreen).toBe('detail')
      expect(store.isDetailScreen).toBe(true)
      
      store.showEditScreen()
      expect(store.currentScreen).toBe('edit')
      expect(store.isEditScreen).toBe(true)
      
      store.showListScreen()
      expect(store.currentScreen).toBe('list')
      expect(store.isListScreen).toBe(true)
    })

    it('確認モーダルを表示できる', () => {
      const store = useUIStore()
      let actionCalled = false
      
      expect(store.showConfirmModal).toBe(false)
      
      store.showConfirm('テストメッセージ', () => {
        actionCalled = true
      })
      
      expect(store.showConfirmModal).toBe(true)
      expect(store.confirmMessage).toBe('テストメッセージ')
      
      store.confirmYes()
      expect(actionCalled).toBe(true)
      expect(store.showConfirmModal).toBe(false)
    })

    it('エラーメッセージを表示できる', () => {
      const store = useUIStore()
      
      expect(store.error).toBe(null)
      
      store.showError('テストエラー')
      expect(store.error).toBe('テストエラー')
      
      store.clearError()
      expect(store.error).toBe(null)
    })
  })
})