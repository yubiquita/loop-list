// チェックリストアプリケーションの型定義

export interface ChecklistItem {
  id: string
  text: string
  checked: boolean
}

export interface ChecklistList {
  id: string
  name: string
  items: ChecklistItem[]
  createdAt: string
}

export interface ChecklistData {
  lists: ChecklistList[]
}

// UI状態管理用の型
export interface UIState {
  currentScreen: 'list' | 'detail' | 'edit'
  currentListId: string | null
  showConfirmModal: boolean
  confirmAction: (() => void) | null
  confirmMessage: string
}

// 設定関連の型
export interface AppConfig {
  APP_NAME: string
  VERSION: string
  STORAGE_KEY: string
  AUTO_SAVE_DELAY: number
  ENTER_KEY_CODE: number
  ESCAPE_KEY_CODE: number
}

// 定数関連の型
export interface AppConstants {
  SCREEN_IDS: {
    LIST: string
    DETAIL: string
    EDIT: string
  }
  CSS_CLASSES: {
    HIDDEN: string
    SORTABLE_GHOST: string
    DRAG_HANDLE: string
    CHECKED: string
    PROGRESS_BAR: string
    PROGRESS_TEXT: string
    EMPTY_STATE: string
    BUTTON_PRIMARY: string
    BUTTON_SECONDARY: string
    BUTTON_DANGER: string
    MODAL_OVERLAY: string
    MODAL_CONTENT: string
  }
  MESSAGES: {
    CONFIRM_DELETE_LIST: string
    CONFIRM_DELETE_ITEM: string
    CONFIRM_DELETE_ALL: string
    EMPTY_LIST_NAME: string
    EMPTY_ITEM_TEXT: string
    COPY_SUCCESS: string
    COPY_ERROR: string
    EXPORT_SUCCESS: string
    IMPORT_SUCCESS: string
    IMPORT_ERROR: string
  }
  SELECTORS: {
    LIST_SCREEN: string
    DETAIL_SCREEN: string
    EDIT_SCREEN: string
    LIST_CONTAINER: string
    DETAIL_CONTAINER: string
    EDIT_CONTAINER: string
    LIST_NAME_INPUT: string
    ITEM_INPUT: string
    PROGRESS_BAR: string
    PROGRESS_TEXT: string
    ITEM_CONTAINER: string
    EMPTY_MESSAGE: string
    CONFIRM_MODAL: string
    CONFIRM_MESSAGE: string
    CONFIRM_YES: string
    CONFIRM_NO: string
  }
}

// イベント関連の型
export interface SortableEvent {
  oldIndex: number
  newIndex: number
  item: HTMLElement
}

export interface ClipboardOptions {
  text: string
  onSuccess?: () => void
  onError?: (error: Error) => void
}

// フォーカス管理用の型
export interface FocusManager {
  focusElement: (selector: string) => void
  focusLastAddedItem: () => void
  restoreFocus: () => void
}

// ユーティリティ関数の型
export interface Utils {
  generateId: () => string
  formatDate: (date: Date) => string
  escapeHtml: (text: string) => string
  debounce: <T extends (...args: any[]) => any>(func: T, delay: number) => T
  deepClone: <T>(obj: T) => T
  isValidString: (str: string) => boolean
  calculateProgress: (items: ChecklistItem[]) => { completed: number; total: number; percentage: number }
}

// ストレージ関連の型
export interface StorageManager {
  load: () => ChecklistData | null
  save: (data: ChecklistData) => void
  clear: () => void
  exists: () => boolean
}

// プログレス計算結果の型
export interface ProgressInfo {
  completed: number
  total: number
  percentage: number
}

// エラーハンドリング用の型
export interface AppError {
  code: string
  message: string
  details?: any
}

// コンポーネント Props 型
export interface ChecklistItemProps {
  item: ChecklistItem
  isDragging?: boolean
  showDragHandle?: boolean
  onUpdate?: (item: ChecklistItem) => void
  onDelete?: (itemId: string) => void
  onEnterKey?: () => void
}

export interface ProgressBarProps {
  progress: ProgressInfo
  showText?: boolean
  className?: string
}

export interface ConfirmModalProps {
  show: boolean
  message: string
  onConfirm: () => void
  onCancel: () => void
}