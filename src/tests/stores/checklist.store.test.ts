// ChecklistStore のテスト（フラット構造・indentプロパティ版）

import { describe, it, expect, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useChecklistStore } from '../../stores/checklist'
import type { ChecklistList } from '../../types'

describe('ChecklistStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
  })

  describe('初期化とデータ読み込み', () => {
    it('初期状態が正しく設定される', () => {
      const store = useChecklistStore()
      
      expect(store.lists).toEqual([])
      expect(store.currentListId).toBe(null)
      expect(store.isLoading).toBe(false)
      expect(store.error).toBe(null)
      expect(store.totalLists).toBe(0)
    })

    it('initializeData でlocalStorageからデータを読み込み、フラット構造として保持する', async () => {
      const testData = {
        lists: [{
          id: 'test-1',
          name: 'テストリスト',
          items: [
            { id: '1', text: '親', checked: false, indent: 0 },
            { id: '2', text: '子', checked: false, indent: 1 }
          ],
          createdAt: '2024-01-01T00:00:00.000Z'
        }]
      }
      localStorage.setItem('checklistData', JSON.stringify(testData))

      const store = useChecklistStore()
      await store.initializeData()

      expect(store.lists).toHaveLength(1)
      expect(store.lists[0].items).toHaveLength(2)
      expect(store.lists[0].items[0].id).toBe('1')
      expect(store.lists[0].items[1].id).toBe('2')
    })

    it('古いデータ構造（subItems）からフラット構造にマイグレーションする', async () => {
      const oldData = {
        lists: [{
          id: 'test-old',
          name: '古いリスト',
          items: [
            { 
              id: 'p1', 
              text: '親', 
              checked: false, 
              subItems: [
                { id: 'c1', text: '子', checked: true }
              ] 
            }
          ],
          createdAt: '2024-01-01T00:00:00.000Z'
        }]
      }
      localStorage.setItem('checklistData', JSON.stringify(oldData))

      const store = useChecklistStore()
      await store.initializeData()

      expect(store.lists[0].items).toHaveLength(2)
      expect(store.lists[0].items[0].id).toBe('p1')
      expect(store.lists[0].items[0].indent).toBe(0)
      expect(store.lists[0].items[1].id).toBe('c1')
      expect(store.lists[0].items[1].indent).toBe(1)
      expect(store.lists[0].items[1].checked).toBe(true)
    })
  })

  describe('リスト操作', () => {
    it('createList でリストを作成できる', () => {
      const store = useChecklistStore()
      store.createList('新規リスト')
      expect(store.lists).toHaveLength(1)
      expect(store.lists[0].name).toBe('新規リスト')
    })

    it('duplicateList でリストを複製できる（チェックはリセット）', () => {
      const store = useChecklistStore()
      const list = store.createList('元のリスト')
      store.addItem(list.id, '項目1')
      store.toggleItem(list.id, store.lists[0].items[0].id)

      const duplicated = store.duplicateList(list.id)
      expect(duplicated).toBeTruthy()
      expect(duplicated!.name).toBe('元のリスト (コピー)')
      expect(duplicated!.items).toHaveLength(1)
      expect(duplicated!.items[0].checked).toBe(false)
      expect(duplicated!.id).not.toBe(list.id)
    })
  })

  describe('項目操作', () => {
    let store: ReturnType<typeof useChecklistStore>
    let testList: ChecklistList

    beforeEach(() => {
      store = useChecklistStore()
      testList = store.createList('テストリスト')
    })

    it('addItem で項目を追加できる', () => {
      store.addItem(testList.id, '項目1')
      expect(store.lists[0].items).toHaveLength(1)
      expect(store.lists[0].items[0].text).toBe('項目1')
      expect(store.lists[0].items[0].indent).toBe(0)
    })

    it('updateItem で項目を更新できる', () => {
      const item = store.addItem(testList.id, '項目1')!
      store.updateItem(testList.id, item.id, { text: '更新済み' })
      expect(store.lists[0].items[0].text).toBe('更新済み')
    })

    it('deleteItem で項目を削除できる', () => {
      const item = store.addItem(testList.id, '項目1')!
      store.deleteItem(testList.id, item.id)
      expect(store.lists[0].items).toHaveLength(0)
    })

    it('toggleIndentation でインデントを変更できる', () => {
      store.addItem(testList.id, '親')
      const child = store.addItem(testList.id, '子')!
      
      store.toggleIndentation(testList.id, child.id)
      expect(store.lists[0].items[1].indent).toBe(1)

      store.toggleIndentation(testList.id, child.id)
      expect(store.lists[0].items[1].indent).toBe(0)
    })
  })

  describe('カスケードチェック', () => {
    let store: ReturnType<typeof useChecklistStore>
    let testList: ChecklistList

    beforeEach(() => {
      store = useChecklistStore()
      testList = store.createList('テストリスト')
      store.addItem(testList.id, '親') // 0
      store.addItem(testList.id, '子1') // 1
      store.toggleIndentation(testList.id, store.lists[0].items[1].id)
      store.addItem(testList.id, '子2') // 2
      store.toggleIndentation(testList.id, store.lists[0].items[2].id)
    })

    it('親をチェックすると全子がチェックされる', () => {
      store.toggleItem(testList.id, store.lists[0].items[0].id)
      expect(store.lists[0].items[0].checked).toBe(true)
      expect(store.lists[0].items[1].checked).toBe(true)
      expect(store.lists[0].items[2].checked).toBe(true)
    })

    it('全子をチェックすると親が自動でチェックされる', () => {
      store.toggleItem(testList.id, store.lists[0].items[1].id)
      expect(store.lists[0].items[0].checked).toBe(false)
      store.toggleItem(testList.id, store.lists[0].items[2].id)
      expect(store.lists[0].items[0].checked).toBe(true)
    })

    it('子が外れると親も外れる', () => {
      store.checkAllItems(testList.id)
      expect(store.lists[0].items[0].checked).toBe(true)
      
      store.toggleItem(testList.id, store.lists[0].items[1].id)
      expect(store.lists[0].items[0].checked).toBe(false)
    })
  })

  describe('算出プロパティ', () => {
    it('currentListProgress が正しく計算される', () => {
      const store = useChecklistStore()
      const list = store.createList('テスト')
      store.setCurrentList(list.id)
      store.addItem(list.id, '1')
      store.addItem(list.id, '2')
      
      expect(store.currentListProgress!.percentage).toBe(0)
      
      store.toggleItem(list.id, store.lists[0].items[0].id)
      expect(store.currentListProgress!.percentage).toBe(50)
    })
  })
})
