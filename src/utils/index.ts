// ユーティリティ関数群

import type { ChecklistItem, ProgressInfo } from '../types'

/**
 * ユニークなIDを生成
 */
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2)
}

/**
 * 日付を文字列にフォーマット
 */
export function formatDate(date: Date): string {
  return date.toISOString()
}

/**
 * プログレス計算（ネスト構造に対応）
 */
export function calculateProgress(items: ChecklistItem[]): ProgressInfo {
  let total = 0
  let completed = 0

  const countItems = (list: ChecklistItem[]) => {
    for (const item of list) {
      total++
      if (item.checked) completed++
      if (item.subItems && item.subItems.length > 0) {
        countItems(item.subItems)
      }
    }
  }

  countItems(items)

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
 * 配列要素の並び替え
 */
export function reorderArray<T>(array: T[], fromIndex: number, toIndex: number): T[] {
  const result = [...array]
  const [removed] = result.splice(fromIndex, 1)
  result.splice(toIndex, 0, removed)
  return result
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
