// UIStore のテスト（既存28テストの移植）

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useUIStore } from '../../stores/ui'

// windowオブジェクトのモック
Object.defineProperty(window, 'innerWidth', {
  writable: true,
  configurable: true,
  value: 1024,
})

// addEventListener のモック
vi.spyOn(window, 'addEventListener')
vi.spyOn(window, 'removeEventListener')

describe('UIStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    window.innerWidth = 1024
  })

  describe('初期状態', () => {
    it('初期状態が正しく設定される', () => {
      const store = useUIStore()
      
      expect(store.currentScreen).toBe('list')
      expect(store.showConfirmModal).toBe(false)
      expect(store.confirmMessage).toBe('')
      expect(store.isLoading).toBe(false)
      expect(store.loadingMessage).toBe('')
      expect(store.isMobile).toBe(false)
      expect(store.isAnimating).toBe(false)
      expect(store.error).toBe(null)
      expect(store.successMessage).toBe(null)
    })

    it('算出プロパティが正しく動作する', () => {
      const store = useUIStore()
      
      expect(store.isListScreen).toBe(true)
      expect(store.isDetailScreen).toBe(false)
      expect(store.isEditScreen).toBe(false)
      expect(store.isNarrowScreen).toBe(false)
    })
  })

  describe('画面遷移', () => {
    it('showListScreen でリスト画面に遷移', () => {
      const store = useUIStore()
      store.currentScreen = 'detail'

      store.showListScreen()

      expect(store.currentScreen).toBe('list')
      expect(store.isListScreen).toBe(true)
      expect(store.isDetailScreen).toBe(false)
      expect(store.isEditScreen).toBe(false)
    })

    it('showDetailScreen で詳細画面に遷移', () => {
      const store = useUIStore()

      store.showDetailScreen()

      expect(store.currentScreen).toBe('detail')
      expect(store.isListScreen).toBe(false)
      expect(store.isDetailScreen).toBe(true)
      expect(store.isEditScreen).toBe(false)
    })

    it('showEditScreen で編集画面に遷移', () => {
      const store = useUIStore()

      store.showEditScreen()

      expect(store.currentScreen).toBe('edit')
      expect(store.isListScreen).toBe(false)
      expect(store.isDetailScreen).toBe(false)
      expect(store.isEditScreen).toBe(true)
    })
  })

  describe('確認モーダル', () => {
    it('showConfirm で確認モーダルを表示', () => {
      const store = useUIStore()
      const mockAction = vi.fn()

      store.showConfirm('テストメッセージ', mockAction)

      expect(store.showConfirmModal).toBe(true)
      expect(store.confirmMessage).toBe('テストメッセージ')
    })

    it('confirmYes でアクションを実行してモーダルを閉じる', () => {
      const store = useUIStore()
      const mockAction = vi.fn()
      store.showConfirm('テスト', mockAction)

      store.confirmYes()

      expect(mockAction).toHaveBeenCalled()
      expect(store.showConfirmModal).toBe(false)
      expect(store.confirmMessage).toBe('')
    })

    it('confirmNo でアクションを実行せずにモーダルを閉じる', () => {
      const store = useUIStore()
      const mockAction = vi.fn()
      store.showConfirm('テスト', mockAction)

      store.confirmNo()

      expect(mockAction).not.toHaveBeenCalled()
      expect(store.showConfirmModal).toBe(false)
      expect(store.confirmMessage).toBe('')
    })

    it('hideConfirm でモーダルを閉じる', () => {
      const store = useUIStore()
      const mockAction = vi.fn()
      store.showConfirm('テスト', mockAction)

      store.hideConfirm()

      expect(store.showConfirmModal).toBe(false)
      expect(store.confirmMessage).toBe('')
    })
  })

  describe('ローディング状態', () => {
    it('startLoading でローディング状態を開始', () => {
      const store = useUIStore()

      store.startLoading('読み込み中...')

      expect(store.isLoading).toBe(true)
      expect(store.loadingMessage).toBe('読み込み中...')
    })

    it('startLoading でデフォルトメッセージを使用', () => {
      const store = useUIStore()

      store.startLoading()

      expect(store.isLoading).toBe(true)
      expect(store.loadingMessage).toBe('読み込み中...')
    })

    it('stopLoading でローディング状態を終了', () => {
      const store = useUIStore()
      store.startLoading('テスト')

      store.stopLoading()

      expect(store.isLoading).toBe(false)
      expect(store.loadingMessage).toBe('')
    })
  })

  describe('キーボードイベント処理', () => {
    it('handleEscapeKey で確認モーダルを閉じる', () => {
      const store = useUIStore()
      const mockAction = vi.fn()
      store.showConfirm('テスト', mockAction)

      const result = store.handleEscapeKey()

      expect(result).toBe(true)
      expect(store.showConfirmModal).toBe(false)
    })

    it('handleEscapeKey で編集画面からリスト画面に戻る', () => {
      const store = useUIStore()
      store.currentScreen = 'edit'

      const result = store.handleEscapeKey()

      expect(result).toBe(true)
      expect(store.currentScreen).toBe('list')
    })

    it('handleEscapeKey で詳細画面からリスト画面に戻る', () => {
      const store = useUIStore()
      store.currentScreen = 'detail'

      const result = store.handleEscapeKey()

      expect(result).toBe(true)
      expect(store.currentScreen).toBe('list')
    })

    it('handleEscapeKey でリスト画面では何もしない', () => {
      const store = useUIStore()
      store.currentScreen = 'list'

      const result = store.handleEscapeKey()

      expect(result).toBe(false)
      expect(store.currentScreen).toBe('list')
    })

    it('handleEnterKey でリスト名入力時の処理', () => {
      const store = useUIStore()
      const mockEvent = { 
        isComposing: false, 
        preventDefault: vi.fn() 
      } as unknown as KeyboardEvent

      const result = store.handleEnterKey(mockEvent, 'list-name')

      expect(result).toBe(true)
      expect(mockEvent.preventDefault).toHaveBeenCalled()
    })

    it('handleEnterKey で項目入力時の処理', () => {
      const store = useUIStore()
      const mockEvent = { 
        isComposing: false, 
        preventDefault: vi.fn() 
      } as unknown as KeyboardEvent

      const result = store.handleEnterKey(mockEvent, 'item-input')

      expect(result).toBe(true)
      expect(mockEvent.preventDefault).toHaveBeenCalled()
    })

    it('handleEnterKey でIME入力中は処理しない', () => {
      const store = useUIStore()
      const mockEvent = { 
        isComposing: true, 
        preventDefault: vi.fn() 
      } as unknown as KeyboardEvent

      const result = store.handleEnterKey(mockEvent, 'list-name')

      expect(result).toBe(false)
      expect(mockEvent.preventDefault).not.toHaveBeenCalled()
    })
  })

  describe('モバイル対応', () => {
    it('updateMobileState で画面幅に応じてモバイル状態を更新', () => {
      const store = useUIStore()
      
      // デスクトップサイズ
      window.innerWidth = 1024
      store.updateMobileState()
      expect(store.isMobile).toBe(false)
      expect(store.isNarrowScreen).toBe(false)

      // モバイルサイズ
      window.innerWidth = 400
      store.updateMobileState()
      expect(store.isMobile).toBe(true)
      expect(store.isNarrowScreen).toBe(true)
    })

    it('画面幅480px以下でモバイル判定', () => {
      const store = useUIStore()
      
      window.innerWidth = 480
      store.updateMobileState()
      expect(store.isMobile).toBe(false)

      window.innerWidth = 479
      store.updateMobileState()
      expect(store.isMobile).toBe(true)
    })
  })

  describe('スクロール管理', () => {
    it('scrollToTop でページトップにスクロール', () => {
      const store = useUIStore()
      const mockScrollTo = vi.fn()
      window.scrollTo = mockScrollTo

      store.scrollToTop()

      expect(mockScrollTo).toHaveBeenCalledWith({ 
        top: 0, 
        behavior: 'smooth' 
      })
    })

    it('scrollToElement で指定要素にスクロール', () => {
      const store = useUIStore()
      const mockElement = {
        scrollIntoView: vi.fn()
      } as unknown as Element
      const mockQuerySelector = vi.fn().mockReturnValue(mockElement)
      document.querySelector = mockQuerySelector

      store.scrollToElement('.test-element')

      expect(mockQuerySelector).toHaveBeenCalledWith('.test-element')
      expect(mockElement.scrollIntoView).toHaveBeenCalledWith({
        behavior: 'smooth',
        block: 'center'
      })
    })

    it('scrollToElement で要素が見つからない場合は何もしない', () => {
      const store = useUIStore()
      const mockQuerySelector = vi.fn().mockReturnValue(null)
      document.querySelector = mockQuerySelector

      store.scrollToElement('.non-existent')

      expect(mockQuerySelector).toHaveBeenCalledWith('.non-existent')
    })
  })

  describe('アニメーション状態', () => {
    it('startAnimation でアニメーション状態を開始', () => {
      const store = useUIStore()

      store.startAnimation()

      expect(store.isAnimating).toBe(true)
    })

    it('stopAnimation でアニメーション状態を終了', () => {
      const store = useUIStore()
      store.startAnimation()

      store.stopAnimation()

      expect(store.isAnimating).toBe(false)
    })
  })

  describe('エラー状態', () => {
    it('showError でエラーメッセージを表示', () => {
      const store = useUIStore()

      store.showError('テストエラー')

      expect(store.error).toBe('テストエラー')
    })

    it('clearError でエラーメッセージをクリア', () => {
      const store = useUIStore()
      store.showError('テストエラー')

      store.clearError()

      expect(store.error).toBe(null)
    })

    it('showError で5秒後に自動的にエラーをクリア', async () => {
      const store = useUIStore()
      vi.useFakeTimers()

      store.showError('自動クリアテスト')
      expect(store.error).toBe('自動クリアテスト')

      vi.advanceTimersByTime(5000)
      expect(store.error).toBe(null)

      vi.useRealTimers()
    })
  })

  describe('成功メッセージ', () => {
    it('showSuccess で成功メッセージを表示', () => {
      const store = useUIStore()

      store.showSuccess('テスト成功')

      expect(store.successMessage).toBe('テスト成功')
    })

    it('clearSuccess で成功メッセージをクリア', () => {
      const store = useUIStore()
      store.showSuccess('テスト成功')

      store.clearSuccess()

      expect(store.successMessage).toBe(null)
    })

    it('showSuccess で3秒後に自動的にメッセージをクリア', async () => {
      const store = useUIStore()
      vi.useFakeTimers()

      store.showSuccess('自動クリア成功')
      expect(store.successMessage).toBe('自動クリア成功')

      vi.advanceTimersByTime(3000)
      expect(store.successMessage).toBe(null)

      vi.useRealTimers()
    })
  })

  describe('状態リセット', () => {
    it('resetUIState ですべての状態をリセット', () => {
      const store = useUIStore()
      
      // 状態を変更
      store.currentScreen = 'edit'
      store.showConfirm('テスト', () => {})
      store.startLoading('テスト')
      store.startAnimation()
      store.showError('エラー')
      store.showSuccess('成功')

      store.resetUIState()

      expect(store.currentScreen).toBe('list')
      expect(store.showConfirmModal).toBe(false)
      expect(store.isLoading).toBe(false)
      expect(store.isAnimating).toBe(false)
      expect(store.error).toBe(null)
      expect(store.successMessage).toBe(null)
    })
  })

  describe('フォーカス管理', () => {
    it('saveFocus でフォーカス位置を保存', () => {
      const store = useUIStore()

      store.saveFocus('.test-selector')

      expect(store.lastFocusedElement).toBe('.test-selector')
    })

    it('restoreFocus で保存されたフォーカスを復元', async () => {
      const store = useUIStore()
      const mockElement = { focus: vi.fn() } as unknown as HTMLElement
      const mockQuerySelector = vi.fn().mockReturnValue(mockElement)
      document.querySelector = mockQuerySelector

      store.saveFocus('.test-selector')
      store.restoreFocus()

      // setTimeout内で実行されるため少し待機
      await new Promise(resolve => setTimeout(resolve, 20))

      expect(mockQuerySelector).toHaveBeenCalledWith('.test-selector')
      expect(store.lastFocusedElement).toBe(null)
    })

    it('focusListNameInput でリスト名入力にフォーカス', async () => {
      const store = useUIStore()
      const mockElement = { focus: vi.fn() } as unknown as HTMLElement
      const mockQuerySelector = vi.fn().mockReturnValue(mockElement)
      document.querySelector = mockQuerySelector

      store.focusListNameInput()

      // setTimeout内で実行されるため少し待機
      await new Promise(resolve => setTimeout(resolve, 20))

      expect(mockQuerySelector).toHaveBeenCalledWith('.list-name-input')
    })

    it('focusItemInput で項目入力にフォーカス', async () => {
      const store = useUIStore()
      const mockElement = { focus: vi.fn() } as unknown as HTMLElement
      const mockQuerySelector = vi.fn().mockReturnValue(mockElement)
      document.querySelector = mockQuerySelector

      store.focusItemInput()

      // setTimeout内で実行されるため少し待機
      await new Promise(resolve => setTimeout(resolve, 20))

      expect(mockQuerySelector).toHaveBeenCalledWith('.item-input')
    })
  })
})