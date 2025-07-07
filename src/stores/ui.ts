// UI状態管理用のPinia store

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { focusElement, focusLastAddedItem } from '../utils'

export const useUIStore = defineStore('ui', () => {
  // 状態
  const currentScreen = ref<'list' | 'detail' | 'edit'>('list')
  const showConfirmModal = ref(false)
  const confirmMessage = ref('')
  const confirmAction = ref<(() => void) | null>(null)
  const isLoading = ref(false)
  const loadingMessage = ref('')
  const lastFocusedElement = ref<string | null>(null)

  // 算出プロパティ
  const isListScreen = computed(() => currentScreen.value === 'list')
  const isDetailScreen = computed(() => currentScreen.value === 'detail')
  const isEditScreen = computed(() => currentScreen.value === 'edit')

  // 画面遷移
  const showListScreen = () => {
    currentScreen.value = 'list'
  }

  const showDetailScreen = () => {
    currentScreen.value = 'detail'
  }

  const showEditScreen = () => {
    currentScreen.value = 'edit'
    // 編集画面でリスト名入力にフォーカス
    setTimeout(() => {
      focusElement('.list-name-input')
    }, 50)
  }

  // 確認モーダル
  const showConfirm = (message: string, action: () => void) => {
    confirmMessage.value = message
    confirmAction.value = action
    showConfirmModal.value = true
  }

  const confirmYes = () => {
    if (confirmAction.value) {
      confirmAction.value()
    }
    hideConfirm()
  }

  const confirmNo = () => {
    hideConfirm()
  }

  const hideConfirm = () => {
    showConfirmModal.value = false
    confirmMessage.value = ''
    confirmAction.value = null
  }

  // ローディング状態
  const startLoading = (message: string = '読み込み中...') => {
    isLoading.value = true
    loadingMessage.value = message
  }

  const stopLoading = () => {
    isLoading.value = false
    loadingMessage.value = ''
  }

  // フォーカス管理
  const saveFocus = (selector: string) => {
    lastFocusedElement.value = selector
  }

  const restoreFocus = () => {
    if (lastFocusedElement.value) {
      focusElement(lastFocusedElement.value)
      lastFocusedElement.value = null
    }
  }

  const focusListNameInput = () => {
    focusElement('.list-name-input')
  }

  const focusItemInput = () => {
    focusElement('.item-input')
  }

  const focusLastItem = () => {
    focusLastAddedItem()
  }

  // キーボードイベント処理
  const handleEscapeKey = () => {
    if (showConfirmModal.value) {
      confirmNo()
      return true
    }
    
    if (currentScreen.value === 'edit' || currentScreen.value === 'detail') {
      showListScreen()
      return true
    }
    
    return false
  }

  const handleEnterKey = (event: KeyboardEvent, context: 'list-name' | 'item-input') => {
    if (event.isComposing) return false
    
    switch (context) {
      case 'list-name':
        // リスト名入力でEnterが押された場合、項目入力にフォーカス
        event.preventDefault()
        setTimeout(() => {
          focusItemInput()
        }, 50)
        return true
        
      case 'item-input':
        // 項目入力でEnterが押された場合、新しい項目を追加してフォーカス
        event.preventDefault()
        setTimeout(() => {
          focusLastItem()
        }, 100)
        return true
        
      default:
        return false
    }
  }

  // モバイル対応
  const isMobile = ref(false)
  const updateMobileState = () => {
    isMobile.value = window.innerWidth < 480
  }

  // 初期化時にモバイル状態を設定
  if (typeof window !== 'undefined') {
    updateMobileState()
    window.addEventListener('resize', updateMobileState)
  }

  // 画面サイズ変更の監視
  const isNarrowScreen = computed(() => isMobile.value)

  // スクロール管理
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const scrollToElement = (selector: string) => {
    const element = document.querySelector(selector)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }

  // アニメーション状態
  const isAnimating = ref(false)
  
  const startAnimation = () => {
    isAnimating.value = true
  }
  
  const stopAnimation = () => {
    isAnimating.value = false
  }

  // エラー状態
  const error = ref<string | null>(null)
  const showError = (message: string) => {
    error.value = message
    setTimeout(() => {
      error.value = null
    }, 5000)
  }

  const clearError = () => {
    error.value = null
  }

  // 成功メッセージ
  const successMessage = ref<string | null>(null)
  const showSuccess = (message: string) => {
    successMessage.value = message
    setTimeout(() => {
      successMessage.value = null
    }, 3000)
  }

  const clearSuccess = () => {
    successMessage.value = null
  }

  // 状態のリセット
  const resetUIState = () => {
    currentScreen.value = 'list'
    hideConfirm()
    stopLoading()
    lastFocusedElement.value = null
    stopAnimation()
    clearError()
    clearSuccess()
  }

  return {
    // 状態
    currentScreen,
    showConfirmModal,
    confirmMessage,
    isLoading,
    loadingMessage,
    isMobile,
    isAnimating,
    error,
    successMessage,
    lastFocusedElement,
    
    // 算出プロパティ
    isListScreen,
    isDetailScreen,
    isEditScreen,
    isNarrowScreen,
    
    // 画面遷移
    showListScreen,
    showDetailScreen,
    showEditScreen,
    
    // 確認モーダル
    showConfirm,
    confirmYes,
    confirmNo,
    hideConfirm,
    
    // ローディング
    startLoading,
    stopLoading,
    
    // フォーカス管理
    saveFocus,
    restoreFocus,
    focusListNameInput,
    focusItemInput,
    focusLastItem,
    
    // キーボードイベント
    handleEscapeKey,
    handleEnterKey,
    
    // ユーティリティ
    updateMobileState,
    scrollToTop,
    scrollToElement,
    startAnimation,
    stopAnimation,
    showError,
    clearError,
    showSuccess,
    clearSuccess,
    resetUIState
  }
})