// ChecklistStore のテスト（既存42テストの移植）

import { describe, it, expect, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useChecklistStore } from '../../stores/checklist'
import type { ChecklistList } from '../../types'

describe('ChecklistStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    // localStorageをクリア
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

    it('initializeData でlocalStorageからデータを読み込む', async () => {
      // テストデータをlocalStorageに設定
      const testData = {
        lists: [{
          id: 'test-1',
          name: 'テストリスト',
          items: [],
          createdAt: '2024-01-01T00:00:00.000Z'
        }]
      }
      localStorage.setItem('checklistData', JSON.stringify(testData))

      const store = useChecklistStore()
      await store.initializeData()

      expect(store.lists).toHaveLength(1)
      expect(store.lists[0].name).toBe('テストリスト')
    })

    it('空のlocalStorageでも正常に動作する', async () => {
      const store = useChecklistStore()
      await store.initializeData()

      expect(store.lists).toEqual([])
      expect(store.error).toBe(null)
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
    it('createList で新しいリストを作成できる', () => {
      const store = useChecklistStore()
      const list = store.createList('新しいリスト')

      expect(list.name).toBe('新しいリスト')
      expect(list.items).toEqual([])
      expect(list.id).toBeTruthy()
      expect(list.createdAt).toBeTruthy()
      expect(store.lists).toHaveLength(1)
    })

    it('createList で空文字をトリムする', () => {
      const store = useChecklistStore()
      const list = store.createList('  テストリスト  ')

      expect(list.name).toBe('テストリスト')
    })

    it('updateList でリストを更新できる', () => {
      const store = useChecklistStore()
      const list = store.createList('元のリスト')
      
      store.updateList(list.id, { name: '更新されたリスト' })

      expect(store.lists[0].name).toBe('更新されたリスト')
    })

    it('updateList で存在しないリストは無視される', () => {
      const store = useChecklistStore()
      store.createList('テストリスト')

      store.updateList('non-existent', { name: '更新' })

      expect(store.lists[0].name).toBe('テストリスト')
    })

    it('deleteList でリストを削除できる', () => {
      const store = useChecklistStore()
      const list = store.createList('削除予定リスト')

      store.deleteList(list.id)

      expect(store.lists).toHaveLength(0)
    })

    it('deleteList で現在のリストを削除するとcurrentListIdをクリア', () => {
      const store = useChecklistStore()
      const list = store.createList('現在のリスト')
      store.setCurrentList(list.id)

      store.deleteList(list.id)

      expect(store.currentListId).toBe(null)
      expect(store.currentList).toBe(null)
    })

    it('duplicateList でリストを複製できる', () => {
      const store = useChecklistStore()
      const originalList = store.createList('元のリスト')
      store.addItem(originalList.id, '項目1')
      store.addItem(originalList.id, '項目2')

      const duplicatedList = store.duplicateList(originalList.id)

      expect(duplicatedList).toBeTruthy()
      expect(duplicatedList!.name).toBe('元のリスト (コピー)')
      expect(duplicatedList!.items).toHaveLength(2)
      expect(duplicatedList!.items[0].text).toBe('項目1')
      expect(duplicatedList!.items[0].checked).toBe(false) // チェック状態はリセット
      expect(duplicatedList!.id).not.toBe(originalList.id)
      expect(store.lists).toHaveLength(2)
    })

    it('duplicateList で存在しないリストはnullを返す', () => {
      const store = useChecklistStore()
      
      const result = store.duplicateList('non-existent')

      expect(result).toBe(null)
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
      expect(item!.checked).toBe(false)
      expect(item!.id).toBeTruthy()
      expect(store.lists[0].items).toHaveLength(1)
    })

    it('addItem でテキストをトリムする', () => {
      const item = store.addItem(testList.id, '  項目テキスト  ')

      expect(item!.text).toBe('項目テキスト')
    })

    it('addItem で存在しないリストはnullを返す', () => {
      const item = store.addItem('non-existent', 'テスト項目')

      expect(item).toBe(null)
    })

    it('updateItem で項目を更新できる', () => {
      const item = store.addItem(testList.id, '元の項目')!
      
      store.updateItem(testList.id, item.id, { text: '更新された項目' })

      expect(store.lists[0].items[0].text).toBe('更新された項目')
    })

    it('updateItem で存在しないリストは無視される', () => {
      const item = store.addItem(testList.id, 'テスト項目')!

      store.updateItem('non-existent', item.id, { text: '更新' })

      expect(store.lists[0].items[0].text).toBe('テスト項目')
    })

    it('updateItem で存在しない項目は無視される', () => {
      store.addItem(testList.id, 'テスト項目')

      store.updateItem(testList.id, 'non-existent', { text: '更新' })

      expect(store.lists[0].items[0].text).toBe('テスト項目')
    })

    it('deleteItem で項目を削除できる', () => {
      const item = store.addItem(testList.id, '削除予定項目')!

      store.deleteItem(testList.id, item.id)

      expect(store.lists[0].items).toHaveLength(0)
    })

    it('toggleItem でチェック状態を切り替えできる', () => {
      const item = store.addItem(testList.id, 'テスト項目')!

      store.toggleItem(testList.id, item.id)
      expect(store.lists[0].items[0].checked).toBe(true)

      store.toggleItem(testList.id, item.id)
      expect(store.lists[0].items[0].checked).toBe(false)
    })

    it('reorderItems で項目の順序を変更できる', () => {
      store.addItem(testList.id, '項目1')
      store.addItem(testList.id, '項目2')
      store.addItem(testList.id, '項目3')

      store.reorderItems(testList.id, 0, 2) // 最初の項目を最後に移動

      const items = store.lists[0].items
      expect(items[0].text).toBe('項目2')
      expect(items[1].text).toBe('項目3')
      expect(items[2].text).toBe('項目1')
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
      store.addItem(testList.id, '項目3')
      // 項目1と3をチェック
      store.toggleItem(testList.id, store.lists[0].items[0].id)
      store.toggleItem(testList.id, store.lists[0].items[2].id)
    })

    it('clearCompletedItems でチェック済み項目を削除', () => {
      store.clearCompletedItems(testList.id)

      const items = store.lists[0].items
      expect(items).toHaveLength(1)
      expect(items[0].text).toBe('項目2')
      expect(items[0].checked).toBe(false)
    })

    it('checkAllItems で全項目をチェック', () => {
      store.checkAllItems(testList.id)

      const items = store.lists[0].items
      expect(items.every(item => item.checked)).toBe(true)
    })

    it('uncheckAllItems で全項目のチェックを解除', () => {
      store.uncheckAllItems(testList.id)

      const items = store.lists[0].items
      expect(items.every(item => !item.checked)).toBe(true)
    })
  })

  describe('検索とフィルタリング', () => {
    let store: ReturnType<typeof useChecklistStore>

    beforeEach(() => {
      store = useChecklistStore()
      
      const list1 = store.createList('買い物リスト')
      store.addItem(list1.id, 'りんご')
      store.addItem(list1.id, 'バナナ')

      const list2 = store.createList('仕事タスク')
      store.addItem(list2.id, 'メール確認')
      store.addItem(list2.id, 'りんごの件')
    })

    it('searchLists でリスト名から検索', () => {
      const results = store.searchLists('買い物')

      expect(results).toHaveLength(1)
      expect(results[0].name).toBe('買い物リスト')
    })

    it('searchLists で項目テキストから検索', () => {
      const results = store.searchLists('りんご')

      expect(results).toHaveLength(2) // 両方のリストにりんごが含まれる
    })

    it('searchLists で空文字列は全リストを返す', () => {
      const results = store.searchLists('')

      expect(results).toHaveLength(2)
    })

    it('searchLists で見つからない場合は空配列', () => {
      const results = store.searchLists('存在しない')

      expect(results).toHaveLength(0)
    })

  })

  describe('算出プロパティ', () => {
    let store: ReturnType<typeof useChecklistStore>

    beforeEach(() => {
      store = useChecklistStore()
    })

    it('currentList が正しく算出される', () => {
      expect(store.currentList).toBe(null)

      const list = store.createList('現在のリスト')
      store.setCurrentList(list.id)

      expect(store.currentList).toStrictEqual(list)
      expect(store.currentList!.name).toBe('現在のリスト')
    })

    it('totalLists が正しく算出される', () => {
      expect(store.totalLists).toBe(0)

      store.createList('リスト1')
      expect(store.totalLists).toBe(1)

      store.createList('リスト2')
      expect(store.totalLists).toBe(2)
    })

    it('currentListProgress が正しく算出される', () => {
      expect(store.currentListProgress).toBe(null)

      const list = store.createList('テストリスト')
      store.setCurrentList(list.id)
      
      // 項目なしの場合
      expect(store.currentListProgress!.total).toBe(0)
      expect(store.currentListProgress!.completed).toBe(0)
      expect(store.currentListProgress!.percentage).toBe(0)

      // 項目を追加
      store.addItem(list.id, '項目1')
      store.addItem(list.id, '項目2')
      store.toggleItem(list.id, store.lists[0].items[0].id)

      expect(store.currentListProgress!.total).toBe(2)
      expect(store.currentListProgress!.completed).toBe(1)
      expect(store.currentListProgress!.percentage).toBe(50)
    })
  })

  describe('ユーティリティ機能', () => {
    it('setCurrentList で現在のリストを設定', () => {
      const store = useChecklistStore()
      const list = store.createList('テストリスト')

      store.setCurrentList(list.id)
      expect(store.currentListId).toBe(list.id)

      store.setCurrentList(null)
      expect(store.currentListId).toBe(null)
    })

    it('clearAllData で全データを削除', () => {
      const store = useChecklistStore()
      store.createList('リスト1')
      store.createList('リスト2')
      store.setCurrentList(store.lists[0].id)

      store.clearAllData()

      expect(store.lists).toHaveLength(0)
      expect(store.currentListId).toBe(null)
    })

    it('clearError でエラーを削除', () => {
      const store = useChecklistStore()
      store.error = 'テストエラー'

      store.clearError()

      expect(store.error).toBe(null)
    })
  })

  describe('データ永続化', () => {
    it('リスト作成時にlocalStorageに保存される', () => {
      const store = useChecklistStore()
      store.createList('永続化テスト')

      const savedDataString = localStorage.getItem('checklistData')
      expect(savedDataString).toBeTruthy()
      
      const savedData = JSON.parse(savedDataString!)
      expect(savedData.lists).toHaveLength(1)
      expect(savedData.lists[0].name).toBe('永続化テスト')
    })

    it('項目追加時にlocalStorageに保存される', () => {
      const store = useChecklistStore()
      const list = store.createList('テストリスト')
      store.addItem(list.id, 'テスト項目')

      const savedDataString = localStorage.getItem('checklistData')
      expect(savedDataString).toBeTruthy()
      
      const savedData = JSON.parse(savedDataString!)
      expect(savedData.lists).toHaveLength(1)
      expect(savedData.lists[0].items).toHaveLength(1)
      expect(savedData.lists[0].items[0].text).toBe('テスト項目')
    })
  })
})