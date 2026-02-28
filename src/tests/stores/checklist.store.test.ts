// ChecklistStore のテスト（ネスト構造対応版）

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

    it('initializeData でlocalStorageからデータを読み込み、フラット構造ならマイグレーションする', async () => {
      const testData = {
        lists: [{
          id: 'test-1',
          name: 'テストリスト',
          items: [
            { id: '1', text: '親', checked: false },
            { id: '2', text: '子', checked: false, indent: true }
          ],
          createdAt: '2024-01-01T00:00:00.000Z'
        }]
      }
      localStorage.setItem('checklistData', JSON.stringify(testData))

      const store = useChecklistStore()
      await store.initializeData()

      expect(store.lists).toHaveLength(1)
      expect(store.lists[0].items).toHaveLength(1)
      expect(store.lists[0].items[0].id).toBe('1')
      expect(store.lists[0].items[0].subItems).toHaveLength(1)
      expect(store.lists[0].items[0].subItems![0].id).toBe('2')
    })

    it('不正なJSONデータでエラーハンドリングする', async () => {
      localStorage.setItem('checklistData', '{"invalid": json}')

      const store = useChecklistStore()
      await store.initializeData()

      expect(store.lists).toEqual([])
      expect(store.error).toBe('データの読み込みに失敗しました')
    })
  })

  describe('リスト操作', () => {
    it('duplicateList でリストを複製できる（ネスト構造も維持）', () => {
      const store = useChecklistStore()
      const originalList = store.createList('元のリスト')
      const p1 = store.addItem(originalList.id, '親項目')!
      
      // 手動でネスト状態を作成してテスト
      const c1 = { id: 'c1', text: '子項目', checked: true, subItems: [] }
      store.lists[0].items[0].subItems = [c1]

      const duplicatedList = store.duplicateList(originalList.id)

      expect(duplicatedList).toBeTruthy()
      expect(duplicatedList!.name).toBe('元のリスト (コピー)')
      expect(duplicatedList!.items).toHaveLength(1)
      expect(duplicatedList!.items[0].text).toBe('親項目')
      expect(duplicatedList!.items[0].checked).toBe(false)
      expect(duplicatedList!.items[0].subItems).toHaveLength(1)
      expect(duplicatedList!.items[0].subItems![0].text).toBe('子項目')
      expect(duplicatedList!.items[0].subItems![0].checked).toBe(false) // ネストされた項目もチェックリセット
      
      expect(duplicatedList!.id).not.toBe(originalList.id)
      expect(duplicatedList!.items[0].id).not.toBe(p1.id)
      expect(duplicatedList!.items[0].subItems![0].id).not.toBe('c1')
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
      const item = store.addItem(testList.id, '新しい項目')

      expect(item).toBeTruthy()
      expect(item!.text).toBe('新しい項目')
      expect(item!.subItems).toEqual([]) // subItemsが初期化される
      expect(store.lists[0].items).toHaveLength(1)
    })

    it('updateItem でネストされた項目も更新できる', () => {
      const parent = store.addItem(testList.id, '親項目')!
      const childId = 'child-1'
      store.lists[0].items[0].subItems = [{ id: childId, text: '子項目', checked: false, subItems: [] }]
      
      store.updateItem(testList.id, childId, { text: '更新された子項目' })

      expect(store.lists[0].items[0].subItems![0].text).toBe('更新された子項目')
    })

    it('deleteItem でネストされた項目も削除できる', () => {
      const parent = store.addItem(testList.id, '親項目')!
      const childId = 'child-1'
      store.lists[0].items[0].subItems = [{ id: childId, text: '子項目', checked: false, subItems: [] }]

      store.deleteItem(testList.id, childId)

      expect(store.lists[0].items[0].subItems).toHaveLength(0)
    })

    it('toggleIndentation でトップレベル項目を子項目に移動できる（インデント）', () => {
      const item1 = store.addItem(testList.id, '項目1')!
      const item2 = store.addItem(testList.id, '項目2')!

      store.toggleIndentation(testList.id, item2.id)

      expect(store.lists[0].items).toHaveLength(1)
      expect(store.lists[0].items[0].subItems).toHaveLength(1)
      expect(store.lists[0].items[0].subItems![0].id).toBe(item2.id)
    })

    it('toggleIndentation でインデントできない場合は何もしない（先頭項目など）', () => {
      const item1 = store.addItem(testList.id, '項目1')!

      store.toggleIndentation(testList.id, item1.id)

      expect(store.lists[0].items).toHaveLength(1) // 変化なし
      expect(store.lists[0].items[0].subItems).toHaveLength(0)
    })

    it('toggleIndentation でネストされた項目をトップレベルに戻せる（アウトデント）', () => {
      const item1 = store.addItem(testList.id, '項目1')!
      const item2 = store.addItem(testList.id, '項目2')!
      store.toggleIndentation(testList.id, item2.id) // item2 を item1 の子にする
      
      expect(store.lists[0].items[0].subItems).toHaveLength(1)

      store.toggleIndentation(testList.id, item2.id) // アウトデント

      expect(store.lists[0].items).toHaveLength(2)
      expect(store.lists[0].items[1].id).toBe(item2.id)
      expect(store.lists[0].items[0].subItems).toHaveLength(0)
    })

    it('親タスクをチェックした際にすべての子タスクもチェックされる', () => {
      const parent = store.addItem(testList.id, '親')!
      const child1 = store.addItem(testList.id, '子1')!
      store.toggleIndentation(testList.id, child1.id)
      
      store.toggleItem(testList.id, parent.id)

      expect(store.lists[0].items[0].checked).toBe(true)
      expect(store.lists[0].items[0].subItems![0].checked).toBe(true)
    })

    it('親タスクのチェックを外した際にすべての子タスクもチェックが外れる', () => {
      const parent = store.addItem(testList.id, '親')!
      const child1 = store.addItem(testList.id, '子1')!
      store.toggleIndentation(testList.id, child1.id)
      
      store.toggleItem(testList.id, parent.id) // 両方チェック
      store.toggleItem(testList.id, parent.id) // 両方チェック外す

      expect(store.lists[0].items[0].checked).toBe(false)
      expect(store.lists[0].items[0].subItems![0].checked).toBe(false)
    })
  })

  describe('一括操作', () => {
    let store: ReturnType<typeof useChecklistStore>
    let testList: ChecklistList

    beforeEach(() => {
      store = useChecklistStore()
      testList = store.createList('テストリスト')
      store.addItem(testList.id, '項目1')
      store.addItem(testList.id, '項目2')
      store.toggleIndentation(testList.id, store.lists[0].items[1].id) // 項目2を項目1の子に
      store.addItem(testList.id, '項目3')
    })

    it('clearCompletedItems でチェック済み項目を再帰的に削除', () => {
      // 項目2（子）と項目3（親）をチェック
      store.toggleItem(testList.id, store.lists[0].items[0].subItems![0].id)
      store.toggleItem(testList.id, store.lists[0].items[1].id)
      
      store.clearCompletedItems(testList.id)

      const items = store.lists[0].items
      expect(items).toHaveLength(1) // 項目3は削除された
      expect(items[0].text).toBe('項目1')
      expect(items[0].subItems).toHaveLength(0) // 項目2は削除された
    })

    it('clearCompletedItems で親がチェック済みなら子もろとも削除される', () => {
      store.toggleItem(testList.id, store.lists[0].items[0].id) // 項目1（親）をチェック
      
      store.clearCompletedItems(testList.id)

      expect(store.lists[0].items).toHaveLength(1)
      expect(store.lists[0].items[0].text).toBe('項目3')
    })

    it('checkAllItems で全項目（ネスト含む）をチェック', () => {
      store.checkAllItems(testList.id)

      expect(store.lists[0].items[0].checked).toBe(true)
      expect(store.lists[0].items[0].subItems![0].checked).toBe(true)
      expect(store.lists[0].items[1].checked).toBe(true)
    })

    it('uncheckAllItems で全項目（ネスト含む）のチェックを解除', () => {
      store.checkAllItems(testList.id)
      store.uncheckAllItems(testList.id)

      expect(store.lists[0].items[0].checked).toBe(false)
      expect(store.lists[0].items[0].subItems![0].checked).toBe(false)
      expect(store.lists[0].items[1].checked).toBe(false)
    })
  })

  describe('検索とフィルタリング', () => {
    let store: ReturnType<typeof useChecklistStore>

    beforeEach(() => {
      store = useChecklistStore()
      const list1 = store.createList('テストリスト')
      store.addItem(list1.id, '親タスク')
      store.addItem(list1.id, '子タスク - りんご')
      store.toggleIndentation(list1.id, store.lists[0].items[1].id)
    })

    it('searchLists でネストされた項目のテキストからも検索できる', () => {
      const results = store.searchLists('りんご')
      expect(results).toHaveLength(1)
    })
  })

  describe('算出プロパティ', () => {
    let store: ReturnType<typeof useChecklistStore>

    beforeEach(() => {
      store = useChecklistStore()
    })

    it('currentListProgress がネストされた項目も含めて計算される', () => {
      const list = store.createList('テストリスト')
      store.setCurrentList(list.id)
      
      store.addItem(list.id, '親')
      store.addItem(list.id, '子1')
      store.addItem(list.id, '子2')
      
      store.toggleIndentation(list.id, store.lists[0].items[1].id) // 子1
      store.toggleIndentation(list.id, store.lists[0].items[1].id) // 子2 (子1が移動したためインデックス1になる)
      
      // 最初は 0/3
      expect(store.currentListProgress!.total).toBe(3)
      expect(store.currentListProgress!.completed).toBe(0)

      // 子1だけチェック
      store.toggleItem(list.id, store.lists[0].items[0].subItems![0].id)
      
      expect(store.currentListProgress!.completed).toBe(1)
      expect(store.currentListProgress!.percentage).toBe(33)
    })
  })
})
