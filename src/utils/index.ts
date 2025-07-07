// ユーティリティ関数群

import type { ChecklistItem, ProgressInfo } from '../types'

/**
 * ユニークなIDを生成
 */
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

/**
 * 日付を文字列にフォーマット
 */
export function formatDate(date: Date): string {
  return date.toISOString()
}

/**
 * HTMLエスケープ処理
 */
export function escapeHtml(text: string): string {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

/**
 * デバウンス処理
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): T {
  let timeoutId: NodeJS.Timeout
  return ((...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func(...args), delay)
  }) as T
}

/**
 * ディープクローン
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj
  if (obj instanceof Date) return new Date(obj.getTime()) as T
  if (obj instanceof Array) return obj.map(item => deepClone(item)) as T
  if (typeof obj === 'object') {
    const cloned = {} as T
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        cloned[key] = deepClone(obj[key])
      }
    }
    return cloned
  }
  return obj
}

/**
 * 有効な文字列かチェック
 */
export function isValidString(str: string): boolean {
  return typeof str === 'string' && str.trim().length > 0
}

/**
 * プログレス計算
 */
export function calculateProgress(items: ChecklistItem[]): ProgressInfo {
  const total = items.length
  const completed = items.filter(item => item.checked).length
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0
  
  return {
    completed,
    total,
    percentage
  }
}

/**
 * 要素にフォーカスを設定
 */
export function focusElement(selector: string): void {
  setTimeout(() => {
    if (typeof document !== 'undefined') {
      const element = document.querySelector(selector) as HTMLElement
      if (element) {
        element.focus()
      }
    }
  }, 10)
}

/**
 * 最後に追加された項目にフォーカス
 */
export function focusLastAddedItem(): void {
  setTimeout(() => {
    if (typeof document !== 'undefined') {
      const items = document.querySelectorAll('.item-input')
      if (items.length > 0) {
        const lastItem = items[items.length - 1] as HTMLElement
        lastItem.focus()
      }
    }
  }, 10)
}

/**
 * タッチイベントの座標を取得
 */
export function getTouchCoordinates(event: TouchEvent): { x: number; y: number } {
  const touch = event.touches[0] || event.changedTouches[0]
  return {
    x: touch.clientX,
    y: touch.clientY
  }
}

/**
 * 要素の位置を取得
 */
export function getElementPosition(element: HTMLElement): { x: number; y: number; width: number; height: number } {
  const rect = element.getBoundingClientRect()
  return {
    x: rect.left,
    y: rect.top,
    width: rect.width,
    height: rect.height
  }
}

/**
 * スクロール位置を取得
 */
export function getScrollPosition(): { x: number; y: number } {
  return {
    x: window.pageXOffset || document.documentElement.scrollLeft,
    y: window.pageYOffset || document.documentElement.scrollTop
  }
}

/**
 * 配列要素の並び替え
 */
export function reorderArray<T>(array: T[], fromIndex: number, toIndex: number): T[] {
  const result = [...array]
  const [removed] = result.splice(fromIndex, 1)
  result.splice(toIndex, 0, removed)
  return result
}

/**
 * パフォーマンス測定
 */
export function measurePerformance<T>(name: string, fn: () => T): T {
  const start = performance.now()
  const result = fn()
  const end = performance.now()
  console.log(`${name}: ${end - start}ms`)
  return result
}

/**
 * 非同期処理の遅延
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * 安全なJSON.parse
 */
export function safeJSONParse<T>(json: string, defaultValue: T): T {
  try {
    return JSON.parse(json) as T
  } catch {
    return defaultValue
  }
}

/**
 * 安全なJSON.stringify
 */
export function safeJSONStringify(obj: any): string {
  try {
    return JSON.stringify(obj)
  } catch {
    return '{}'
  }
}