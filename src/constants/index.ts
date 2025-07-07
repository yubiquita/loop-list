// アプリケーション定数

import type { AppConfig, AppConstants } from '../types'

/**
 * アプリケーション設定
 */
export const CONFIG: AppConfig = {
  APP_NAME: 'Loop List',
  VERSION: '1.0.0',
  STORAGE_KEY: 'checklistData',
  AUTO_SAVE_DELAY: 500,
  ENTER_KEY_CODE: 13,
  ESCAPE_KEY_CODE: 27
}

/**
 * アプリケーション定数
 */
export const CONSTANTS: AppConstants = {
  SCREEN_IDS: {
    LIST: 'listScreen',
    DETAIL: 'detailScreen',
    EDIT: 'editScreen'
  },
  
  CSS_CLASSES: {
    HIDDEN: 'hidden',
    CHECKED: 'checked',
    PROGRESS_BAR: 'progress-bar',
    PROGRESS_TEXT: 'progress-text',
    EMPTY_STATE: 'empty-state',
    BUTTON_PRIMARY: 'btn-primary',
    BUTTON_SECONDARY: 'btn-secondary',
    BUTTON_DANGER: 'btn-danger',
    MODAL_OVERLAY: 'modal-overlay',
    MODAL_CONTENT: 'modal-content'
  },
  
  MESSAGES: {
    CONFIRM_DELETE_LIST: 'このリストを削除しますか？',
    CONFIRM_DELETE_ITEM: 'この項目を削除しますか？',
    CONFIRM_DELETE_ALL: 'すべてのデータを削除しますか？この操作は取り消せません。',
    EMPTY_LIST_NAME: 'リスト名を入力してください',
    EMPTY_ITEM_TEXT: '項目を入力してください',
    COPY_SUCCESS: 'クリップボードにコピーしました',
    COPY_ERROR: 'コピーに失敗しました',
    EXPORT_SUCCESS: 'データをエクスポートしました',
    IMPORT_SUCCESS: 'データをインポートしました',
    IMPORT_ERROR: 'データのインポートに失敗しました'
  },
  
  SELECTORS: {
    LIST_SCREEN: '#listScreen',
    DETAIL_SCREEN: '#detailScreen',
    EDIT_SCREEN: '#editScreen',
    LIST_CONTAINER: '.list-container',
    DETAIL_CONTAINER: '.detail-container',
    EDIT_CONTAINER: '.edit-container',
    LIST_NAME_INPUT: '.list-name-input',
    ITEM_INPUT: '.item-input',
    PROGRESS_BAR: '.progress-bar',
    PROGRESS_TEXT: '.progress-text',
    ITEM_CONTAINER: '.item-container',
    EMPTY_MESSAGE: '.empty-message',
    CONFIRM_MODAL: '.confirm-modal',
    CONFIRM_MESSAGE: '.confirm-message',
    CONFIRM_YES: '.confirm-yes',
    CONFIRM_NO: '.confirm-no'
  }
}


/**
 * デバッグ設定
 */
export const DEBUG_CONFIG = {
  ENABLED: false,
  LOG_LEVEL: 'info' as 'debug' | 'info' | 'warn' | 'error',
  PERFORMANCE_MONITORING: false,
  STORAGE_MONITORING: false
}

/**
 * アニメーション設定
 */
export const ANIMATION_CONFIG = {
  DURATION: {
    FAST: 150,
    NORMAL: 300,
    SLOW: 500
  },
  EASING: {
    EASE_OUT: 'ease-out',
    EASE_IN: 'ease-in',
    EASE_IN_OUT: 'ease-in-out'
  }
}

/**
 * レスポンシブ設定
 */
export const RESPONSIVE_CONFIG = {
  BREAKPOINTS: {
    MOBILE: 480,
    TABLET: 768,
    DESKTOP: 1024
  }
}

/**
 * テーマ設定
 */
export const THEME_CONFIG = {
  DEFAULT: 'light',
  STORAGE_KEY: 'theme',
  THEMES: ['light', 'dark'] as const
}

/**
 * フォーカス管理設定
 */
export const FOCUS_CONFIG = {
  DELAY: 10,
  RESTORE_DELAY: 100,
  SELECTORS: {
    FOCUSABLE: 'input, button, textarea, select, [tabindex]:not([tabindex="-1"])',
    FIRST_INPUT: 'input:first-of-type',
    LAST_INPUT: 'input:last-of-type'
  }
}

/**
 * パフォーマンス設定
 */
export const PERFORMANCE_CONFIG = {
  DEBOUNCE_DELAY: 300,
  THROTTLE_DELAY: 100,
  VIRTUAL_SCROLL_THRESHOLD: 100,
  BATCH_SIZE: 50
}

/**
 * エラーメッセージ
 */
export const ERROR_MESSAGES = {
  NETWORK: 'ネットワークエラーが発生しました',
  STORAGE: 'データの保存に失敗しました',
  VALIDATION: '入力データが無効です',
  UNKNOWN: '不明なエラーが発生しました'
}

/**
 * 成功メッセージ
 */
export const SUCCESS_MESSAGES = {
  SAVE: 'データを保存しました',
  DELETE: 'データを削除しました',
  COPY: 'クリップボードにコピーしました',
  IMPORT: 'データをインポートしました',
  EXPORT: 'データをエクスポートしました'
}